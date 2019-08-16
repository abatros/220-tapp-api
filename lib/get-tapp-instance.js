const {_assert} = require('./utils.js')

module.exports = get_tapp_instance;

async function get_tapp_instance(o) {
  const {name} = o;
  const {instance_name = name} = o;

  const app_instance = await db.query(`
    select f.*, i.*, p.*
    from cr_folders f, cr_items i, apm_packages p
    where (folder_id = item_id)
    and (p.package_id = f.package_id)
    and (p.package_key = 'tapp')
    and (parent_id = -100) and (instance_name = $(instance_name));
    `,{instance_name},{single:true})
  .then(app => {
    //console.log({app})
    app.app_folder = app.folder_id;
    return app;
  })

  return app_instance;
}
