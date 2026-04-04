DO $$
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'arnaldo@herovp.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'arnaldo@herovp.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Arnaldo Faissol"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fcu_code TEXT UNIQUE,
  asset_name TEXT NOT NULL,
  asset_status TEXT NOT NULL,
  region TEXT,
  uf_code TEXT,
  city TEXT,
  installation_date DATE,
  latitude NUMERIC,
  longitude NUMERIC,
  battery_level INTEGER DEFAULT 100,
  contract_value NUMERIC(14,2),
  uptime NUMERIC(5,2) DEFAULT 100.0,
  kwh_total NUMERIC DEFAULT 0,
  mttr_hours NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.telemetry_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  kwh NUMERIC NOT NULL,
  battery_level INTEGER NOT NULL,
  is_online BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.billing_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month DATE NOT NULL,
  region TEXT NOT NULL,
  revenue NUMERIC(14,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rollout_backlog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT NOT NULL,
  site_name TEXT NOT NULL,
  region TEXT NOT NULL,
  target_date DATE,
  status TEXT DEFAULT 'Pendente',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemetry_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rollout_backlog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_all_assets" ON public.assets;
CREATE POLICY "authenticated_all_assets" ON public.assets FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_telemetry" ON public.telemetry_history;
CREATE POLICY "authenticated_all_telemetry" ON public.telemetry_history FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_billing" ON public.billing_cycles;
CREATE POLICY "authenticated_all_billing" ON public.billing_cycles FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_rollout" ON public.rollout_backlog;
CREATE POLICY "authenticated_all_rollout" ON public.rollout_backlog FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.calculate_roi(capex NUMERIC, savings NUMERIC, opex NUMERIC)
RETURNS NUMERIC AS $$
DECLARE
  net_savings NUMERIC;
BEGIN
  net_savings := savings - opex;
  IF net_savings <= 0 THEN
    RETURN 0;
  END IF;
  RETURN ROUND((capex / net_savings) * 12, 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  INSERT INTO public.assets (fcu_code, asset_name, asset_status, region, contract_value, uptime, kwh_total, battery_level, installation_date) VALUES
  ('GAB-001', 'Site Vivo SP-01', 'Operacional', 'SP', 3500.00, 99.9, 1250, 85, '2025-01-10'),
  ('GAB-002', 'Site Vivo SP-02', 'Operacional', 'SP', 4000.00, 98.5, 1100, 92, '2025-01-15'),
  ('GAB-003', 'Site Vivo SP-03', 'Manutenção', 'SP', 1300.00, 95.0, 850, 15, '2025-02-01'),
  ('GAB-004', 'Site TIM MG-01', 'Operacional', 'MG', 2500.00, 99.9, 920, 100, '2025-02-20'),
  ('GAB-005', 'Site TIM MG-02', 'Backlog', 'MG', 2500.00, 0, 0, 0, NULL)
  ON CONFLICT (fcu_code) DO NOTHING;

  IF NOT EXISTS (SELECT 1 FROM public.billing_cycles) THEN
    INSERT INTO public.billing_cycles (month, region, revenue) VALUES
    ('2025-01-01', 'SP', 45000.00),
    ('2025-01-01', 'MG', 20000.00),
    ('2025-02-01', 'SP', 50000.00),
    ('2025-02-01', 'MG', 25000.00),
    ('2025-03-01', 'SP', 55000.00),
    ('2025-03-01', 'MG', 37000.00);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.rollout_backlog) THEN
    INSERT INTO public.rollout_backlog (site_id, site_name, region, target_date) VALUES
    ('SITE-101', 'Expansão Campinas', 'SP', '2025-07-10'),
    ('SITE-102', 'Nova Lima', 'MG', '2025-07-15'),
    ('SITE-103', 'Ribeirão Preto', 'SP', '2025-08-01'),
    ('SITE-104', 'Uberlândia', 'MG', '2025-08-20');
  END IF;
END $$;
