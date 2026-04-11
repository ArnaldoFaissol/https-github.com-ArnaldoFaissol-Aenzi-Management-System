migrate(
  (app) => {
    const assetsCol = app.findCollectionByNameOrId('assets')

    let needsInitialSave = false

    // 1. Add fields to schema first
    if (!assetsCol.fields.getByName('fcu_code')) {
      assetsCol.fields.add(new TextField({ name: 'fcu_code' }))
      needsInitialSave = true
    }

    if (!assetsCol.fields.getByName('asset_name')) {
      assetsCol.fields.add(new TextField({ name: 'asset_name' }))
      needsInitialSave = true
    }

    if (!assetsCol.fields.getByName('city')) {
      assetsCol.fields.add(new TextField({ name: 'city' }))
      needsInitialSave = true
    }

    if (!assetsCol.fields.getByName('uf_code')) {
      assetsCol.fields.add(new TextField({ name: 'uf_code' }))
      needsInitialSave = true
    }

    if (!assetsCol.fields.getByName('asset_state')) {
      assetsCol.fields.add(
        new SelectField({
          name: 'asset_state',
          values: ['Operacional', 'Desativado', 'Manutenção', 'N/D'],
          maxSelect: 1,
        }),
      )
      needsInitialSave = true
    }

    // MUST save the collection first so the new columns actually exist in SQLite
    // before we run any raw queries on them!
    if (needsInitialSave) {
      app.save(assetsCol)
    }

    // 2. Safely deduplicate records by fcu_code
    app
      .db()
      .newQuery(`
    DELETE FROM assets WHERE id NOT IN (
      SELECT MIN(id) FROM assets GROUP BY fcu_code
    ) AND fcu_code IS NOT NULL AND fcu_code != ''
  `)
      .execute()

    // 3. Add the unique index, ignoring empty strings
    assetsCol.addIndex('idx_assets_fcu_code', true, 'fcu_code', "fcu_code != ''")

    app.save(assetsCol)
  },
  (app) => {
    const assetsCol = app.findCollectionByNameOrId('assets')
    assetsCol.removeIndex('idx_assets_fcu_code')

    const fieldsToRemove = ['fcu_code', 'asset_name', 'city', 'uf_code', 'asset_state']
    let needsSave = false

    for (const field of fieldsToRemove) {
      if (assetsCol.fields.getByName(field)) {
        assetsCol.fields.removeByName(field)
        needsSave = true
      }
    }

    if (needsSave) {
      app.save(assetsCol)
    }
  },
)
