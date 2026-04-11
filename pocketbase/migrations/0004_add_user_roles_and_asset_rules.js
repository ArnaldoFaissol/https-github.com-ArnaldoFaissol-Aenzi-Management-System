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

    // 2. Update assets collection API rules to allow RBAC access
    const assetsCol = app.findCollectionByNameOrId('assets')
    assetsCol.listRule = "@request.auth.role = 'superuser' || @request.auth.role = 'admin'"
    assetsCol.viewRule = "@request.auth.role = 'superuser' || @request.auth.role = 'admin'"
    assetsCol.createRule = "@request.auth.role = 'superuser' || @request.auth.role = 'admin'"
    assetsCol.updateRule = "@request.auth.role = 'superuser' || @request.auth.role = 'admin'"
    assetsCol.deleteRule = "@request.auth.role = 'superuser'"
    app.save(assetsCol)
  },
  (app) => {
    // Revert users collection
    const usersCol = app.findCollectionByNameOrId('users')
    if (usersCol.fields.getByName('role')) {
      usersCol.fields.removeByName('role')
      app.save(usersCol)
    }

    // Revert assets collection rules to superuser only (null)
    const assetsCol = app.findCollectionByNameOrId('assets')
    assetsCol.listRule = null
    assetsCol.viewRule = null
    assetsCol.createRule = null
    assetsCol.updateRule = null
    assetsCol.deleteRule = null
    app.save(assetsCol)
  },
)
