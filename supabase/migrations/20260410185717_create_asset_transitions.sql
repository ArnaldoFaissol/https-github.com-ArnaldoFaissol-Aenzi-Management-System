CREATE TABLE IF NOT EXISTS public.asset_transitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE NOT NULL,
    from_step TEXT,
    to_step TEXT NOT NULL,
    changed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.asset_transitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_all_transitions" ON public.asset_transitions;
CREATE POLICY "authenticated_all_transitions" ON public.asset_transitions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
