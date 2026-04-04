import { supabase } from '@/lib/supabase/client'

export const getBillingCycles = async () => {
  const { data, error } = await supabase
    .from('billing_cycles')
    .select('*')
    .order('month', { ascending: true })
  if (error) throw error
  return data
}
