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

const mapToSupabase = (data: any, isInsert = false) => {
  const mapped = { ...data }

  if ('battery_qty' in mapped) {
    mapped.battery_count = mapped.battery_qty
    delete mapped.battery_qty
  }
  if ('rectifier_number' in mapped) {
    mapped.rectifier_count = mapped.rectifier_number
    delete mapped.rectifier_number
  }
  if ('air_conditioning' in mapped) {
    mapped.air_conditioner = mapped.air_conditioning ? 'Yes' : 'No'
    delete mapped.air_conditioning
  }
  if ('bluetooth' in mapped) {
    mapped.bluetooth_lock_status = mapped.bluetooth ? 'Yes' : 'No'
    delete mapped.bluetooth
  }
  if ('iams_regional' in mapped) {
    mapped.iams_registration = mapped.iams_regional
    delete mapped.iams_regional
  }
  if ('rack_key' in mapped) {
    mapped.rack_key_info = mapped.rack_key
    delete mapped.rack_key
  }
  if ('rectifier_spec' in mapped) {
    mapped.sr_specification = mapped.rectifier_spec
    delete mapped.rectifier_spec
  }

  if (isInsert) {
    if (!mapped.asset_name)
      mapped.asset_name = mapped.fcu_code ? `Ativo ${mapped.fcu_code}` : 'Ativo Sem Nome'
    if (!mapped.asset_state) mapped.asset_state = 'Desativado'
  }

  delete mapped.monthly_revenue
  delete mapped.installation_date

  delete mapped.id
  delete mapped.created_at
  delete mapped.updated_at
  delete mapped.collectionId
  delete mapped.collectionName
  delete mapped.expand

  return mapped
}

const mapFromSupabase = (data: any) => {
  if (!data) return data
  const mapped = { ...data }

  if ('battery_count' in mapped) mapped.battery_qty = mapped.battery_count
  if ('rectifier_count' in mapped) mapped.rectifier_number = mapped.rectifier_count
  if ('air_conditioner' in mapped) mapped.air_conditioning = mapped.air_conditioner === 'Yes'
  if ('bluetooth_lock_status' in mapped) mapped.bluetooth = mapped.bluetooth_lock_status === 'Yes'
  if ('iams_registration' in mapped) mapped.iams_regional = mapped.iams_registration
  if ('rack_key_info' in mapped) mapped.rack_key = mapped.rack_key_info
  if ('sr_specification' in mapped) mapped.rectifier_spec = mapped.sr_specification

  return mapped
}

export const getAssets = async () => {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(mapFromSupabase)
}

export const upsertAssets = async (assets: any[]) => {
  const results = []
  const errors = []

  for (const asset of assets) {
    if (!asset.fcu_code) continue

    try {
      const { data: existing } = await supabase
        .from('assets')
        .select('id')
        .eq('fcu_code', asset.fcu_code)
        .maybeSingle()

      if (existing) {
        const mapped = mapToSupabase(asset, false)
        const { data, error } = await supabase
          .from('assets')
          .update(mapped)
          .eq('id', existing.id)
          .select()
          .single()
        if (error) throw error
        results.push(mapFromSupabase(data))
      } else {
        const mapped = mapToSupabase(asset, true)
        const { data, error } = await supabase.from('assets').insert([mapped]).select().single()
        if (error) throw error
        results.push(mapFromSupabase(data))
      }
    } catch (err: any) {
      errors.push({ fcu_code: asset.fcu_code, message: err.message || 'Erro desconhecido' })
    }
  }
  return { results, errors }
}

export const updateAsset = async (id: string, data: any) => {
  const mapped = mapToSupabase(data, false)
  const { data: updated, error } = await supabase
    .from('assets')
    .update(mapped)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return mapFromSupabase(updated)
}

export const deleteAsset = async (id: string) => {
  const { error } = await supabase.from('assets').delete().eq('id', id)
  if (error) throw error
  return true
}

export const getRolloutBacklog = async () => {
  const { data, error } = await supabase.from('rollout_backlog').select('*')
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
  return (data || []).map(mapFromSupabase)
}
