//const tapp = require('../lib');
//const {api, _assert, pg_connect, pg_disconnect} = require('219-openacs-api');
const {_assert} = require('./utils.js')
const {api} = require('219-openacs-api');

/*

    LIST DISTRICTS
    from app_instance or query on database ?

*/

module.exports = list_districts;

async function list_districts (o) {
  const {app_instance, verbose} = o;
  _assert(app_instance, o, "Missing app_instance.")
  const {package_id, app_folder,
    districts_folder} = app_instance;
  _assert(package_id, o, "Missing package_id.")
  _assert(app_folder, o, "Missing app_folder.")
  _assert(districts_folder, o, "Missing districts_folder.")

  const folders = await db.query(`
    select f.*, i.*,
    o.object_type, o.context_id, o.title
    from cr_folders f, cr_items i, acs_objects o
    where (item_id = folder_id)
    and (object_id = folder_id)
    and (i.parent_id = $(parent_id))
    order by parent_id;
  `, {parent_id:districts_folder}, {single:false})

  for (folder of folders) {
    const {folder_id, label} = folder;
    await api.content_folder__delete({folder_id, cascade:true});
    console.log(`district "${label}" DELETED.`)
  }

}
