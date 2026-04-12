import { supabase } from '@/lib/supabase/client'

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
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export const upsertAssets = async (assets: any[]) => {
  const results = []
  const errors = []

  for (const asset of assets) {
    if (!asset.fcu_code) continue

    try {
      const { data: existing, error: findError } = await supabase
        .from('assets')
        .select('id')
        .eq('fcu_code', asset.fcu_code)
        .maybeSingle()

      if (findError && findError.code !== 'PGRST116') {
        throw findError
      }

      if (existing) {
        const { data, error } = await supabase
          .from('assets')
          .update(asset)
          .eq('id', existing.id)
          .select()
          .single()

        if (error) throw error
        results.push(data)
      } else {
        const { data, error } = await supabase.from('assets').insert(asset).select().single()

        if (error) throw error
        results.push(data)
      }
    } catch (err: any) {
      errors.push({ fcu_code: asset.fcu_code, message: err.message || 'Erro desconhecido' })
    }
  }
  return { results, errors }
}

export const updateAsset = async (id: string, data: any) => {
  const { data: updated, error } = await supabase
    .from('assets')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return updated
}

export const getRolloutBacklog = async () => {
  const { data, error } = await supabase
    .from('rollout_backlog')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export const updateAssetStep = async (
  assetId: string,
  stepNumber: string,
  processStatus: string,
) => {
  return await updateAsset(assetId, {
    step_number: stepNumber,
    process_status: processStatus,
  })
}

export const getAssetsForKanban = async () => {
  const { data, error } = await supabase
    .from('assets')
    .select('id,asset_name,fcu_code,step_number,process_status,city,uf_code')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}
