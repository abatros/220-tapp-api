const {_assert} = require('./utils.js')

module.exports = drop_an_agency;

/*
    This is an unfrequent operation.
    It can be slow.
*/

async function drop_an_agency(o) {
  const {name, app_instance} = o;
  let {folder_id} = o
//  const {label = name} = o;
  _assert(name, o, "Missing agency name.")
  _assert(app_instance, o, "Missing app_instance.")
  const {package_id, app_folder,
    agencies_folder} = app_instance;
  _assert(package_id, o, "Missing package_id.")
  _assert(app_folder, o, "Missing app_folder.")
  _assert(agencies_folder, o, "Missing agencies_folder.")

  if (!folder_id) {
    folder_id = await db.query(`
      select *
      from cr_folders, cr_items
      where (item_id = folder_id)
      and (parent_id = $(parent_id))
      and (name = $(name));
    `,{name, parent_id:agencies_folder},{single:true})
    .then(folder => {
      return folder && folder.folder_id;
    });
  }

  if (!folder_id) {
    console.log(`alert agency-not-found : `,o)
    return;
  }

  return db.query(`
    select content_folder__delete($(folder_id))
  `,{folder_id},{single:true});

}
