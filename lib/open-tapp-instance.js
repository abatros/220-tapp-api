const {_assert, xnor1} = require('./utils.js')
const get_folder = require('./get-folder.js')
const get_tapp_instance = require('./get-tapp-instance.js')
//const xx = require('./index.js');
//console.log('open-tapp-instance',{xx})

const {api} = require('219-openacs-api');

/*

    get-app-instance (create-if-not-exists)

*/
async function db_open(conn) {
  conn = conn||{};
  const {verbose} = conn;

  const {
    host = process.env.PGHOST,
    port = process.env.PGPORT || 5432,
    database = process.env.PGDATABASE,
    user = process.env.PGUSER || 'postgres',
    password = process.env.PGPASSWORD,
    pg_monitor = false
  } = conn;
  conn = {
    host, port, database, user, password, pg_monitor, verbose
  }
  console.log(`db_open connecting...`);
  verbose && console.log({conn})
  const {db} = await pg_connect(conn)
  .catch(err =>{
    console.log({conn})
    throw err;
  });
  console.log(`connected.`);
  return db;
}


module.exports = open_tapp_instance;

async function open_tapp_instance (o) {
  const {host,port,database,user,password,verbose,pg_monitor} = o;
//  const api = openacs_api;
  _assert(api,"","FATAL@41")
//  await db_open({host,port,database,user,password,verbose,pg_monitor})

  const {name, create_if_not_exists} = o;
  let {instance_name=name} = o;
  //console.log(`get-tapp-instance : `,o)

  /**************************
  let app_instance = await db.query(`
    -- get-tapp-instance =>{package_id, folder_id}
    select
      p.package_id, instance_name, folder_id
    from apm_packages p, cr_folders fo, cr_items i
    where (package_key = 'tapp')
    and (i.item_id = folder_id)
    and (name = $(instance_name))
    and (fo.package_id = p.package_id)
    and (instance_name = $(instance_name))
    order by p.package_id;
  `, {instance_name}, {single:true});
  *******************************************/

  let app_instance = await get_tapp_instance({instance_name});

  //console.log({app_instance})
  _assert(app_instance,'','')

  if (!app_instance && create_if_not_exists) {
    app_instance = await create_app({instance_name})
  }

  //console.log(`open-tap-instance@66 =>`,{app_instance})
  const {folder_id:app_folder, package_id} = app_instance;
  _assert(app_folder, app_instance, "Missing app_folder")


  /**************************************************

    check for app_group

  ***************************************************/

  app_instance.app_group = await get_the_app_group();
  _assert(Number.isInteger(app_instance.app_group), "@83", 'Invalid app_group')

  async function get_the_app_group() {
    let app_group = await api.application_group__group_id_from_package_id({
      package_id:app_instance.package_id,
      //    no_complain: false
    }).catch(err =>{
      console.log(`api.application_group__group_id_from_package_id =>err.code:${err.code}`)
  //    throw err;
    });

    if (!app_group) {
      app_group = await api.application_group__new({
        package_id,
        group_type:'tapp.community',
        group_name: instance_name
      })
    }

    console.log(`@89:`,{
      app_group
    });

    _assert(app_group, "@90", 'Missing app_group')
    return app_group;
  }

  /**************************************************************

  ensure rel-segments (later for permissions)

  ***************************************************************/

//  await create_agency_tutor_rel_type();
//  await create_contract_tutor_rel_type();
//  await create_contract_student_rel_type();
//  await create_contract_agency_rel_type();
//  await create_school_student_rel_type();
//  await create_school_student_rel_type();

  await create_rel_type_registered_tutor()
  await create_rel_type_registered_student()

  await create_tutor_segment({app_group:app_instance.app_group})
  await create_student_segment({app_group:app_instance.app_group})

  function create_tutor_segment(o) {
    const {app_group, context_id} = o;
    return api.rel_segment__new({
      object_type: 'rel_segment', // should be tutor-segment
      segment_name: 'tapp-instance-registered-tutors',
      group_id: app_group,
      rel_type: 'tapp.registered-tutor',
      context_id
    })
    .then(retv =>{
      console.log(`api.rel_segment__new =>`,{retv})
    })
    .catch(err =>{
      if (err.code != 23505) throw err;
      console.log(`api.rel_segment__new =>`,err.detail)
    })
  }

  async function create_rel_type_registered_tutor() {

    await api.acs_rel_type__create_type({
      rel_type: 'tapp.registered-tutor',             // object_type
      object_type_one: 'group',      // object_type
//      role_one,             // acs_rel_role
//      min_n_rels_one =0,
//      max_n_rels_one,
      object_type_two: 'user',
//      role_two: 'tapp.tutor', MUST BE IN TABLE acs_rel_roles....
//      min_n_rels_two =0,
//      max_n_rels_two,
//      composable_p = true,

      // acs_object_types
      pretty_name: 'tapp-instance Registered Tutor',
      pretty_plural: 'tapp-instance Registered Tutors',
//      supertype: ,            // object_type
//      table_name,
//      id_column,
//      package_name,
    })
    .then(retv =>{
      console.log(`api.acs_rel_type__create_type =>`,{retv})
    })
    .catch(err =>{
      if (err.code != 23505) throw err;
      console.log(`api.acs_rel_type__create_type =>`,err.detail)
    })
//    process.exit(-1);
  }

  function create_student_segment(o) {
    const {app_group, context_id} = o;
    return api.rel_segment__new({
      object_type: 'rel_segment', // should be tutor-segment
      segment_name: 'tapp-instance-registered-students',
      group_id: app_group,
      rel_type: 'tapp.registered-student',
      context_id
    })
    .then(retv =>{
      console.log(`api.rel_segment__new =>`,{retv})
    })
    .catch(err =>{
      if (err.code != 23505) throw err;
      console.log(`api.rel_segment__new =>`,err.detail)
    })
  }

  async function create_rel_type_registered_student() {

    await api.acs_rel_type__create_type({
      rel_type: 'tapp.registered-student',             // object_type
      object_type_one: 'group',      // object_type
//      role_one,             // acs_rel_role
//      min_n_rels_one =0,
//      max_n_rels_one,
      object_type_two: 'user',
//      role_two: 'tapp.tutor', MUST BE IN TABLE acs_rel_roles....
//      min_n_rels_two =0,
//      max_n_rels_two,
//      composable_p = true,

      // acs_object_types
      pretty_name: 'tapp-instance Registered Student',
      pretty_plural: 'tapp-instance Registered Students',
//      supertype: ,            // object_type
//      table_name,
//      id_column,
//      package_name,
    })
    .then(retv =>{
      console.log(`api.acs_rel_type__create_type =>`,{retv})
    })
    .catch(err =>{
      if (err.code != 23505) throw err;
      console.log(`api.acs_rel_type__create_type =>`,err.detail)
    })
//    process.exit(-1);
  }





  /**************************************************

    check for folders

  ***************************************************/


  const fnames = [
    'students-folder',
    'tutors-folder',
    'districts-folder',
    'schools-folder',
    'agencies-folder',
  ];

  for (const name of fnames) {
    const vname = name.replace(/-/g,'_');
    const folder = await get_folder({
      parent_id: app_folder,
      name,
      create_if_not_exists: true
    })
    // console.log(`each sub-folder (${name}) =>`,folder)
    if (folder) {
      app_instance[vname] = folder.folder_id;
      _assert(app_instance[vname], folder, `Missing (${name})@97`)
      //console.log({app_instance})
      continue;
    }

    _assert(folder,'','stop@103')
continue;
    await api.content_folder__new({
      parent_id: app_folder,
      name,
      label: name,
      package_id,
      context_id: app_folder
    })
    .then(folder_id =>{
      console.log(`api.content_folder__new(name:${name})@111 => folder_id:`,folder_id)
      app_instance[vname] = folder_id;
    })
    .catch(err =>{
      console.log(`content_folder__new(${name}) => err:`,err.detail)
      if (err.code != 23505) throw err;
    })

  }

  _assert(app_instance.districts_folder, app_instance, "Missing districts_folder@120")





  return app_instance;


  await db.withTransaction(async tx =>{


    _assert(app_folder, o, "Missing app_folder @97")

    const org_folder = await tx.query(`
      select content_folder__new(
        $(name),
        $(label),
        $(description),
        $(parent_id),
        $(context_id),
        $(folder_id),
        $(creation_date),
        $(creation_user),
        $(creation_ip),
        $(package_id)) as folder_id;
      `, {
        name: `organizations-folder`,
        label: `organizations-folder for cms-${package_id}`,
        description: 'organizations-folder for cms instance: '+instance_name,
        parent_id: app_folder,
        context_id: null,
        folder_id: null,
        creation_date: new Date(),
        creation_user: null,
        creation_ip: 'localhost',
        package_id,
      }, {single:true})
      .then(retv =>{
        console.log(`organization_folder => retv:`,retv)
        return retv.folder_id;
      })
      .catch(err =>{
        if (err.code != 23505) throw err;
        console.log(`error@130 code:${err.code} => ${err.detail}`);
        if (!err.detail) console.log(err)
      });

    const clients_folder = await tx.query(`
      select content_folder__new(
        $(name),
        $(label),
        $(description),
        $(parent_id),
        $(context_id),
        $(folder_id),
        $(creation_date),
        $(creation_user),
        $(creation_ip),
        $(package_id)) as folder_id;
      `, {
        name: `clients-folder`,
        label: `clients-folder for cms-${package_id}`,
        description: 'clients-folder for cms instance: '+instance_name,
        parent_id: app_folder,
        context_id: null,
        folder_id: null,
        creation_date: new Date(),
        creation_user: null,
        creation_ip: 'localhost',
        package_id,
      }, {single:true})
    .then(retv =>{
        console.log(`clients_folder => retv:`,retv)
        return retv.folder_id;
    })
    .catch(err =>{
        console.log(`error@163 code:${err.code} => ${err.detail}`);
        if (!err.detail) console.log(err)
    });

    const group_id = await application_group__new({
      db:tx,
      group_name: `group::${instance_name}`,
      group_type: 'tapp-community',
      context_id: package_id,
      package_id
    });

  })
  .then(retv =>{
    console.log(`transaction => retv:`,retv)
  })
  .catch(err =>{
    console.log(`transaction => err:`,err)
  });
}


async function create_app(o) {
  const {instance_name, verbose} = o;

  const app_instance = {
    application_id: null,
    instance_name,
    package_key: 'tapp',
    object_type: 'apm_application',
    creation_date: new Date(),
    creation_user: null,
    creation_ip: 'localhost',
    context_id: null
  }

  await db.withTransaction(async tx =>{

    const package_id = await tx.query(`
      select apm_application__new(
        $(application_id),
        $(instance_name),
        $(package_key),
        $(object_type),
        $(creation_date),
        $(creation_user),
        $(creation_ip),
        $(context_id)) as package_id;
      `, app_instance, {single:true})
    .then(retv =>{
      verbose && console.log(`application_new => `,{retv})
      return retv.package_id;
    })
    .catch(async err =>{
      if (err.code != 23505) throw err;
      console.log(`error@45 code:${err.code} => ${err.detail}`);
      const package_id = await tx.query(`
        select package_id from apm_applications
        where (instance_name = $(instance_name));
      `,{instance_name}, {single:true})
      .then(retv =>{
        return retv.package_id
      })
      _assert(package_id, o, 'Unable to retrive package_id @49')
    });

    const app_folder = await tx.query(`
      select content_folder__new(
        $(name),
        $(label),
        $(description),
        $(parent_id),
        $(context_id),
        $(folder_id),
        $(creation_date),
        $(creation_user),
        $(creation_ip),
        $(package_id)) as folder_id;
      `, {
        name: `tapp::${instance_name}`, // UNIQUE`cms-${package_id}`,
        label: `app-folder for tapp::${instance_name}`,
        description: 'app-folder for cms instance: '+instance_name,
        parent_id: -100,
        context_id: null,
        folder_id: null,
        creation_date: new Date(),
        creation_user: null,
        creation_ip: 'localhost',
        package_id,
      }, {single:true})
    .then(retv =>{
      console.log(`app_folder => retv:`,retv)
      return retv.folder_id;
    })
    .catch(async err =>{
      if (err.code != 23505) throw err;
      console.log(`error@85 code:${err.code} => ${err.detail}`);
    });
  }) // transaction
  .then(retv =>{
    console.log(`transaction => retv:`,retv)
  })
  .catch(err =>{
    console.log(`transaction => err:`,err)
  });

}
