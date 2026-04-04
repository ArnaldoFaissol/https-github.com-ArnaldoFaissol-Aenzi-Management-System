ALTER TABLE public.assets
ADD COLUMN IF NOT EXISTS unit_number TEXT,
ADD COLUMN IF NOT EXISTS network_type TEXT,
ADD COLUMN IF NOT EXISTS cabinet_type TEXT,
ADD COLUMN IF NOT EXISTS rack_serial_number TEXT,
ADD COLUMN IF NOT EXISTS bluetooth_lock_status TEXT,
ADD COLUMN IF NOT EXISTS iams_registration TEXT,
ADD COLUMN IF NOT EXISTS coordinates_raw TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS rack_key_info TEXT,
ADD COLUMN IF NOT EXISTS holder TEXT,
ADD COLUMN IF NOT EXISTS battery_count INTEGER,
ADD COLUMN IF NOT EXISTS sr_specification TEXT,
ADD COLUMN IF NOT EXISTS rectifier_count INTEGER,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_in_stock BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_assets_status ON public.assets(asset_status);
CREATE INDEX IF NOT EXISTS idx_assets_uf_code ON public.assets(uf_code);
CREATE INDEX IF NOT EXISTS idx_assets_city ON public.assets(city);
CREATE INDEX IF NOT EXISTS idx_assets_installation_date ON public.assets(installation_date);

-- Update some mock data to demonstrate the new fields
DO $$
BEGIN
  UPDATE public.assets
  SET 
    cabinet_type = 'GAB. TIPO 2',
    network_type = 'FTTH',
    rack_serial_number = 'SN-109283',
    address = 'Av Paulista, 1000 - Bela Vista',
    battery_count = 4,
    rectifier_count = 2,
    uf_code = 'SP',
    is_active = true
  WHERE fcu_code = 'GAB-001';

  UPDATE public.assets
  SET 
    cabinet_type = 'TIPO 7 COM AR',
    network_type = '5G/LTE',
    rack_serial_number = 'SN-998877',
    address = 'Rua da Bahia, 1148 - Centro',
    battery_count = 8,
    rectifier_count = 3,
    uf_code = 'MG',
    is_active = true
  WHERE fcu_code = 'GAB-004';
END $$;
