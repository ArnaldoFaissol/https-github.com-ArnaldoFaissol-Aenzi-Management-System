import { supabase } from '@/lib/supabase/client'

export const ACTIVATION_STEPS = [
  { id: '1', title: 'ALOCAR', responsible: 'VIVO' },
  { id: '2', title: 'Vistoria Inicial', responsible: 'AENZI' },
  { id: '3', title: 'Viabilidade Técnica', responsible: 'Operadora' },
  { id: '4', title: 'Aprovação de Projeto', responsible: 'TLP/Parceiro' },
  { id: '5', title: 'Solicitação de Licenciamento', responsible: 'VIVO' },
  { id: '6', title: 'Emissão de Licenças', responsible: 'Operadora' },
  { id: '7', title: 'Preparação do Local', responsible: 'AENZI' },
  { id: '8', title: 'Fundação e Base', responsible: 'AENZI' },
  { id: '9', title: 'Entrega do Gabinete', responsible: 'AENZI' },
  { id: '10', title: 'Instalação Física', responsible: 'AENZI' },
  { id: '11', title: 'Solicitação de Energia', responsible: 'VIVO' },
  { id: '12', title: 'Adequação Elétrica Padrão', responsible: 'AENZI' },
  { id: '13', title: 'Ligação de Energia', responsible: 'Operadora' },
  { id: '14', title: 'Infraestrutura Interna', responsible: 'TLP/Parceiro' },
  { id: '15', title: 'Instalação de Retificadores', responsible: 'TLP/Parceiro' },
  { id: '16', title: 'Instalação de Baterias', responsible: 'TLP/Parceiro' },
  { id: '17', title: 'Cabeamento de Força', responsible: 'AENZI' },
  { id: '18', title: 'Cabeamento Óptico/Tx', responsible: 'Operadora' },
  { id: '19', title: 'Conexão Elétrica Final', responsible: 'VIVO' },
  { id: '20', title: 'Instalação de Equipamentos Ativos', responsible: 'TLP/Parceiro' },
  { id: '21', title: 'Configuração Lógica', responsible: 'TLP/Parceiro' },
  { id: '22', title: 'Testes de Energia', responsible: 'AENZI' },
  { id: '23', title: 'Testes de Conectividade', responsible: 'VIVO' },
  { id: '24', title: 'Integração ao Sistema', responsible: 'Operadora' },
  { id: '25', title: 'Comissionamento', responsible: 'AENZI' },
  { id: '26', title: 'Vistoria Final de Qualidade', responsible: 'TLP/Parceiro' },
  { id: '27', title: 'Aceitação Provisória', responsible: 'VIVO' },
  { id: '28', title: 'Ativação Final', responsible: 'Operadora' },
]

// Campos que nao devem ser enviados em INSERT/UPDATE (gerenciados pelo banco ou herdados do PocketBase)
const STRIPPED_FIELDS = [
  'id',
  'created',
  'updated',
  'created_at',
  'updated_at',
  'collectionId',
  'collectionName',
  'expand',
]

const sanitize = (obj: any) => {
  const copy: any = { ...obj }
  for (const f of STRIPPED_FIELDS) delete copy[f]
  return copy
}

export const getAssets = async () => {
  try {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('getAssets error:', error)
    return []
  }
}

export const upsertAssets = async (assets: any[]) => {
  const results: any[] = []
  const errors: { fcu_code: string; message: string }[] = []

  for (const asset of assets) {
    if (!asset.fcu_code) continue

    try {
      const toSave = sanitize(asset)

      // Defaults para INSERT
      if (!toSave.asset_name) {
        toSave.asset_name = toSave.fcu_code ? `Ativo ${toSave.fcu_code}` : 'Ativo Sem Nome'
      }
      if (!toSave.asset_state) toSave.asset_state = 'Desativado'

      // Busca existente por fcu_code (coluna UNIQUE)
      const { data: existing, error: findErr } = await supabase
        .from('assets')
        .select('id')
        .eq('fcu_code', asset.fcu_code)
        .maybeSingle()

      if (findErr) throw findErr

      if (existing?.id) {
        const { data, error } = await supabase
          .from('assets')
          .update(toSave)
          .eq('id', existing.id)
          .select()
          .single()
        if (error) throw error
        results.push(data)
      } else {
        const { data, error } = await supabase
          .from('assets')
          .insert(toSave)
          .select()
          .single()
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
    .update(sanitize(data))
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return updated
}

export const deleteAsset = async (id: string) => {
  const { error } = await supabase.from('assets').delete().eq('id', id)
  if (error) throw error
  return true
}

export const getRolloutBacklog = async () => {
  try {
    const { data, error } = await supabase
      .from('rollout_backlog')
      .select('*')
      .order('target_date', { ascending: true })
    if (error) throw error
    if (data && data.length > 0) return data

    // Fallback mock caso a tabela esteja vazia
    return [
      {
        id: '1',
        site_id: 'S-001',
        site_name: 'Site Central',
        region: 'SP',
        target_date: new Date(Date.now() + 86400000 * 5).toISOString(),
      },
      {
        id: '2',
        site_id: 'S-002',
        site_name: 'Torre Norte',
        region: 'MG',
        target_date: new Date(Date.now() + 86400000 * 12).toISOString(),
      },
      {
        id: '3',
        site_id: 'S-003',
        site_name: 'Estação Sul',
        region: 'RJ',
        target_date: new Date(Date.now() + 86400000 * 2).toISOString(),
      },
      {
        id: '4',
        site_id: 'S-004',
        site_name: 'Base Leste',
        region: 'SP',
        target_date: new Date(Date.now() + 86400000 * 40).toISOString(),
      },
    ]
  } catch (error) {
    console.error('getRolloutBacklog error:', error)
    return []
  }
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
  try {
    const { data, error } = await supabase
      .from('assets')
      .select('id,asset_name,fcu_code,step_number,process_status,city,uf_code')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('getAssetsForKanban error:', error)
    return []
  }
}

// --- Rollout Stages ---
// A tabela `rollout_stages` nao existe no Supabase. Mantemos stages como
// dados estaticos derivados de ACTIVATION_STEPS para preservar o contrato.
// Se quiser stages customizaveis via UI, crie a tabela e reative estas funcoes.

export const getRolloutStages = async () => {
  return ACTIVATION_STEPS.map((s, idx) => ({
    id: s.id,
    title: s.title,
    responsible: s.responsible,
    order: idx + 1,
  }))
}

export const createRolloutStage = async (_data: any) => {
  console.warn('createRolloutStage: tabela rollout_stages nao existe no Supabase. No-op.')
  return null
}

export const updateRolloutStage = async (_id: string, _data: any) => {
  console.warn('updateRolloutStage: tabela rollout_stages nao existe no Supabase. No-op.')
  return null
}

export const deleteRolloutStage = async (_id: string) => {
  console.warn('deleteRolloutStage: tabela rollout_stages nao existe no Supabase. No-op.')
  return null
}
