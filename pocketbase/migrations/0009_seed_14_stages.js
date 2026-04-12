migrate(
  (app) => {
    const stages = [
      { name: 'Revisar SCI', responsibility: 'Operadora' },
      { name: 'Validar SCI', responsibility: 'AENZI' },
      { name: 'Validar Tecnicamente SCI', responsibility: 'Operadora' },
      { name: 'Elaborar FCU', responsibility: 'TLP' },
      { name: 'Revisar FCU', responsibility: 'AENZI' },
      { name: 'Validar Contrato FCU', responsibility: 'Operadora' },
      { name: 'Liberar SCI/FCU', responsibility: 'Operadora' },
      { name: 'Assinar FCU Sharing', responsibility: 'AENZI' },
      { name: 'Assinar FCU Operadora', responsibility: 'Operadora' },
      { name: 'Revisar assinatura DOCS AENZI', responsibility: 'AENZI' },
      { name: 'Revisar assinatura DOCS Operadora', responsibility: 'Operadora' },
      { name: 'Cadastrar projeto ERP', responsibility: 'Operadora' },
      { name: 'Aceite ERP', responsibility: 'Operadora' },
      { name: 'Pagamento recebido', responsibility: 'AENZI' },
    ]

    const col = app.findCollectionByNameOrId('rollout_stages')

    app.db().newQuery('DELETE FROM rollout_stages').execute()

    stages.forEach((stage, index) => {
      const record = new Record(col)
      record.set('name', stage.name)
      record.set('responsibility', stage.responsibility)
      record.set('order', index + 1)
      app.save(record)
    })
  },
  (app) => {
    app.db().newQuery('DELETE FROM rollout_stages').execute()
  },
)
