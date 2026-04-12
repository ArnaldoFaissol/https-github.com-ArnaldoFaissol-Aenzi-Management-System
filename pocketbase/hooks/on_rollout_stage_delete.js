onRecordAfterDeleteSuccess((e) => {
  const id = e.record.id
  try {
    const stages = $app.findRecordsByFilter('rollout_stages', '1=1', 'order', 1, 0)
    if (stages && stages.length > 0) {
      const first = stages[0]
      $app
        .db()
        .newQuery(
          'UPDATE assets SET step_number = {:newId}, process_status = {:newName} WHERE step_number = {:oldId}',
        )
        .bind({ newId: first.id, newName: first.get('name'), oldId: id })
        .execute()
    }
  } catch (err) {
    console.error(err)
  }
  e.next()
}, 'rollout_stages')
