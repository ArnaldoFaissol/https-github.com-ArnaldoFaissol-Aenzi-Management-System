migrate(
  (app) => {
    const collection = new Collection({
      name: 'rollout_stages',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'superuser' || @request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'superuser' || @request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'superuser' || @request.auth.role = 'admin'",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'order', type: 'number', required: true },
        { name: 'responsibility', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('rollout_stages')
    app.delete(collection)
  },
)
