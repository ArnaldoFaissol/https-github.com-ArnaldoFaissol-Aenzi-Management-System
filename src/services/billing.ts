import { supabase as skipCloud } from '@/lib/supabase/client'

export const getBillingCycles = async (): Promise<any[]> => {
  const { data, error } = await skipCloud
    .from('billing_cycles')
    .select(
      'id, month, region, revenue, asset_id, taxes, deductions, opex, created_at, assets(fcu_code, asset_name, contract_value, region)' as any,
    )
    .order('month', { ascending: true })

  if (error) throw error
  return data || []
}
