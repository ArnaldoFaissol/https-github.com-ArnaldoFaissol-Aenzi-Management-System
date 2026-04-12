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
  return await pb.collection('assets').getFullList({
    sort: '-created',
  })
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
        // Not found
      }

      if (existing) {
        const updated = await pb.collection('assets').update(existing.id, asset)
        results.push(updated)
      } else {
        const created = await pb.collection('assets').create(asset)
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
  return await pb.collection('assets').delete(id)
}

export const getRolloutBacklog = async () => {
  // Stub for unsupported backend table (prevents rollout page crash)
  return []
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
  return await pb.collection('assets').getFullList({
    fields: 'id,asset_name,fcu_code,step_number,process_status,city,uf_code',
    sort: '-created',
  })
}
