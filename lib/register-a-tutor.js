const {_assert, xnor1} = require('./utils.js')

module.exports = register_a_tutor;

/*
    This is an unfrequent operation.
    It can be slow.
*/

const h1 = `\t[register-a-tutor]`


async function register_a_tutor(o) {
  const {first_names, last_name, email, id, tutor_id, password, salt, xtu} = o;
  let {username, screen_name, user_id =tutor_id} = o;
  const {agency:agency_name, app_instance} = o;
  let {agency_id} = o;

  _assert(first_names, o, "Missing tutor first_names.")
  _assert(last_name, o, "Missing tutor last_name.")
  _assert(app_instance, o, "Missing app_instance.")
  const {package_id, app_folder,
    tutors_folder, agencies_folder, app_group
    } = app_instance;
  _assert(package_id, o, "Missing package_id")
  _assert(app_folder, o, "Missing app_folder")
  _assert(app_group, o, "Missing app_group")
  _assert(Number.isInteger(app_group), o, "fatal@29 Invalid app_group")
  _assert(tutors_folder, o, "Missing tutors_folder")

  /*

    FIRST lookup on users and register if needed.
    TUTORS MUST HAVE USERNAME MUST BE REGISTERED
    NOT WHEN IMPORTING DATA..... ????
  */

  xtu &&
  console.log(`${h1}@38 `,{
    username, email, screen_name, first_names, last_name, user_id
  });

  username = username || email
  || screen_name
  || ((user_id)?xnor1(`${first_names}-${last_name}-${user_id}`):null);

  xtu &&
  console.log(`${h1}@48 `,{
      username, email, screen_name, first_names, last_name, user_id
  });


  const _users = app_instance._users;
  let user = _users && _users[username];

  if (user) {
    xtu && console.log(`${h1}@47 found user/tutor in cache: (${username})=>${user_id}`)
  } else {
    xtu && console.log(`${h1}@49 tutor username:(${username}) not found - register!`)
  }

  _assert(username, o, 'fatal@49');


  xtu && console.log(`${h1}@64 checking tutor in users_all...`)

  user = await db.query(`
    select * from acs_users_all
    where (username = $(username))
    or (email = $(email))
    or (screen_name = $(screen_name))
  `,{username, email, screen_name}, {single:true})

  /*
  if (!user && email) {
    user = await db.query(`
      select * from acs_users_all
      where (email = $(email))
    `,{email},{single:true})
    if (user) {
      username = user.username
    }
  }
  */

  if (user) {
   xtu &&
   console.log(`${h1}@107 tutor found in users_all`)
  }

  if (!user) {
    const _user_data = {
      username,
      email,
//      url,
      first_names,
      last_name,
      password,
      salt,
      screen_name
    }
    const user_id = await api.acs__add_user(_user_data)
    .catch(err =>{
      if (err.code != 23505) throw err;
      xtu && console.log(`${h1}@90 alert USER ALREADY EXISTS get the username:`,{_user_data})
      throw err;
    })

    user = Object.assign(_user_data,{user_id});
  }
  _assert(user, o, `Unable to locate tutor/user`);

  /************************************************
  ensure tutor is member of app_group.
  *************************************************/

  _assert(user.user_id, user, "fatal@116 missing user_id")

  await api.membership_rel__new({
    rel_type: 'tapp.registered-tutor',
    object_id_one: app_group,
    object_id_two: user.user_id
  })
  .then(rel_id =>{
    xtu && console.log(`${h1}@124 new membership tap.tutor registered`)
  })
  .catch(err =>{
    if (err.code != 23505) throw err;
    xtu && console.log(`${h1}@124 membership tap.tutor was already registered :`, err.detail)
  })

  /*
    NEXT lookup on tutors-folder
  */

  if (!agency_id && agency_name) {
    agency_id = await db.query(`
      select *
      from cr_folders, cr_items
      where (item_id = folder_id)
      and (parent_id = $(parent_id))
      and (name = $(name));
    `,{name:agency_name, parent_id:agencies_folder},{single:true})
    .then(retv =>{
      return retv && retv.folder_id;
    })
  }

  /*
    lookup for an existsing tutor-folder.
    The folder.name MUST BE the USER_ID
    because it will not change.
  */


  _assert(user, o, `Unable to get a user`);

  /*****************************************************

  file name is username

  ******************************************************/
  const {username:tutor_name} = user;
  _assert(tutor_name, user, tutor_name);

  const _tutors = app_instance._tutors;
  let tutor = _tutors && _tutors[tutor_name];

  if (!tutor) {
    xtu && console.log(`${h1}@137 tutor-file (${tutor_name}) not in cache`)
    tutor = await api.content_item__get({
      parent_id:tutors_folder,
      name: tutor_name,
    })
  }

  if (!tutor) {
    console.log(`${h1}@145 tutor-file (${tutor_name}) not found in database => create-file`)
    const item_id = await api.content_item__new({
      parent_id: tutors_folder,
      name: tutor_name,
      label: tutor_name,
      package_id,
      context_id: tutors_folder,
      item_subtype: 'tapp.tutor'
    })
    .catch(err =>{
      if (err.code != 23505) throw err;
      xtu && console.log(`${h1}@156 ALERT tutor@42 : `, err.detail)
    })
  }


}
