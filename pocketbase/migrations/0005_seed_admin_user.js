migrate(
  (app) => {
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'arnaldo@herovp.com')
      return
    } catch (_) {}

    const col = app.findCollectionByNameOrId('_pb_users_auth_')
    const record = new Record(col)
    record.setEmail('arnaldo@herovp.com')
    record.setPassword('Skip@Pass')
    record.setVerified(true)
    record.set('name', 'Admin')
    app.save(record)
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'arnaldo@herovp.com')
      app.delete(record)
    } catch (_) {}
  },
)
