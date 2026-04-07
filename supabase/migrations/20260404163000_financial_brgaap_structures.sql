ALTER TABLE public.billing_cycles
ADD COLUMN IF NOT EXISTS asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS taxes NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS deductions NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS opex NUMERIC DEFAULT 0;

DO $do$
DECLARE
  asset_rec RECORD;
BEGIN
  -- Update existing general region records with estimated taxes/opex
  UPDATE public.billing_cycles
  SET taxes = revenue * 0.15,
      deductions = revenue * 0.05,
      opex = revenue * 0.40
  WHERE asset_id IS NULL AND (taxes IS NULL OR taxes = 0);

  -- Create some asset-specific records for drill-down
  FOR asset_rec IN SELECT id, region, contract_value FROM public.assets LIMIT 5 LOOP
    INSERT INTO public.billing_cycles (id, month, region, revenue, taxes, deductions, opex, asset_id)
    VALUES 
      (gen_random_uuid(), '2024-01-01', COALESCE(asset_rec.region, 'SP'), 4500, 675, 225, 1200, asset_rec.id),
      (gen_random_uuid(), '2024-02-01', COALESCE(asset_rec.region, 'SP'), 4800, 720, 240, 1200, asset_rec.id),
      (gen_random_uuid(), '2024-03-01', COALESCE(asset_rec.region, 'SP'), 5100, 765, 255, 1250, asset_rec.id)
    ON CONFLICT DO NOTHING;
  END LOOP;
END $do$;
