const {_assert} = require('./utils.js')

module.exports = drop_a_folder;

/*
    This is an unfrequent operation.
    It can be slow.
*/

async function drop_a_folder(o) {
  const {parent_id, name, app_instance} = o;
  let {folder_id} = o
//  const {label = name} = o;
  _assert(app_instance, o, "Missing app_instance.")
  const {package_id, app_folder,
    folders_folder} = app_instance;
  _assert(package_id, o, "Missing package_id.")
  _assert(app_folder, o, "Missing app_folder.")
//  _assert(folders_folder, o, "Missing folders_folder.")

  if (!folder_id) {
    _assert(parent_id, o, "Missing parent_id");
    _assert(name, o, "Missing folder name");

    folder_id = await db.query(`
      select *
      from cr_folders, cr_items
      where (item_id = folder_id)
      and (parent_id = $(parent_id))
      and (name = $(name))
      and (package_id = $(package_id));
    `,{name, parent_id:folders_folder, package_id},{single:true})
    .then(folder => {
      return folder && folder.folder_id;
    });
  }

  if (!folder_id) {
    console.log(`alert folder-not-found : `,o)
    return;
  }

  return db.query(`
    select content_folder__delete($(folder_id))
  `,{folder_id},{single:true})
  .then(()=>{
    console.log(`    drop-a-folder ${folder_id} ${parent_id} ${name} completed Ok.`)
  });

}
