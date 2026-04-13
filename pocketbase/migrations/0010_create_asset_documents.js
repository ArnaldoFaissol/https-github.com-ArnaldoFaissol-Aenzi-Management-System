migrate(
  (app) => {
    const collection = new Collection({
      name: 'asset_documents',
      type: 'base',
      listRule:
        "@request.auth.role = 'superuser' || @request.auth.role = 'admin' || @request.auth.role = 'user'",
      viewRule:
        "@request.auth.role = 'superuser' || @request.auth.role = 'admin' || @request.auth.role = 'user'",
      createRule: "@request.auth.role = 'superuser' || @request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'superuser' || @request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'superuser' || @request.auth.role = 'admin'",
      fields: [
        {
          name: 'asset_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('assets').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'file',
          type: 'file',
          required: true,
          maxSelect: 1,
          maxSize: 52428800,
        },
        {
          name: 'name',
          type: 'text',
        },
        {
          name: 'category',
          type: 'select',
          values: ['Contract', 'Audit Report', 'Other'],
          maxSelect: 1,
        },
        {
          name: 'created',
          type: 'autodate',
          onCreate: true,
          onUpdate: false,
        },
        {
          name: 'updated',
          type: 'autodate',
          onCreate: true,
          onUpdate: true,
        },
      ],
      indexes: [],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('asset_documents')
    app.delete(collection)
  },
)
