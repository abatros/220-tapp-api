const {_assert} = require('./utils.js')

module.exports = register_a_school;

/*
    This is an unfrequent operation.
    It can be slow.
*/

async function register_a_school(o) {
  const {name, app_instance, verbose} = o;
  const {school_name =name} = o;
  _assert(school_name, o, `Missing school name (name:${name})`)
  const {label = name} = o;
  let {district_id} = o;

  _assert(school_name, o, "Missing school name.")
  _assert(app_instance, o, "Missing app_instance.")
  const {package_id, app_folder,
    schools_folder, districts_folder
    } = app_instance;
  _assert(package_id, o, "Missing package_id.")
  _assert(app_folder, o, "Missing app_folder.")
  _assert(schools_folder, o, "Missing schools_folder.")

  /*
    FIRST lookup on district
    and create a relation... TODO
  */



  if (!district_id && district_name) {
    district_id = await db.query(`
      select *
      from cr_folders, cr_items
      where (item_id = folder_id)
      and (parent_id = $(parent_id))
      and (name = $(name));
    `,{name:district_name, parent_id:districts_folder},{single:true})
    .then(retv =>{
      return retv && retv.folder_id;
    })
  }

  /*
    lookup for an existsing school.
  */
  const _schools = app_instance._schools;
  let school = _schools && _schools[school_name];

  if (!school) {
    school = await api.content_item__get({
      parent_id:schools_folder,
      name: school_name,
    })
  }

  if (!school) {
    const item_id = await api.content_item__new({
      parent_id: schools_folder,
      name: school_name,
      label: school_name,
      package_id,
      context_id: schools_folder,
      item_subtype: 'tapp.school'
    })
    .catch(err =>{
      if (err.code != 23505) throw err;
      console.log(`ALERT school@42 : `, err.detail)
    })
  }
}
