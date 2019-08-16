const {tapp} = require('../lib');
const {api, _assert, pg_connect, pg_disconnect} = require('219-openacs-api');

/*

    contractS LIST

*/

module.exports = list_contracts;

async function list_contracts (o) {
  const {app_instance, verbose} = o;
  _assert(app_instance, o, "Missing app_instance.")
  const {package_id, app_folder,
    contracts_folder} = app_instance;
  _assert(package_id, o, "Missing package_id.")
  _assert(app_folder, o, "Missing app_folder.")
  _assert(contracts_folder, o, "Missing contracts_folder.")


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
  `, {parent_id:contracts_folder}, {single:false})

  folders.forEach(folder =>{
    if (verbose) {
      console.log({folder})
    } else {
      const {folder_id, content_type, parent_id, name, label, username, email, user_id} = folder;
      const {object_id, object_type, context_id, package_id} = folder;
      console.log(`-- ${package_id}:${parent_id}:${folder_id} ${object_type} "${name}" agency: district: student:`)
    }
  })

}
