migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('assets')

    // Update rules for authenticated access
    const rule = "@request.auth.id != ''"
    col.listRule = rule
    col.viewRule = rule
    col.createRule = rule
    col.updateRule = rule
    col.deleteRule = rule

    const addField = (field) => {
      if (!col.fields.getByName(field.name)) {
        col.fields.add(field)
      }
    }

    addField(new TextField({ name: 'fcu_code', required: true }))
    addField(new TextField({ name: 'asset_name' }))
    addField(new TextField({ name: 'asset_state' }))
    addField(new TextField({ name: 'uf_code' }))
    addField(new TextField({ name: 'city' }))
    addField(new TextField({ name: 'cabinet_type' }))
    addField(new TextField({ name: 'rack_serial_number' }))
    addField(new TextField({ name: 'address' }))
    addField(new NumberField({ name: 'battery_count' }))
    addField(new NumberField({ name: 'rectifier_count' }))
    addField(new TextField({ name: 'network_type' }))
    addField(new BoolField({ name: 'is_active' }))
    addField(new BoolField({ name: 'is_in_stock' }))
    addField(new TextField({ name: 'utility' }))
    addField(new NumberField({ name: 'pendency' }))
    addField(new TextField({ name: 'step_number' }))
    addField(new TextField({ name: 'process_status' }))
    addField(new TextField({ name: 'air_conditioned' }))
    addField(new TextField({ name: 'armored' }))
    addField(new NumberField({ name: 'contract_value' }))
    addField(new DateField({ name: 'installation_date' }))
    addField(new NumberField({ name: 'latitude' }))
    addField(new NumberField({ name: 'longitude' }))
    addField(new TextField({ name: 'sr_specification' }))
    addField(new NumberField({ name: 'kwh_total' }))
    addField(new NumberField({ name: 'battery_level' }))
    addField(new NumberField({ name: 'uptime' }))
    addField(new NumberField({ name: 'mttr_hours' }))

    app.save(col)

    // Deduplicate fcu_code before adding unique index
    app
      .db()
      .newQuery(`
    DELETE FROM assets WHERE id NOT IN (
      SELECT MIN(id) FROM assets GROUP BY fcu_code
    ) AND fcu_code IS NOT NULL AND fcu_code != ''
  `)
      .execute()

    col.addIndex('idx_assets_fcu_code', true, 'fcu_code', '')
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('assets')
    col.listRule = null
    col.viewRule = null
    col.createRule = null
    col.updateRule = null
    col.deleteRule = null
    app.save(col)
  },
)
