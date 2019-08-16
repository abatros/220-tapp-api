const {_assert, xnor1} = require('./utils.js')

module.exports = xray_folder;

function xray_folder(o) {
  if (Number.isInteger(o)) {
    return xray(o)
  } else {
    const {folder_id} = o;
    _assert(folder_id, o, 'fatal@10');
    return xray(folder_id)
  }


  function xray(folder_id) {
    return db.query(`
      select *
      from cr_folders
      join cr_items on (item_id = folder_id)
      join acs_objects on (object_id = folder_id)
      where (folder_id = $(folder_id));
    `,{folder_id},{single:true})
    .then(folder =>{
      console.log(`xray-folder:\n`,{folder})
      return folder
    })
  }
}
