const {_assert} = require('./utils.js')

/*

    contractS LIST

*/

module.exports = list_contracts;

async function list_contracts (o) {
  const {app_instance, verbose} = o;
  _assert(app_instance, o, "Missing app_instance.")
  const {package_id, app_folder, districts_folder} = app_instance;
  _assert(package_id, o, "Missing package_id.")
  _assert(app_folder, o, "Missing app_folder.")
  _assert(districts_folder, o, "Missing districts_folder.")


  /*******************************************

  the file.name MUST BE the username or user_id

  ********************************************/
  /*
  select
  folder_id, label, i.parent_id, i2.parent_id as p2--, object_type
  from cr_folders
  join cr_items i on (i.item_id = folder_id)
  join cr_items i2 on (i2.item_id = i.parent_id)
--join acs_objects o on (o.object_id = folder_id)
  where (package_id = 411633)
--and (object_type = 'tapp.contract');
  and (i2.parent_id = 412375)
  */

  const contracts = await db.query(`
    select
      folder_id, label,i.parent_id as district_id, i2.name, i2.parent_id as p2
      --, object_type,
    from cr_folders
    join cr_items i on (i.item_id = folder_id)
    join cr_items i2 on (i2.item_id = i.parent_id)
    --join acs_objects o on (o.object_id = folder_id)
    where (package_id = $(package_id))
    --and (object_type = 'tapp.contract')
    and (i2.parent_id = $(districts_folder));
  `, {districts_folder, package_id}, {single:false})

  contracts.forEach(contract =>{
    if (verbose) {
      console.log({contract})
    } else {
      const {folder_id, label, district_id, p2, name} = contract;
      console.log(`-- ${package_id}:${p2}:${district_id}:(${name}) contract:(${label})`)
    }
  })

}
