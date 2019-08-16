const {_assert} = require('./utils.js')

module.exports = register_a_district;

/*
    This is an unfrequent operation.
    It can be slow.
*/

async function register_a_district(o) {
  const {name, app_instance, xray} = o;
  const {district_name =name, label =district_name} = o;
  _assert(district_name, o, "Missing district name")
  _assert(app_instance, o, "Missing app_instance")
  const {package_id, app_folder,
    districts_folder} = app_instance;
  _assert(package_id, o, "Missing package_id")
  _assert(app_folder, o, "Missing app_folder")
  _assert(districts_folder, o, "Missing districts_folder")

  /*
    lookup for an existsing district.
  */

  const _districts = app_instance._districts;
  let district = _districts && _districts[district_name];

  if (!district) {
    district = await db.query(`
      select *
      from cr_folders, cr_items
      where (item_id = folder_id)
      and (parent_id = $(parent_id))
      and (name = $(name));
    `,{parent_id:districts_folder, name: district_name},{single:true});
  }

  if (!district) {
    await api.content_folder__new({
      parent_id: districts_folder,
      name: district_name,
      label,
      package_id,
      context_id: districts_folder
    })
    .then(folder_id =>{
      district = {folder_id}
    })
    .catch(err =>{
      if (err.code != 23505) throw err;
      console.log(`ALERT district@42 : `, err.detail)
    })
  } else {
    console.log(`\t district ${district_name}`)
  }

  const {folder_id} = district;
  _assert(folder_id, district, 'fatal@53')


/*
  await db.query(`
    update cr_items set content_type = 'tapp.contract'
    where (item_id = ${folder_id})
    `, {folder_id},{single:true})

  await db.query(`
    update acs_objects set object_type = 'tapp.contract'
    where (object_id = ${folder_id})
    `, {folder_id},{single:true})
*/

  if (xray) {
    await tapp.xray_folder({folder_id})
  }

}
