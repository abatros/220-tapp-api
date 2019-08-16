//const tapp = require('../lib');
//const {api, _assert, pg_connect, pg_disconnect} = require('219-openacs-api');
const {_assert} = require('./utils.js')
const {api} = require('219-openacs-api');

module.exports = drop_a_district;

/*
    This is an unfrequent operation.
    It can be slow.
*/

async function drop_a_district(o) {
  const {name, app_instance} = o;
  let {folder_id} = o
//  const {label = name} = o;
  _assert(name, o, "Missing district name.")
  _assert(app_instance, o, "Missing app_instance.")
  const {package_id, app_folder,
    districts_folder} = app_instance;
  _assert(package_id, o, "Missing package_id.")
  _assert(app_folder, o, "Missing app_folder.")
  _assert(districts_folder, o, "Missing districts_folder.")

  if (!folder_id) {
    folder_id = await db.query(`
      select *
      from cr_folders, cr_items
      where (item_id = folder_id)
      and (parent_id = $(parent_id))
      and (name = $(name));
    `,{name, parent_id:districts_folder},{single:true})
    .then(folder => {
      return folder && folder.folder_id;
    });
  }

  if (!folder_id) {
    console.log(`alert district-not-found : `,name)
    return;
  }

  return db.query(`
    select content_folder__delete($(folder_id))
  `,{folder_id},{single:true});

}
