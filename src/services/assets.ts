import pb from '@/lib/pocketbase/client'

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

export const getRolloutStages = async () => {
  try {
    return await pb.collection('rollout_stages').getFullList({
      sort: 'order',
    })
  } catch (error) {
    console.error(error)
    return []
  }
}

export const createRolloutStage = async (data: any) => {
  return await pb.collection('rollout_stages').create(data)
}

export const updateRolloutStage = async (id: string, data: any) => {
  return await pb.collection('rollout_stages').update(id, data)
}

export const deleteRolloutStage = async (id: string) => {
  return await pb.collection('rollout_stages').delete(id)
}
