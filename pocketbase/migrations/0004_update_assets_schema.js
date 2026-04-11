migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('assets')

    col.listRule = "@request.auth.id != ''"
    col.viewRule = "@request.auth.id != ''"
    col.createRule = "@request.auth.id != ''"
    col.updateRule = "@request.auth.id != ''"
    col.deleteRule = "@request.auth.id != ''"

    const newFields = [
      new TextField({ name: 'fcu_code', required: true }),
      new NumberField({ name: 'monthly_revenue' }),
      new DateField({ name: 'installation_date' }),
      new NumberField({ name: 'battery_qty' }),
      new BoolField({ name: 'air_conditioning' }),
      new NumberField({ name: 'rectifier_number' }),
      new TextField({ name: 'rectifier_spec' }),
      new NumberField({ name: 'latitude' }),
      new NumberField({ name: 'longitude' }),
      new BoolField({ name: 'bluetooth' }),
      new TextField({ name: 'iams_regional' }),
      new TextField({ name: 'rack_key' }),
      new TextField({ name: 'holder' }),
      new TextField({ name: 'asset_name' }),
      new SelectField({
        name: 'asset_state',
        values: ['Operacional', 'Em Implantação', 'Em Manutenção', 'Desativado'],
        maxSelect: 1,
      }),
      new TextField({ name: 'uf_code' }),
      new TextField({ name: 'city' }),
      new TextField({ name: 'cabinet_type' }),
      new TextField({ name: 'rack_serial_number' }),
      new TextField({ name: 'address' }),
      new TextField({ name: 'network_type' }),
      new BoolField({ name: 'is_active' }),
      new BoolField({ name: 'is_in_stock' }),
      new TextField({ name: 'utility' }),
      new NumberField({ name: 'pendency' }),
      new TextField({ name: 'step_number' }),
      new TextField({ name: 'process_status' }),
      new TextField({ name: 'armored' }),
      new NumberField({ name: 'battery_level' }),
      new NumberField({ name: 'uptime' }),
      new NumberField({ name: 'mttr_hours' }),
    ]

    // Step 1: Add missing fields safely without dropping them to avoid SQLite schema cache issues.
    // Dropping and re-adding columns in the same transaction causes "no such column" errors.
    for (const field of newFields) {
      const existing = col.fields.getByName(field.name)
      if (!existing) {
        col.fields.add(field)
      } else {
        existing.required = field.required
        if (field.type === 'select') {
          existing.values = field.values
          existing.maxSelect = field.maxSelect
        }
      }
    }

    // Step 2: Delete existing records directly from SQLite to prevent UNIQUE constraint errors
    // or missing required data errors when adding the new schema fields.
    try {
      app.db().newQuery('DELETE FROM assets').execute()
    } catch (e) {
      console.log('Delete error:', e)
    }

    // Step 3: Add the unique index
    col.addIndex('idx_assets_fcu_code', true, 'fcu_code', '')

    // Step 4: Save final synchronized schema
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('assets')
    col.removeIndex('idx_assets_fcu_code')

    const fieldNames = [
      'fcu_code',
      'monthly_revenue',
      'installation_date',
      'battery_qty',
      'air_conditioning',
      'rectifier_number',
      'rectifier_spec',
      'latitude',
      'longitude',
      'bluetooth',
      'iams_regional',
      'rack_key',
      'holder',
      'asset_name',
      'asset_state',
      'uf_code',
      'city',
      'cabinet_type',
      'rack_serial_number',
      'address',
      'network_type',
      'is_active',
      'is_in_stock',
      'utility',
      'pendency',
      'step_number',
      'process_status',
      'armored',
      'battery_level',
      'uptime',
      'mttr_hours',
    ]

    for (const name of fieldNames) {
      const f = col.fields.getByName(name)
      if (f) col.fields.removeById(f.id)
    }

    app.save(col)
  },
)
