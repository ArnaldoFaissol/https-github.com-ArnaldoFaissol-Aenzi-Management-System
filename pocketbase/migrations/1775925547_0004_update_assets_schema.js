migrate(
  (app) => {
    const assets = app.findCollectionByNameOrId('assets')

    // Adiciona o campo fcu_code se ele não existir
    if (!assets.fields.getByName('fcu_code')) {
      assets.fields.add(
        new TextField({
          name: 'fcu_code',
        }),
      )
    }

    // Adiciona um índice na coluna para otimização de busca, de forma idempotente
    assets.addIndex('idx_assets_fcu_code', false, 'fcu_code', '')

    app.save(assets)
  },
  (app) => {
    const assets = app.findCollectionByNameOrId('assets')

    assets.removeIndex('idx_assets_fcu_code')

    if (assets.fields.getByName('fcu_code')) {
      assets.fields.removeByName('fcu_code')
    }

    app.save(assets)
  },
)
