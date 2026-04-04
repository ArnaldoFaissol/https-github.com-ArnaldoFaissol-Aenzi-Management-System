import { supabase } from '@/lib/supabase/client'

export const getAssets = async () => {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const getRolloutBacklog = async () => {
  const { data, error } = await supabase
    .from('rollout_backlog')
    .select('*')
    .order('target_date', { ascending: true })
  if (error) throw error
  return data
}
