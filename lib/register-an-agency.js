const {xnor1, _assert} = require('./utils.js');

module.exports = register_an_agency;

/*
    This is an unfrequent operation.
    It can be slow.
*/

async function register_an_agency(o) {
  const {app_instance, verbose} = o;
  let {name} = o; // the alternates
  let {agency_name =name} = o;
  const {title = agency_name} = o;
  agency_name = xnor1(agency_name);

  _assert(agency_name, o, "Missing agency name.")
  _assert(app_instance, o, "Missing app_instance.")
  const {package_id, app_folder,
    agencies_folder
    } = app_instance;
  _assert(package_id, o, "Missing package_id.")
  _assert(app_folder, o, "Missing app_folder.")
  _assert(agencies_folder, o, "Missing agencies_folder.")

  /*
    lookup for an existsing agency.
  */

  let agency = await db.query(`
    select *
    from cr_folders, cr_items
    where (item_id = folder_id)
    and (parent_id = $(parent_id))
    and (name = $(name));
  `,{parent_id:agencies_folder, name:agency_name},{single:true})

  if (!agency) {
    const item_id = await api.content_item__new({
      parent_id: agencies_folder,
      name: agency_name,
      title,
      package_id,
      context_id: agencies_folder,
      item_subtype: 'tapp.agency'
    })
    .catch(err =>{
      if (err.code != 23505) throw err;
      console.log(`ALERT agency@42 : `, err.detail)
    })
  }
}
