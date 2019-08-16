const {_assert} = require('./utils.js')

/*

    LIST SCHOOLS

*/

module.exports = list_schools;

async function list_schools (o) {
  const {app_instance, verbose} = o;
  _assert(app_instance, o, "Missing app_instance.")
  const {package_id, app_folder,
    schools_folder} = app_instance;
  _assert(package_id, o, "Missing package_id.")
  _assert(app_folder, o, "Missing app_folder.")
  _assert(schools_folder, o, "Missing schools_folder.")

  let district_id; // ?????????????????????//

  const folders = await db.query(`
    select f.*, i.*,
    o.object_type, o.context_id, o.title
    from cr_folders f, cr_items i, acs_objects o
    where (item_id = folder_id)
    and (object_id = folder_id)
    and (i.parent_id = $(parent_id))
    order by parent_id;
  `, {parent_id:schools_folder}, {single:false})

  folders.forEach(folder =>{
    if (verbose) {
      console.log({folder})
    } else {
      const {folder_id, content_type, parent_id, name, label} = folder;
      const {object_id, object_type, context_id, package_id} = folder;
      console.log(`-- ${package_id}:${folder_id}:${object_type} [${parent_id}:${name}] label:"${label}"  district:${district_id}`)
    }
  })

}
