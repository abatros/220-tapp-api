const {_assert} = require('./utils.js')

/*

    LIST agencies

*/

module.exports = list_agencies;

async function list_agencies (o) {
  const {app_instance, verbose} = o;
  _assert(app_instance, o, "Missing app_instance.")
  const {package_id, app_folder,
    agencies_folder} = app_instance;
  _assert(package_id, o, "Missing package_id.")
  _assert(app_folder, o, "Missing app_folder.")
  _assert(agencies_folder, o, "Missing agencies_folder.")

  //let district_id; // ?????????????????????//

  const folders = await db.query(`
    select f.*, i.*,
    o.object_type, o.context_id, o.title
    from cr_folders f, cr_items i, acs_objects o
    where (item_id = folder_id)
    and (object_id = folder_id)
    and (i.parent_id = $(parent_id))
    order by parent_id;
  `, {parent_id:agencies_folder}, {single:false})

  folders.forEach(folder =>{
    if (verbose) {
      console.log({folder})
    } else {
      const {folder_id, content_type, parent_id, name, label} = folder;
      const {object_id, object_type, context_id, package_id} = folder;
      console.log(`-- ${package_id}:${folder_id}:${object_type} [${parent_id}:${name}] label:"${label}"`)
    }
  })

}
