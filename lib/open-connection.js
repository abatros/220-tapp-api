//const {api, tapp, _assert} = require('../lib');
//const {api, _assert, pg_connect, pg_disconnect} = require('219-openacs-api');

/*

    get-app-instance (create-if-not-exists)

*/
module.exports = open_connection;

async function open_connection(conn) {
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
