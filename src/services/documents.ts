import pb from '@/lib/pocketbase/client'

export const getAssetDocuments = async (assetId: string) => {
  try {
    return await pb.collection('asset_documents').getFullList({
      filter: `asset_id = "${assetId}"`,
      sort: '-created',
    })
  } catch (e) {
    console.error(e)
    return []
  }
}

export const uploadAssetDocument = async (formData: FormData) => {
  return await pb.collection('asset_documents').create(formData)
}

export const deleteAssetDocument = async (id: string) => {
  return await pb.collection('asset_documents').delete(id)
}

export const getDocumentUrl = (record: any) => {
  return pb.files.getURL(record, record.file)
}
