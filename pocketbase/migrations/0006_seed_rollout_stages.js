migrate(
  (app) => {
    const steps = [
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
    const stagesCol = app.findCollectionByNameOrId('rollout_stages')

    for (let i = 0; i < steps.length; i++) {
      const s = steps[i]
      let record
      try {
        record = app.findFirstRecordByData('rollout_stages', 'name', s.title)
      } catch (_) {
        record = new Record(stagesCol)
        record.set('name', s.title)
        record.set('order', i + 1)
        record.set('responsibility', s.responsible)
        app.save(record)
      }

      // Update assets that had this step_number matching the old string ID
      app
        .db()
        .newQuery('UPDATE assets SET step_number = {:newId} WHERE step_number = {:oldId}')
        .bind({ newId: record.id, oldId: s.id })
        .execute()
    }
  },
  (app) => {
    // Empty down migration because we can't easily revert asset step_number reliably
  },
)
