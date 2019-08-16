const {_assert, xnor1} = require('./utils.js')

/*

      reset-instance
      delete all top-level folders

*/




module.exports = reset_instance;

async function reset_instance(o) {

  const {instance_name, verbose, rebuild=true} = o;
  let {app_instance, app_folder, package_id} = o;

  if (instance_name) {
    app_instance = await tapp.get_tapp_instance({instance_name})
  }

  if (!app_instance && app_folder) {
    app_instance = await db.query(`
      select f.*, i.*, p.*
      from cr_folders f, cr_items i, apm_packages p
      where (folder_id = item_id)
      and (p.package_id = f.package_id)
      and (p.package_key = 'tapp')
      and (parent_id = -100)
      and (folder_id = $(app_folder));
    `, {app_folder}, {single:true})
  }

  if (!app_instance && package_id) {
    app_instance = await db.query(`
      select f.*, i.*, p.*
      from cr_folders f, cr_items i, apm_packages p
      where (folder_id = item_id)
      and (p.package_id = f.package_id)
      and (p.package_key = 'tapp')
      and (parent_id = -100)
      and (p.package_id = $(package_id));
    `, {package_id}, {single:true})
  }

  _assert(app_instance, o, 'fatal@49')
  app_folder = app_instance.folder_id;
  package_id = app_instance.package_id;

  _assert(app_folder, o, 'fatal@50')

  console.log(`reset-instance@50:\n`,{app_instance})

  const folders = await db.query(`
      select *
      from cr_folders f, cr_items i
      where (item_id = folder_id)
      and (parent_id = $(app_folder))
      order by parent_id;
    `, {app_folder}, {single:false})




  for (const folder of folders) {
    const {folder_id, object_type, parent_id, name, label} = folder;
    console.log(`-- content_folder__delete(${folder_id})  label:${label}`)
    await db.query(`
      select content_folder__delete($(folder_id), true);
    `,{folder_id},{single:true})
    .catch(err =>{
      if (err.code != 23503) throw err;
      console.log(`[reset-instance]@79 Error.code:${err.code} `,err.detail)
    })
  }

  if (rebuild) {
    _assert(app_folder, o, 'Missing app_folder');
    _assert(package_id, o, 'Missing package_id');

    /****************************************
    await api.content_folder__new({
      name: `districts-folder`,
      label: `tapp districts-folder for ${instance_name}`,
//      description: 'clients-folder for cms instance: '+instance_name,
      parent_id: app_folder,
      context_id: app_folder,
      folder_id: null,
      creation_date: new Date(),
      creation_user: null,
      creation_ip: '127.0.0.1',
      package_id,
    })

    await api.content_folder__new({
      name: `schools-folder`,
      label: `tapp schools-folder for ${instance_name}`,
//      description: 'clients-folder for cms instance: '+instance_name,
      parent_id: app_folder,
      context_id: app_folder,
      folder_id: null,
      creation_date: new Date(),
      creation_user: null,
      creation_ip: '127.0.0.1',
      package_id,
    })

    await api.content_folder__new({
      name: `agencies-folder`,
      label: `tapp agencies-folder for ${instance_name}`,
//      description: 'clients-folder for cms instance: '+instance_name,
      parent_id: app_folder,
      context_id: app_folder,
      folder_id: null,
      creation_date: new Date(),
      creation_user: null,
      creation_ip: '127.0.0.1',
      package_id,
    })

    await api.content_folder__new({
      name: `tutors-folder`,
      label: `tapp tutors-folder for ${instance_name}`,
//      description: 'clients-folder for cms instance: '+instance_name,
      parent_id: app_folder,
      context_id: app_folder,
      folder_id: null,
      creation_date: new Date(),
      creation_user: null,
      creation_ip: '127.0.0.1',
      package_id,
    })

    await api.content_folder__new({
      name: `students-folder`,
      label: `tapp students-folder for ${instance_name}`,
//      description: 'clients-folder for cms instance: '+instance_name,
      parent_id: app_folder,
      context_id: app_folder,
      folder_id: null,
      creation_date: new Date(),
      creation_user: null,
      creation_ip: '127.0.0.1',
      package_id,
    })

    let folder_id = await api.content_folder__new({
      parent_id: app_folder,
      name,
      label: 'label for a-test',
      // not used content_type: 'tapp-organization',
      object_type: 'tapp.contract',
      package_id
    })
******************************/

    for (it of [
      'districts','schools','agencies','tutors','students']) {
      let folder_id = await api.content_folder__new({
        parent_id: app_folder,
        name: it+'-folder',
        label: it+'-folder',
        // not used content_type: 'tapp-organization',
        //object_type: 'tapp.contract',
        context_id: app_folder,
        package_id
      })
      console.log(`(${it})=>`,{folder_id})
    }

  } // rebuild
console.log(`leaving reset-instance`)
}
