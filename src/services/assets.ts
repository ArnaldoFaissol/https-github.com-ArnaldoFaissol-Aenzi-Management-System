import { supabase } from '@/lib/supabase/client'

// 28 estagios do processo de ativacao AENZI.
// Shape usado pelo Kanban em /rollout: { id, name, responsibility, order }
export const ACTIVATION_STEPS = [
  { id: '1', name: 'Alocar', responsibility: 'Operadora' },
  { id: '2', name: 'Vistoria Inicial', responsibility: 'AENZI' },
  { id: '3', name: 'Aprovação de Projeto', responsibility: 'Operadora' },
  { id: '4', name: 'Licenciamento', responsibility: 'Operadora' },
  { id: '5', name: 'Preparação do Local', responsibility: 'Parceiro Operadora' },
  { id: '6', name: 'Entrega do Gabinete', responsibility: 'Parceiro Logístico' },
  { id: '7', name: 'Instalação Física', responsibility: 'TLP/Parceiro Local' },
  { id: '8', name: 'Infraestrutura Elétrica', responsibility: 'TLP/Parceiro Local' },
  { id: '9', name: 'Conexão Elétrica', responsibility: 'Torreira' },
  { id: '10', name: 'Instalação de Equipamentos', responsibility: 'Parceiro Operadora' },
  { id: '11', name: 'Testes de Conectividade', responsibility: 'Parceiro Operadora' },
  { id: '12', name: 'Comissionamento', responsibility: 'TLP/Parceiro Local' },
  { id: '13', name: 'Aceitação Provisória', responsibility: 'Operadora' },
  { id: '14', name: 'Ativação Final', responsibility: 'Operadora' },
  { id: '15', name: 'Elaborar FCU', responsibility: 'TLP' },
  { id: '16', name: 'Validar SCI', responsibility: 'VIVO' },
  { id: '17', name: 'Validar SCI', responsibility: 'TLP' },
  { id: '18', name: 'Validar tecnicamente', responsibility: 'VIVO' },
  { id: '19', name: 'Revisar FCU', responsibility: 'TLP' },
  { id: '20', name: 'Validar contrato', responsibility: 'Operadora' },
  { id: '21', name: 'Liberar SCI/FCU', responsibility: 'AENZI' },
  { id: '22', name: 'Assinar FCU sharing', responsibility: 'AENZI' },
  { id: '23', name: 'Assinar FCU telefônica', responsibility: 'Operadora' },
  { id: '24', name: 'Revisar assinatura docs AENZI', responsibility: 'AENZI' },
  { id: '25', name: 'Revisar assinatura docs Operadora', responsibility: 'Operadora' },
  { id: '26', name: 'Cadastrar Projeto ERP', responsibility: 'Operadora' },
  { id: '27', name: 'Aceite ERP', responsibility: 'Operadora' },
  { id: '28', name: 'Pagamento Recebido', responsibility: 'AENZI' },
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
    return data || []
  } catch (error) {
    console.error('getRolloutBacklog error:', error)
    return []
  }
}

/**
 * Move um asset para um novo estagio do Kanban.
 * - Atualiza step_number + process_status no asset
 * - Registra uma linha em asset_transitions (from_step, to_step, changed_by)
 *   para manter auditoria do fluxo.
 */
export const updateAssetStep = async (
  assetId: string,
  stepNumber: string,
  processStatus: string,
) => {
  // Le o estagio atual para gravar `from_step` na transicao
  const { data: current } = await supabase
    .from('assets')
    .select('step_number')
    .eq('id', assetId)
    .maybeSingle()

  const fromStep = current?.step_number ?? null

  // Atualiza o asset
  const updated = await updateAsset(assetId, {
    step_number: stepNumber,
    process_status: processStatus,
  })

  // Registra a transicao (best-effort: nao impede a atualizacao se falhar)
  try {
    const { data: userRes } = await supabase.auth.getUser()
    const changedBy = userRes?.user?.id ?? null

    // Evita logar "transicao" sem mudanca real
    if (fromStep !== stepNumber) {
      await supabase.from('asset_transitions').insert({
        asset_id: assetId,
        from_step: fromStep,
        to_step: stepNumber,
        changed_by: changedBy,
      })
    }
  } catch (err) {
    console.warn('asset_transitions insert falhou (asset atualizado normalmente):', err)
  }

  return updated
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
    name: s.name,
    responsibility: s.responsibility,
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
