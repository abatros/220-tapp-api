const {_assert, xnor1} = require('./utils.js')

module.exports = test;

/*
    This is an unfrequent operation.
    It can be slow.
*/

async function test(o) {

  //await xp101_create_contract(o);
  //await xp102_create_agencies(o);
  await test_219_openacs_api()
return;
  // -----------------------------------
}

async function test_219_openacs_api() {
  await api.content_item__get({item_id:411634})
  .then(retv =>{
    console.log({retv})
  })
  //console.log(api2)
}


// ===========================================================================
async function xp102_create_agencies(o) {
  // ========================================
  const {app_instance, verbose} = o;
  _assert(app_instance, o, "Missing app_instance")
  const {package_id, app_folder} = app_instance;
  _assert(package_id, o, "Missing package_id")
  _assert(app_folder, o, "Missing app_folder")
  // ========================================

  let {agencies_folder} = app_instance;

  if (!agencies_folder) {
    agencies_folder = await api.content_folder__new({
      parent_id: app_folder,
      name: 'fake-agencies_folder',
      label: 'label for fake-agencies-folder',
      package_id
    })
  }

  _assert(agencies_folder, '', 'fatal@40');
  console.log({agencies_folder})

  await api.content_folder__register_content_type({
    folder_id: agencies_folder,
    content_type: 'tapp-agency'
  }).catch(err =>{
    console.log(`err@46:`,err)
    process.exit(-1);
  })

  // --------------------------------------------------------------

  async function register_agency(o) {
    const {name} = o;
    let agency_id = await api.content_item__new({
      parent_id: agencies_folder,
      name,
      label: 'label for '+name,
      package_id,
      item_subtype: 'tapp.agency'
    }).catch(err =>{
      if (err.code != 23505) {
        console.log(`fatal@64:`,err.detail)
        throw err;
      }
    })

    if (!agency_id) {
      const item = await api.content_item__get({
        parent_id: agencies_folder,
        name
      });
      _assert(item, '', 'fatal@57');
      console.log(`agency:`,{item})
      agency_id = item.item_id
    } else {
      console.log(`added new item:${agency_id} for ${name}`)
    }

    _assert(agency_id, 'failed to get agency_id', 'fatal@76');
    console.log(`agency:${agency_id} (${name})`)
    await tapp.xray_item(agency_id)
    return agency_id
  }

  const agency_id = await register_agency({
    name: 'fake-agency-101'
  })

  // --------------------------------------------------------------

  if (true) {
    console.log(`# removing 102-test-data.`)
    const folder = await api.content_folder__get({folder_id:agencies_folder})
    if (folder.name == 'fake-agencies') {
      await api.content_folder__delete({folder_id:districts_folder, cascade:true});
      console.log(`content_folder <${folder.name}> DELETED.`)
      return;
    } else {
      console.log(`districts-folder: ${folder.name}`)
    }

    const adoc = await api.content_item__get({item_id:agency_id})
    if (adoc.name == 'fake-agency-101') {
      await api.content_item__delete({item_id:agency_id});
      console.log(`content_item agency <${adoc.name}> DELETED.`)
      return;
    } else {
      console.log(`agency-file: ${adoc.name}`)
    }

  } // removing


}

// ---------------------------------------------------------------------------

async function xp101_create_contract(o) {

  const {app_instance, verbose} = o;
  _assert(app_instance, o, "Missing app_instance")
  const {package_id, app_folder} = app_instance;
  _assert(package_id, o, "Missing package_id")
  _assert(app_folder, o, "Missing app_folder")

    // -------------------------------------------------------------------------

  let {districts_folder} = app_instance;

  if (!districts_folder) {
    districts_folder = await api.content_folder__new({
      parent_id: app_folder,
      name: 'fake-districts',
      label: 'label for fake-districts',
      // not used content_type: 'tapp-organization',
      //object_type: 'tapp.contract',
      package_id
    })
  }

  _assert(districts_folder, '', 'fatal@42');

  let district_id = await api.content_folder__new({
      parent_id: districts_folder,
      name: 'fake-district',
      label: 'label for a-fake-district',
      // not used content_type: 'tapp-organization',
      //object_type: 'tapp.contract',
      package_id
    })
    if (!district_id) {
      const folder = await api.content_folder__get({
        parent_id: districts_folder,
        name: 'fake-district'
      });
      _assert(folder, '', 'fatal@57');
      console.log({folder})
      district_id = folder.folder_id
    } else {
      console.log(`added new folder:${district_id} fake-district`)
    }
  _assert(district_id, '', 'fatal@54');


  let contract_id = await api.content_folder__new({
    parent_id: district_id,
    name: 'contract-101',
    label: 'label for a-fake-contract-folder',
      // not used content_type: 'tapp-organization',
//    item_subtype: 'tapp.contract',
//    content_type: 'tapp.contract',
//    object_type: 'tapp.contract',
    package_id
  })
  .catch(async err =>{
    console.log(`new contract-101:`,err);
    await tapp.xray_folder(district_id);
    throw err;
  })

  if (!contract_id) {
    const folder = await api.content_folder__get({
      parent_id: district_id,
      name: 'contract-101'
    });
    contract_id = folder.folder_id;
  } else {
    console.log(`added new folder:${contract_id} contract-101`)
  }
  _assert(contract_id, 'missing contract_id', 'fatal@80');


  await api.content_folder__register_content_type({
    folder_id: contract_id,
    content_type: 'tapp.contract'
  }).catch(err =>{
    console.log(`err@92:`,err)
    process.exit(-1);
  })

  const docs = [
    '101-contract',
    '102-Income-Benefits',
    '103-Health',
    '104-Education',
    '105-Disabilities',
    '106-Current-Living',
    '107-CCare',
    '108-Assessments',
     // maybe as events instead of file.
    '109-Services-Provided',
    '110-Events',
  ];

  async function register_a_document(o) {
    const {name, contract_id, package_id, item_subtype='tapp.contract', verbose} = o;

    //let doc101_id =
    await api.content_item__new({
      parent_id: contract_id,
      name,
  //    locale,
  //    creation_date = new Date(),
  //    creation_user,
      context_id: contract_id,
  //    creation_ip: '127.0.0.1',
  //    item_subtype: 'acs_object',
      item_subtype, //: 'tapp.contract',
//      content_type: 'tapp.contract',
      title: name,
      description: "a document in the contract folder",
      mime_type: 'text/plain',
      nls_language: 'us_EN',
      text: "never used",
      data: {id:12344}, // ATTENTION JSONB here
  //    relation_tag,
  //    is_live boolean = true,
  //    storage_type = 'TEXT',
      package_id,
  //    with_child_rels = true,
      verbose
    })
    .then(item_id => {
      console.log(`added new content_item:${item_id} name:${name}`)
      //tapp.xray_item(item_id)
      return item_id;
    })
    .catch(async err =>{
      await tapp.xray_folder(contract_id);
//      console.log(`new contract-document:`,err);
      throw err;
      /*
      if (!doc101_id) {
        doc101_id = await api.content_item__get({
          parent_id: contract_id,
          name: '101-gen-infos'
        });
      }
      */

    })
  }


  for (const name of docs) {
    await register_a_document({
      contract_id,
      name,
      package_id
    })
  }

  await register_a_document({
    contract_id,
    name: `9112-A-BAD-DOCUMENT`,
    package_id,
    item_subtype: 'admin_rel'
  }).catch(err =>{
    console.log('expected error@180:',err)
  })

  await register_a_document({
    contract_id,
    name: `9113-A-BAD-DOCUMENT`,
    package_id,
    item_subtype: 'acs-message'
  }).catch(err =>{
    console.log('expected error@189',err.detail)
  })


  if (true) {
    console.log(`# removing 101-test-data.`)
    const folder = await api.content_folder__get({folder_id:districts_folder})
    if (folder.name == 'fake-districts') {
      await api.content_folder__delete({folder_id:districts_folder, cascade:true});
      console.log(`content_folder <${folder.name}> DELETED.`)
      return;
    } else {
      console.log(`districts-folder: ${folder.name}`)
    }

    const d_folder = await api.content_folder__get({folder_id:district_id})
    if (d_folder.name == 'fake-district') {
      await api.content_folder__delete({folder_id:district_id, cascade:true});
      console.log(`content_folder district <${d_folder.name}> DELETED.`)
      return;
    } else {
      console.log(`district-folder: ${d_folder.name}`)
    }

    const cfolder = await api.content_folder__get({folder_id:contract_id})
    if (cfolder.name == 'contract-101') {
      await api.content_folder__delete({folder_id:contract_id, cascade:true});
      console.log(`content_folder contract <${cfolder.name}> DELETED.`)
      return;
    } else {
      console.log(`contract-folder: ${cfolder.name}`)
    }



  }


//  true &&
//  await api.content_folder__delete({folder_id, cascade:true});


return;




  let folder_id = await api.content_folder__new({
    parent_id: app_folder,
    name,
    label: 'label for a-test',
    // not used content_type: 'tapp-organization',
    object_type: 'tapp.contract',
    package_id
  })
  .catch(async err =>{
//    verbose && show_pg_error(err)
    if (err.code != 23505) throw err;
    console.log(`[test@34] folder already exists -- `, err.detail)
    const folder = await api.content_folder__get({parent_id:app_folder, name});
    if (!folder) throw 'fatal@30.'
    return folder.folder_id;
  });

  _assert(folder_id, app_instance, 'fatal@38')
  console.log({folder_id})

  let folder2_id = await api.content_item__new({
    parent_id: folder_id,
    name: 'contracts',
    title: 'label contracts',
    // not used content_type: 'tapp-organization',
    //object_type: 'tapp.contract',
    item_subtype: 'acs_object',
    package_id
  })
  .catch(async err =>{
//    verbose && show_pg_error(err)
    if (err.code != 23505) throw err;
    console.log(`[test@34] folder already exists -- `, err.detail)
    const folder = await api.content_item__get({parent_id:folder_id, name:'contracts'});
    if (!folder) throw 'fatal@30.'
    return folder.folder_id;
  });

  console.log(`test@94:`,{folder2_id})


  let contract1_id = await api.content_item__new({
    parent_id: folder2_id,
    name: '101-contract-gen-infos',
//    locale,
//    creation_date = new Date(),
//    creation_user,
    context_id: folder2_id,
//    creation_ip: '127.0.0.1',
    item_subtype: 'acs_object',
//    content_type, XXXXXXX client-file ?????????????????????
    title: '101-gen-infos',
    description: "bio for the client / protected",
    mime_type: 'text/plain',
    nls_language: 'us_EN',
    text: "never used",
    data: {id:12344}, // ATTENTION JSONB here
//    relation_tag,
//    is_live boolean = true,
//    storage_type = 'TEXT',
    package_id,
//    with_child_rels = true,
    verbose
  })

  console.log(`test@121:`,{contract1_id})




}
