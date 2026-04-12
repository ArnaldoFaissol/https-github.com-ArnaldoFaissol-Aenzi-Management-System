-- Migrate to Supabase specific schema and RBAC

-- Create users table for profiles
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('superuser', 'admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_read_all" ON public.users;
CREATE POLICY "users_read_all" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Handle user creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    COALESCE(new.raw_user_meta_data->>'role', 'user')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='assets' AND column_name='asset_status') THEN
    ALTER TABLE public.assets RENAME COLUMN asset_status TO asset_state;
  END IF;
END $$;

ALTER TABLE public.assets 
  ADD COLUMN IF NOT EXISTS cabinet_type TEXT,
  ADD COLUMN IF NOT EXISTS rack_serial_number TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS battery_qty NUMERIC,
  ADD COLUMN IF NOT EXISTS rectifier_number NUMERIC,
  ADD COLUMN IF NOT EXISTS network_type TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_in_stock BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS utility TEXT,
  ADD COLUMN IF NOT EXISTS pendency NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS step_number TEXT,
  ADD COLUMN IF NOT EXISTS process_status TEXT,
  ADD COLUMN IF NOT EXISTS air_conditioning BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS bluetooth BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS armored TEXT,
  ADD COLUMN IF NOT EXISTS iams_regional TEXT,
  ADD COLUMN IF NOT EXISTS rack_key TEXT,
  ADD COLUMN IF NOT EXISTS holder TEXT,
  ADD COLUMN IF NOT EXISTS monthly_revenue NUMERIC,
  ADD COLUMN IF NOT EXISTS rectifier_spec TEXT;

-- Drop old RLS and apply new ones
DROP POLICY IF EXISTS "authenticated_all_assets" ON public.assets;
DROP POLICY IF EXISTS "assets_select_all" ON public.assets;
DROP POLICY IF EXISTS "assets_insert_admin" ON public.assets;
DROP POLICY IF EXISTS "assets_update_admin" ON public.assets;
DROP POLICY IF EXISTS "assets_delete_superuser" ON public.assets;

CREATE POLICY "assets_select_all" ON public.assets FOR SELECT TO authenticated USING (true);

CREATE POLICY "assets_insert_admin" ON public.assets FOR INSERT TO authenticated 
WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('superuser', 'admin'))
);

CREATE POLICY "assets_update_admin" ON public.assets FOR UPDATE TO authenticated 
USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('superuser', 'admin'))
);

CREATE POLICY "assets_delete_superuser" ON public.assets FOR DELETE TO authenticated 
USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'superuser')
);

-- Realtime support
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table public.assets;

-- Seed arnaldo@herovp.com as superuser
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
      '{"name": "Arnaldo Faissol", "role": "superuser"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );
  ELSE
    UPDATE auth.users 
    SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{role}', '"superuser"')
    WHERE email = 'arnaldo@herovp.com';
    
    UPDATE public.users 
    SET role = 'superuser' 
    WHERE id = (SELECT id FROM auth.users WHERE email = 'arnaldo@herovp.com');
  END IF;
END $$;
