migrate(
  (app) => {
    try {
      // If the user exists, upgrade them to superuser
      const record = app.findAuthRecordByEmail('users', 'arnaldo@herovp.com')
      record.set('role', 'superuser')
      app.save(record)
    } catch (_) {
      // If they do not exist, create the seed superuser record
      const usersCol = app.findCollectionByNameOrId('users')
      const record = new Record(usersCol)
      record.setEmail('arnaldo@herovp.com')
      record.setPassword('Skip@Pass')
      record.setVerified(true)
      record.set('name', 'Arnaldo')
      record.set('role', 'superuser')
      app.save(record)
    }
  },
  (app) => {
    try {
      // Downgrade the seeded superuser on rollback
      const record = app.findAuthRecordByEmail('users', 'arnaldo@herovp.com')
      record.set('role', 'user')
      app.save(record)
    } catch (_) {}
  },
)
