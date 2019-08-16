const {_assert, xnor1} = require('./utils.js')

module.exports = xray_item;

function xray_item(o) {
  if (Number.isInteger(o)) {
    return xray(o)
  } else {
    const {item_id} = o;
    _assert(item_id, o, 'fatal@10');
    return xray(item_id)
  }


  function xray(item_id) {
    return db.query(`
      select *
      from cr_items
      join acs_objects on (object_id = item_id)
      where (item_id = $(item_id));
    `,{item_id},{single:true})
    .then(item =>{
      console.log(`xray-item:\n`,{item})
      return item
    })
  }
}
