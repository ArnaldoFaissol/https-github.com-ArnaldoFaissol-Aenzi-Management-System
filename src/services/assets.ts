import pb from '@/lib/pocketbase/client'

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
