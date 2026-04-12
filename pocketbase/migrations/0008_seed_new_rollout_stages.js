migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('rollout_stages')
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

    stages.forEach((s, i) => {
      try {
        const existing = app.findFirstRecordByData('rollout_stages', 'name', s.name)
        existing.set('order', i + 1)
        existing.set('responsibility', s.responsibility)
        app.save(existing)
      } catch (_) {
        const record = new Record(col)
        record.set('name', s.name)
        record.set('responsibility', s.responsibility)
        record.set('order', i + 1)
        app.save(record)
      }
    })
  },
  (app) => {
    const stages = [
      'Revisar SCI',
      'Validar SCI',
      'Validar Tecnicamente SCI',
      'Elaborar FCU',
      'Revisar FCU',
      'Validar Contrato FCU',
      'Liberar SCI/FCU',
      'Assinar FCU Sharing',
      'Assinar FCU Operadora',
      'Revisar assinatura DOCS AENZI',
      'Revisar assinatura DOCS Operadora',
      'Cadastrar projeto ERP',
      'Aceite ERP',
      'Pagamento recebido',
    ]
    stages.forEach((name) => {
      try {
        const existing = app.findFirstRecordByData('rollout_stages', 'name', name)
        app.delete(existing)
      } catch (_) {}
    })
  },
)
