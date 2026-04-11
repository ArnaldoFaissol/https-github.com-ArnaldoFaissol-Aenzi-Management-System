import { supabase as skipCloud } from '@/lib/supabase/client'

export const ACTIVATION_STEPS = [
  { id: '0', title: '0. Identificação do Site', responsible: 'VIVO' },
  { id: '1', title: '1. Vistoria Inicial', responsible: 'AENZI' },
  { id: '2', title: '2. Aprovação de Projeto', responsible: 'TLP' },
  { id: '3', title: '3. Preparação do Local', responsible: 'AENZI' },
  { id: '4', title: '4. Entrega do Gabinete', responsible: 'AENZI' },
  { id: '5', title: '5. Instalação Física', responsible: 'AENZI' },
  { id: '6', title: '6. Conexão Elétrica', responsible: 'VIVO' },
  { id: '7', title: '7. Instalação de Equip.', responsible: 'TLP' },
  { id: '8', title: '8. Testes Conectividade', responsible: 'VIVO' },
  { id: '9', title: '9. Comissionamento', responsible: 'AENZI' },
  { id: '10', title: '10. Aceitação Provisória', responsible: 'TLP' },
  { id: '11', title: '11. Ativação Final', responsible: 'VIVO' },
]

export const getAssets = async () => {
  const { data, error } = await skipCloud
    .from('assets')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const upsertAssets = async (assets: any[]) => {
  const { data, error } = await skipCloud
    .from('assets')
    .upsert(assets, { onConflict: 'fcu_code' })
    .select()
  if (error) throw error
  return data
}

export const getRolloutBacklog = async () => {
  const { data, error } = await skipCloud
    .from('rollout_backlog')
    .select('*')
    .order('target_date', { ascending: true })
  if (error) throw error
  return data
}

export const updateAssetStep = async (
  assetId: string,
  stepNumber: string,
  processStatus: string,
) => {
  const { data, error } = await skipCloud
    .from('assets')
    .update({ step_number: stepNumber, process_status: processStatus })
    .eq('id', assetId)
    .select()
    .single()
  if (error) throw error

  await skipCloud
    .from('asset_transitions' as any)
    .insert({
      asset_id: assetId,
      to_step: stepNumber,
    })
    .catch(() => {})

  return data
}

export const getAssetsForKanban = async () => {
  const { data, error } = await skipCloud
    .from('assets')
    .select('id, asset_name, fcu_code, step_number, process_status, city, uf_code')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}
