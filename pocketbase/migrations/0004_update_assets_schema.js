migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('assets')

    col.listRule = "@request.auth.id != ''"
    col.viewRule = "@request.auth.id != ''"
    col.createRule = "@request.auth.id != ''"
    col.updateRule = "@request.auth.id != ''"
    col.deleteRule = "@request.auth.id != ''"

    if (!col.fields.getByName('fcu_code'))
      col.fields.add(new TextField({ name: 'fcu_code', required: true }))
    if (!col.fields.getByName('monthly_revenue'))
      col.fields.add(new NumberField({ name: 'monthly_revenue' }))
    if (!col.fields.getByName('installation_date'))
      col.fields.add(new DateField({ name: 'installation_date' }))
    if (!col.fields.getByName('battery_qty'))
      col.fields.add(new NumberField({ name: 'battery_qty' }))
    if (!col.fields.getByName('air_conditioning'))
      col.fields.add(new BoolField({ name: 'air_conditioning' }))
    if (!col.fields.getByName('rectifier_number'))
      col.fields.add(new NumberField({ name: 'rectifier_number' }))
    if (!col.fields.getByName('rectifier_spec'))
      col.fields.add(new TextField({ name: 'rectifier_spec' }))
    if (!col.fields.getByName('latitude')) col.fields.add(new NumberField({ name: 'latitude' }))
    if (!col.fields.getByName('longitude')) col.fields.add(new NumberField({ name: 'longitude' }))
    if (!col.fields.getByName('bluetooth')) col.fields.add(new BoolField({ name: 'bluetooth' }))
    if (!col.fields.getByName('iams_regional'))
      col.fields.add(new TextField({ name: 'iams_regional' }))
    if (!col.fields.getByName('rack_key')) col.fields.add(new TextField({ name: 'rack_key' }))
    if (!col.fields.getByName('holder')) col.fields.add(new TextField({ name: 'holder' }))

    if (!col.fields.getByName('asset_name')) col.fields.add(new TextField({ name: 'asset_name' }))
    if (!col.fields.getByName('asset_state'))
      col.fields.add(
        new SelectField({
          name: 'asset_state',
          values: ['Operacional', 'Em Implantação', 'Em Manutenção', 'Desativado'],
          maxSelect: 1,
        }),
      )
    if (!col.fields.getByName('uf_code')) col.fields.add(new TextField({ name: 'uf_code' }))
    if (!col.fields.getByName('city')) col.fields.add(new TextField({ name: 'city' }))
    if (!col.fields.getByName('cabinet_type'))
      col.fields.add(new TextField({ name: 'cabinet_type' }))
    if (!col.fields.getByName('rack_serial_number'))
      col.fields.add(new TextField({ name: 'rack_serial_number' }))
    if (!col.fields.getByName('address')) col.fields.add(new TextField({ name: 'address' }))
    if (!col.fields.getByName('network_type'))
      col.fields.add(new TextField({ name: 'network_type' }))
    if (!col.fields.getByName('is_active')) col.fields.add(new BoolField({ name: 'is_active' }))
    if (!col.fields.getByName('is_in_stock')) col.fields.add(new BoolField({ name: 'is_in_stock' }))
    if (!col.fields.getByName('utility')) col.fields.add(new TextField({ name: 'utility' }))
    if (!col.fields.getByName('pendency')) col.fields.add(new NumberField({ name: 'pendency' }))
    if (!col.fields.getByName('step_number')) col.fields.add(new TextField({ name: 'step_number' }))
    if (!col.fields.getByName('process_status'))
      col.fields.add(new TextField({ name: 'process_status' }))
    if (!col.fields.getByName('armored')) col.fields.add(new TextField({ name: 'armored' }))
    if (!col.fields.getByName('battery_level'))
      col.fields.add(new NumberField({ name: 'battery_level' }))
    if (!col.fields.getByName('uptime')) col.fields.add(new NumberField({ name: 'uptime' }))
    if (!col.fields.getByName('mttr_hours')) col.fields.add(new NumberField({ name: 'mttr_hours' }))

    app.save(col)

    app
      .db()
      .newQuery(`
    DELETE FROM assets WHERE id NOT IN (
      SELECT MIN(id) FROM assets GROUP BY fcu_code
    )
  `)
      .execute()

    col.addIndex('idx_assets_fcu_code', true, 'fcu_code', '')

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('assets')
    col.removeIndex('idx_assets_fcu_code')
    app.save(col)
  },
)
