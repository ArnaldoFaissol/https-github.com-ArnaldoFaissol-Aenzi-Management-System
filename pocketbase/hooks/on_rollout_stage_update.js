onRecordAfterUpdateSuccess((e) => {
  const id = e.record.id
  const newName = e.record.get('name')

  $app
    .db()
    .newQuery('UPDATE assets SET process_status = {:newName} WHERE step_number = {:id}')
    .bind({ newName: newName, id: id })
    .execute()

  e.next()
}, 'rollout_stages')
