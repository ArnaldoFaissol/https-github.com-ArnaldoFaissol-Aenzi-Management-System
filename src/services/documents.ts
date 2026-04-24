import { supabase } from '@/lib/supabase/client'

const BUCKET = 'asset-documents'

export type AssetDocument = {
  id: string
  asset_id: string
  name: string
  category: string | null
  storage_path: string
  mime_type: string | null
  size_bytes: number | null
  uploaded_by: string | null
  created_at: string
}

/** List documents for an asset, newest first. */
export const getAssetDocuments = async (assetId: string): Promise<AssetDocument[]> => {
  try {
    const { data, error } = await supabase
      .from('asset_documents')
      .select('*')
      .eq('asset_id', assetId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  } catch (e) {
    console.error('getAssetDocuments error:', e)
    return []
  }
}

/**
 * Upload a document: PUT into Storage then record metadata in DB.
 * Accepts either a File (preferred) or a FormData (backwards-compat with the
 * PocketBase-based caller signature).
 */
export const uploadAssetDocument = async (
  arg: FormData | { assetId: string; file: File; name?: string; category?: string },
): Promise<AssetDocument> => {
  let assetId: string
  let file: File
  let name: string | undefined
  let category: string | undefined

  if (arg instanceof FormData) {
    assetId = String(arg.get('asset_id') ?? '')
    file = arg.get('file') as File
    name = (arg.get('name') as string) || undefined
    category = (arg.get('category') as string) || undefined
  } else {
    assetId = arg.assetId
    file = arg.file
    name = arg.name
    category = arg.category
  }

  if (!assetId) throw new Error('asset_id is required')
  if (!file) throw new Error('file is required')

  const safeName = (name || file.name).replace(/[^a-zA-Z0-9._-]/g, '_')
  const storagePath = `${assetId}/${Date.now()}-${safeName}`

  // 1. Upload to Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { upsert: false, contentType: file.type || undefined })
  if (uploadError) throw uploadError

  // 2. Record metadata
  const { data: userRes } = await supabase.auth.getUser()
  const uploadedBy = userRes?.user?.id ?? null

  const { data, error } = await supabase
    .from('asset_documents')
    .insert({
      asset_id: assetId,
      name: name || file.name,
      category: category || null,
      storage_path: storagePath,
      mime_type: file.type || null,
      size_bytes: file.size || null,
      uploaded_by: uploadedBy,
    })
    .select()
    .single()

  if (error) {
    // Rollback: try to remove the uploaded file
    await supabase.storage.from(BUCKET).remove([storagePath]).catch(() => {})
    throw error
  }

  return data as AssetDocument
}

/** Delete a document: metadata row + storage object. */
export const deleteAssetDocument = async (id: string): Promise<void> => {
  const { data: doc, error: findErr } = await supabase
    .from('asset_documents')
    .select('storage_path')
    .eq('id', id)
    .single()
  if (findErr) throw findErr

  const { error: rmErr } = await supabase.from('asset_documents').delete().eq('id', id)
  if (rmErr) throw rmErr

  if (doc?.storage_path) {
    await supabase.storage.from(BUCKET).remove([doc.storage_path]).catch((e) => {
      console.warn('storage remove falhou (metadata ja deletada):', e)
    })
  }
}

/**
 * Get a public/signed URL to the document.
 * Bucket is private, so we return a signed URL valid for 1 hour.
 * Falls back to empty string on error to keep render stable.
 */
export const getDocumentUrl = async (record: AssetDocument | { storage_path: string }): Promise<string> => {
  try {
    const path = record.storage_path
    if (!path) return ''
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600)
    if (error) throw error
    return data?.signedUrl || ''
  } catch (e) {
    console.error('getDocumentUrl error:', e)
    return ''
  }
}
