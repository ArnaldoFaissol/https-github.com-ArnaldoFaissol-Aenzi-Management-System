-- ============================================================
-- Audit fixes — schema gaps found during PocketBase → Supabase migration
-- Run this via Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Add missing column used by Billing/Governance pages
ALTER TABLE public.assets
  ADD COLUMN IF NOT EXISTS monthly_revenue NUMERIC;

-- 2. Ensure arnaldo@herovp.com has superuser role in user_metadata
-- (fixes usePermissions hook that reads role from JWT)
UPDATE auth.users
SET raw_user_meta_data =
  COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "superuser", "name": "Arnaldo Faissol"}'::jsonb,
    updated_at = NOW()
WHERE email = 'arnaldo@herovp.com';

-- Also sync into public.users (idempotent)
INSERT INTO public.users (id, email, name, role)
SELECT id, email, 'Arnaldo Faissol', 'superuser'
FROM auth.users
WHERE email = 'arnaldo@herovp.com'
ON CONFLICT (id) DO UPDATE SET role = 'superuser', name = 'Arnaldo Faissol';

-- 3. Create asset_documents table (mirrors PocketBase collection)
CREATE TABLE IF NOT EXISTS public.asset_documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id    UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  category    TEXT,
  storage_path TEXT NOT NULL,  -- path inside the asset-documents bucket
  mime_type   TEXT,
  size_bytes  BIGINT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_asset_documents_asset_id ON public.asset_documents(asset_id);

ALTER TABLE public.asset_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "asset_docs_select_all" ON public.asset_documents;
CREATE POLICY "asset_docs_select_all" ON public.asset_documents
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "asset_docs_insert_admin" ON public.asset_documents;
CREATE POLICY "asset_docs_insert_admin" ON public.asset_documents
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('superuser','admin'))
  );

DROP POLICY IF EXISTS "asset_docs_delete_admin" ON public.asset_documents;
CREATE POLICY "asset_docs_delete_admin" ON public.asset_documents
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('superuser','admin'))
  );

-- 4. Create storage bucket for asset documents (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('asset-documents', 'asset-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: authenticated can read, admin/superuser can upload/delete
DROP POLICY IF EXISTS "asset_docs_storage_read" ON storage.objects;
CREATE POLICY "asset_docs_storage_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'asset-documents');

DROP POLICY IF EXISTS "asset_docs_storage_write" ON storage.objects;
CREATE POLICY "asset_docs_storage_write" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'asset-documents'
    AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('superuser','admin'))
  );

DROP POLICY IF EXISTS "asset_docs_storage_delete" ON storage.objects;
CREATE POLICY "asset_docs_storage_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'asset-documents'
    AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('superuser','admin'))
  );

-- 5. Ensure realtime publication includes the new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.asset_documents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.billing_cycles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rollout_backlog;
ALTER PUBLICATION supabase_realtime ADD TABLE public.asset_transitions;
