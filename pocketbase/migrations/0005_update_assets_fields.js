migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('assets')

    let changed = false
    const addText = (name) => {
      if (!col.fields.getByName(name)) {
        col.fields.add(new TextField({ name }))
        changed = true
      }
    }
    const addNumber = (name) => {
      if (!col.fields.getByName(name)) {
        col.fields.add(new NumberField({ name }))
        changed = true
      }
    }
    const addBool = (name) => {
      if (!col.fields.getByName(name)) {
        col.fields.add(new BoolField({ name }))
        changed = true
      }
    }
    const addDate = (name) => {
      if (!col.fields.getByName(name)) {
        col.fields.add(new DateField({ name }))
        changed = true
      }
    }

    addText('fcu_code')
    addText('asset_name')
    addText('asset_state')
    addText('uf_code')
    addText('city')
    addText('cabinet_type')
    addText('rack_serial_number')
    addText('address')
    addNumber('battery_qty')
    addNumber('rectifier_number')
    addText('network_type')
    addBool('is_active')
    addBool('is_in_stock')
    addText('utility')
    addNumber('pendency')
    addText('step_number')
    addText('process_status')
    addBool('air_conditioning')
    addBool('bluetooth')
    addText('armored')
    addText('iams_regional')
    addText('rack_key')
    addText('holder')
    addNumber('monthly_revenue')
    addDate('installation_date')
    addNumber('latitude')
    addNumber('longitude')
    addText('rectifier_spec')

    if (changed) {
      app.save(col)
    }

    // Use a partial index (fcu_code != '') to safely ignore empty strings on existing records
    // and completely avoid raw SQL queries that might taint the migration transaction.
    col.addIndex('idx_assets_fcu_code_unique', true, 'fcu_code', "fcu_code != ''")
    app.save(col)
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('assets')
      col.removeIndex('idx_assets_fcu_code_unique')

      const fieldsToRemove = [
        'fcu_code',
        'asset_name',
        'asset_state',
        'uf_code',
        'city',
        'cabinet_type',
        'rack_serial_number',
        'address',
        'battery_qty',
        'rectifier_number',
        'network_type',
        'is_active',
        'is_in_stock',
        'utility',
        'pendency',
        'step_number',
        'process_status',
        'air_conditioning',
        'bluetooth',
        'armored',
        'iams_regional',
        'rack_key',
        'holder',
        'monthly_revenue',
        'installation_date',
        'latitude',
        'longitude',
        'rectifier_spec',
      ]

      for (const field of fieldsToRemove) {
        if (col.fields.getByName(field)) {
          col.fields.removeByName(field)
        }
      }

      app.save(col)
    } catch (e) {
      console.log(e)
    }
  },
)
