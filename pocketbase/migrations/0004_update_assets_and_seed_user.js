migrate(
  (app) => {
    // 1. Update Assets collection to implement Ownership and Auth restrictions
    const assets = app.findCollectionByNameOrId('assets')

    if (!assets.fields.getByName('user')) {
      assets.fields.add(
        new RelationField({
          name: 'user',
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
          required: false,
        }),
      )
    }

    // Set the specific RLS rules
    assets.listRule = "@request.auth.id != '' && user = @request.auth.id"
    assets.viewRule = "@request.auth.id != '' && user = @request.auth.id"
    assets.createRule = "@request.auth.id != ''"
    assets.updateRule = "@request.auth.id != '' && user = @request.auth.id"
    assets.deleteRule = "@request.auth.id != '' && user = @request.auth.id"

    app.save(assets)

    // 2. Seed Admin User
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'arnaldo@herovp.com')
    } catch (_) {
      const admin = new Record(users)
      admin.setEmail('arnaldo@herovp.com')
      admin.setPassword('Skip@Pass')
      admin.setVerified(true)
      admin.set('name', 'Admin')
      app.save(admin)
    }
  },
  (app) => {
    const assets = app.findCollectionByNameOrId('assets')

    if (assets.fields.getByName('user')) {
      assets.fields.removeByName('user')
    }

    assets.listRule = null
    assets.viewRule = null
    assets.createRule = null
    assets.updateRule = null
    assets.deleteRule = null

    app.save(assets)

    try {
      const admin = app.findAuthRecordByEmail('_pb_users_auth_', 'arnaldo@herovp.com')
      app.delete(admin)
    } catch (_) {}
  },
)
