const {_assert} = require('./utils.js')
const {api} = require('219-openacs-api');

module.exports = drop_a_student;

/*
    This is an unfrequent operation.
    It can be slow.
*/

async function drop_a_student(o) {
  const {student_id, app_instance} = o;
  let {user_id = student_id} = o
//  const {label = name} = o;

  _assert(user_id, o, "Missing student user_id")
  _assert(app_instance, o, "Missing app_instance")
  const {package_id, app_folder,
    students_folder, schools_folder} = app_instance;
  _assert(package_id, o, "Missing package_id")
  _assert(app_folder, o, "Missing app_folder")
  _assert(students_folder, o, "Missing students_folder")

  /**************************************

  MUST have a student_id:user_id
  first remove the user,
  then remove the folder.

  ***************************************/

  const folder_id = await db.query(`
    select *
    from cr_folders, cr_items
    where (item_id = folder_id)
    and (parent_id = $(parent_id))
    and (name = $(name));
  `, {parent_id: students_folder, name: ''+user_id}, {single:true})
  .then(folder => {
    console.log({folder})
      return folder && folder.folder_id;
    });

  if (!folder_id) {
    console.log(`alert student-folder-not-found : `,o)
  } else {
    await api.content_folder__delete({
      folder_id
    })
  }

  // NEXT DROP THE USER
  await api.acs_user__delete({user_id})

}
