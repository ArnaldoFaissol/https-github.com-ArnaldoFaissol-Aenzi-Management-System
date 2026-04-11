migrate(
  (app) => {
    const assets = app.findCollectionByNameOrId('assets')

    let requiresSecondSave = false
    if (!assets.fields.getByName('fcu_code')) {
      assets.fields.add(
        new TextField({
          name: 'fcu_code',
        }),
      )
      app.save(assets)
      requiresSecondSave = true
    }

    const assetsWithField = requiresSecondSave ? app.findCollectionByNameOrId('assets') : assets
    assetsWithField.addIndex('idx_assets_fcu_code', false, 'fcu_code', '')

    app.save(assetsWithField)
  },
  (app) => {
    const assets = app.findCollectionByNameOrId('assets')

    assets.removeIndex('idx_assets_fcu_code')
    app.save(assets)

    const assetsWithoutIndex = app.findCollectionByNameOrId('assets')
    if (assetsWithoutIndex.fields.getByName('fcu_code')) {
      assetsWithoutIndex.fields.removeByName('fcu_code')
      app.save(assetsWithoutIndex)
    }
  },
)
