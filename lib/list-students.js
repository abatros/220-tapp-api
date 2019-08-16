const {_assert} = require('./utils.js')

/*

    studentS LIST

*/

module.exports = list_students;

async function list_students (o) {
  const {app_instance, verbose} = o;
  _assert(app_instance, o, "Missing app_instance.")
  const {package_id, app_folder,
    students_folder} = app_instance;
  _assert(package_id, o, "Missing package_id.")
  _assert(app_folder, o, "Missing app_folder.")
  _assert(students_folder, o, "Missing students_folder.")


  /*******************************************

  the file.name MUST BE the username or user_id

  ********************************************/

  const folders = await db.query(`
    select f.*, i.*,
        o.object_type, o.context_id, o.title,
        u.username, u.email, u.user_id
    from cr_folders f
    join cr_items i on (item_id = folder_id)
    join acs_objects o on (o.object_id = folder_id)
    left join acs_users_all u on (u.user_id::varchar = i.name)
    where (item_id = folder_id)
    and (object_id = folder_id)
    and (i.parent_id = $(parent_id))
    order by parent_id;
  `, {parent_id:students_folder}, {single:false})

  folders.forEach(folder =>{
    if (verbose) {
      console.log({folder})
    } else {
      const {folder_id, content_type, parent_id, name, label, username, email, user_id} = folder;
      const {object_id, object_type, context_id, package_id} = folder;
      console.log(`-- ${package_id}:${folder_id}:${object_type} [${parent_id}:"${name}"] label:"${label}" user_id:${user_id} email:${email}`)
    }
  })

}
