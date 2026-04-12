migrate(
  (app) => {
    // 1. Add 'role' field to users collection
    const usersCol = app.findCollectionByNameOrId('users')
    if (!usersCol.fields.getByName('role')) {
      usersCol.fields.add(
        new SelectField({
          name: 'role',
          values: ['superuser', 'admin', 'user'],
          maxSelect: 1,
          required: true,
        }),
      )
      app.save(usersCol)
    }

    // Ensure existing users have a valid default role
    app.db().newQuery("UPDATE users SET role = 'user' WHERE role IS NULL OR role = ''").execute()

    // 2. Add fields to assets collection
    const assetsCol = app.findCollectionByNameOrId('assets')

    const fieldsToAdd = [
      new TextField({ name: 'fcu_code' }),
      new TextField({ name: 'asset_name' }),
      new TextField({ name: 'asset_state' }),
      new TextField({ name: 'uf_code' }),
      new TextField({ name: 'city' }),
      new TextField({ name: 'cabinet_type' }),
      new TextField({ name: 'rack_serial_number' }),
      new TextField({ name: 'address' }),
      new NumberField({ name: 'battery_qty' }),
      new NumberField({ name: 'rectifier_number' }),
      new TextField({ name: 'network_type' }),
      new BoolField({ name: 'is_active' }),
      new BoolField({ name: 'is_in_stock' }),
      new TextField({ name: 'utility' }),
      new NumberField({ name: 'pendency' }),
      new TextField({ name: 'step_number' }),
      new TextField({ name: 'process_status' }),
      new BoolField({ name: 'air_conditioning' }),
      new BoolField({ name: 'bluetooth' }),
      new TextField({ name: 'armored' }),
      new TextField({ name: 'iams_regional' }),
      new TextField({ name: 'rack_key' }),
      new TextField({ name: 'holder' }),
      new NumberField({ name: 'monthly_revenue' }),
      new DateField({ name: 'installation_date' }),
      new NumberField({ name: 'latitude' }),
      new NumberField({ name: 'longitude' }),
      new TextField({ name: 'rectifier_spec' }),
      new NumberField({ name: 'uptime' }),
      new NumberField({ name: 'contract_value' }),
    ]

    for (const field of fieldsToAdd) {
      if (!assetsCol.fields.getByName(field.name)) {
        assetsCol.fields.add(field)
      }
    }

    // RBAC API Rules
    assetsCol.listRule =
      "@request.auth.role = 'superuser' || @request.auth.role = 'admin' || @request.auth.role = 'user'"
    assetsCol.viewRule =
      "@request.auth.role = 'superuser' || @request.auth.role = 'admin' || @request.auth.role = 'user'"
    assetsCol.createRule = "@request.auth.role = 'superuser' || @request.auth.role = 'admin'"
    assetsCol.updateRule = "@request.auth.role = 'superuser' || @request.auth.role = 'admin'"
    assetsCol.deleteRule = "@request.auth.role = 'superuser'"

    app.save(assetsCol)

    // Deduplicate fcu_code to ensure unique index succeeds
    app
      .db()
      .newQuery(`
      DELETE FROM assets WHERE id NOT IN (
        SELECT MIN(id) FROM assets GROUP BY fcu_code
      ) AND fcu_code IS NOT NULL AND fcu_code != ''
    `)
      .execute()

    assetsCol.addIndex('idx_assets_fcu_code', true, 'fcu_code', "fcu_code != ''")
    app.save(assetsCol)
  },
  (app) => {
    // Revert users collection
    const usersCol = app.findCollectionByNameOrId('users')
    if (usersCol.fields.getByName('role')) {
      usersCol.fields.removeByName('role')
      app.save(usersCol)
    }

    // Revert assets collection
    const assetsCol = app.findCollectionByNameOrId('assets')
    assetsCol.listRule = null
    assetsCol.viewRule = null
    assetsCol.createRule = null
    assetsCol.updateRule = null
    assetsCol.deleteRule = null

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
      'uptime',
      'contract_value',
    ]
    for (const field of fieldsToRemove) {
      if (assetsCol.fields.getByName(field)) {
        assetsCol.fields.removeByName(field)
      }
    }
    assetsCol.removeIndex('idx_assets_fcu_code')

    app.save(assetsCol)
  },
)
