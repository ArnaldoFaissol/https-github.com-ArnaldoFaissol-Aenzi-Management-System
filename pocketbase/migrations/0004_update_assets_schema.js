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

    // Important: Save the collection BEFORE running raw SQL that depends on new columns
    if (changed) {
      app.save(col)
    }

    // Deduplicate records to avoid UNIQUE constraint violation when adding the index
    try {
      app
        .db()
        .newQuery(`
      DELETE FROM assets WHERE id NOT IN (
        SELECT MIN(id) FROM assets GROUP BY fcu_code
      ) AND fcu_code IS NOT NULL AND fcu_code != ''
    `)
        .execute()
    } catch (e) {
      console.log('Deduplication error (ignoring):', e)
    }

    col.addIndex('idx_assets_fcu_code_unique', true, 'fcu_code', '')
    app.save(col)
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('assets')
      col.removeIndex('idx_assets_fcu_code_unique')
      app.save(col)
    } catch (e) {
      console.log(e)
    }
  },
)
