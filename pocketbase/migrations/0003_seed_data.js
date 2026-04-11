migrate(
  (app) => {
    // 1. Seed User
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'arnaldo@herovp.com')
    } catch (_) {
      const record = new Record(users)
      record.setEmail('arnaldo@herovp.com')
      record.setPassword('Skip@Pass')
      record.setVerified(true)
      record.set('name', 'Admin')
      app.save(record)
    }

    // 2. Seed Assets
    const assets = app.findCollectionByNameOrId('assets')
    const seedAsset = (data) => {
      try {
        app.findFirstRecordByData('assets', 'fcu_code', data.fcu_code)
      } catch (_) {
        const record = new Record(assets)
        Object.entries(data).forEach(([k, v]) => record.set(k, v))
        app.save(record)
      }
    }

    seedAsset({
      fcu_code: 'GAB-001',
      asset_name: 'Gabinete Paulista',
      asset_state: 'Operacional',
      uf_code: 'SP',
      city: 'São Paulo',
      cabinet_type: 'GAB. TIPO 2',
      rack_serial_number: 'SN-109283',
      address: 'Av Paulista, 1000 - Bela Vista',
      battery_count: 4,
      rectifier_count: 2,
      network_type: 'FTTH',
      is_active: true,
      contract_value: 1500.5,
      installation_date: '2023-05-10 12:00:00.000Z',
      latitude: -23.561684,
      longitude: -46.655981,
      sr_specification: '48V 50A',
      air_conditioned: 'Sim',
      kwh_total: 12500,
      battery_level: 95,
      uptime: 99.9,
      mttr_hours: 2.5,
      step_number: '11',
      process_status: 'Concluído',
    })

    seedAsset({
      fcu_code: 'GAB-004',
      asset_name: 'Gabinete Centro BH',
      asset_state: 'Manutenção',
      uf_code: 'MG',
      city: 'Belo Horizonte',
      cabinet_type: 'TIPO 7 COM AR',
      rack_serial_number: 'SN-998877',
      address: 'Rua da Bahia, 1148 - Centro',
      battery_count: 8,
      rectifier_count: 3,
      network_type: '5G/LTE',
      is_active: true,
      contract_value: 2200.0,
      installation_date: '2024-01-15 12:00:00.000Z',
      latitude: -19.922731,
      longitude: -43.945089,
      sr_specification: '48V 100A',
      air_conditioned: 'Sim',
      kwh_total: 8400,
      battery_level: 45,
      uptime: 98.5,
      mttr_hours: 4.0,
      step_number: '5',
      process_status: 'Em Andamento',
    })
  },
  (app) => {
    const assets = app.findCollectionByNameOrId('assets')
    try {
      const a1 = app.findFirstRecordByData('assets', 'fcu_code', 'GAB-001')
      app.delete(a1)
    } catch (_) {}
    try {
      const a2 = app.findFirstRecordByData('assets', 'fcu_code', 'GAB-004')
      app.delete(a2)
    } catch (_) {}
  },
)
