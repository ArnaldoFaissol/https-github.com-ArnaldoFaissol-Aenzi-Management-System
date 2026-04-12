import pb from '@/lib/pocketbase/client'

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

export const getAssets = async () => {
  try {
    return await pb.collection('assets').getFullList({
      sort: '-created',
    })
  } catch (error) {
    console.error(error)
    return []
  }
}

export const upsertAssets = async (assets: any[]) => {
  const results = []
  const errors = []

  for (const asset of assets) {
    if (!asset.fcu_code) continue
    try {
      let existing
      try {
        existing = await pb.collection('assets').getFirstListItem(`fcu_code="${asset.fcu_code}"`)
      } catch (e) {
        existing = null
      }

      const toSave = { ...asset }
      delete toSave.id
      delete toSave.created
      delete toSave.updated
      delete toSave.collectionId
      delete toSave.collectionName
      delete toSave.expand

      if (existing) {
        const updated = await pb.collection('assets').update(existing.id, toSave)
        results.push(updated)
      } else {
        if (!toSave.asset_name) {
          toSave.asset_name = toSave.fcu_code ? `Ativo ${toSave.fcu_code}` : 'Ativo Sem Nome'
        }
        if (!toSave.asset_state) toSave.asset_state = 'Desativado'

        const created = await pb.collection('assets').create(toSave)
        results.push(created)
      }
    } catch (err: any) {
      errors.push({ fcu_code: asset.fcu_code, message: err.message || 'Erro desconhecido' })
    }
  }
  return { results, errors }
}

export const updateAsset = async (id: string, data: any) => {
  return await pb.collection('assets').update(id, data)
}

export const deleteAsset = async (id: string) => {
  await pb.collection('assets').delete(id)
  return true
}

export const getRolloutBacklog = async () => {
  // Mock data as rollout_backlog collection is not present in PocketBase schema
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
    return await pb.collection('assets').getFullList({
      fields: 'id,asset_name,fcu_code,step_number,process_status,city,uf_code',
      sort: '-created',
    })
  } catch (error) {
    console.error(error)
    return []
  }
}
