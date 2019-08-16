const {_assert} = require('./utils.js')
const {api} = require('219-openacs-api');

module.exports = get_folder;

async function get_folder(o) {
  const {parent_id, name, create_if_not_exists} = o;
  _assert(parent_id, o, "Missing parent_id")
  _assert(name, o, "Missing name")

  function _get_folder(parent_id, name) {
    return db.query(`
      select *
      from cr_folders, cr_items
      where (item_id = folder_id)
      and (parent_id = $(parent_id))
      and (name = $(name));
    `,{parent_id, name},{single:true})
  }

  let folder = await _get_folder(parent_id, name);
  return folder;

/*
  if (!folder && create_if_not_exists) {
    await api.content_folder__new({
      name: instance_name, // UNIQUE`cms-${package_id}`,
      label: `app-folder for tapp::${instance_name}`,
      description: 'app-folder for cms instance: '+instance_name,
      parent_id,
      context_id: null,
      folder_id: null,
      creation_date: new Date(),
      creation_user: null,
      creation_ip: 'localhost',
      package_id,

    })
    let folder = await _get_folder(parent_id, name);
  }
  */
}
