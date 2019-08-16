const {_assert} = require('./utils.js')

module.exports = drop_instance_name;

async function drop_instance_name(o) {
  const {name, folder_id, package_id} = o;
  let {instance_name=name, app_folder=folder_id} = o;

  if (instance_name) {
    const retv = await db.query(`
      -- get-tapp-instance =>{package_id, folder_id}
      select
        package_id, folder_id
      from cr_folders fo, cr_items i
      where (i.item_id = folder_id)
      and (parent_id = -100)
      and (name = $(instance_name));
    `, {instance_name}, {single:true});
    const {package_id, folder_id} = retv;
    await db.query(`
      select content_folder__delete($(folder_id));
    `,{folder_id},{single:true});
    await db.query(`
      select apm_application__delete($(package_id));
    `,{package_id},{single:true});
    return;
  }

  // ------------------------------------------------------------------

  if (folder_id) {
    await db.query(`
      select
        package_id, folder_id
      from cr_folders
      where (folder_id = $(folder_id))
    `,{folder_id},{single:true})
    .then(retv =>{
      if (!retv) throw `tapp-instance-folder:${folder_id} NOT FOUND`;
      const {package_id} = retv;
      return db.query(`
        select apm_application__delete($(package_id));
      `,{package_id},{single:true})
    })
    .then(() =>{
      return db.query(`
        select content_folder__delete($(folder_id));
      `,{folder_id},{single:true});
    })
    .catch(err =>{
      console.log(err)
    });
    return;
  } // case folder_id.

  // ------------------------------------------------------------------

  if (package_id) {
    await db.query(`
      select folder_id
      from cr_folders
      where (package_id = $(package_id))
    `,{package_id},{single:true})
    .then(() =>{
      return db.query(`
        select apm_application__delete($(package_id));
      `, {package_id},{single:true})

    })
    return;
  } // case folder_id

} // drop-instance
