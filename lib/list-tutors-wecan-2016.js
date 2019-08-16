const YAML = require('json-to-pretty-yaml');

const {api, _assert} = require('219-openacs-api');

/*

    LIST PROGRAMS
    from app_instance or query on database ?

*/

module.exports = async (o)=>{
  const {app_instance, verbose} = o;

  const tutors = await db.query(`
    select *
    from tutors
    `, {}, {single:false})

  tutors.forEach((tutor,j) =>{
    const {tutor_id, username, screen_name, first_names, last_name, email} = tutor;
    let {data} = tutor;
    data = data||{};
//    data = data ||{};
    _assert(data, tutor, "Missing data@22")
    Object.assign(data, {
      tutor_id, username, screen_name, first_names, last_name, email,
      otype: 'tutor'
    })
    const yamlp = YAML.stringify([data])
/*
    const {tutor_id, username, screen_name, first_names, last_name, email, data} = tutor;
    const {city, zip, home_phone, cell_phone} = (data||{});
    console.log(`
- otype: tutor
  username: ${username}
  id: ${tutor_id},
  screen_name: ${screen_name || username}
  first_name: ${first_names}
  last_name: ${last_name}`);
    email && console.log(`  email: ${email}`);
    zip && console.log(`  zip: ${zip}`);
    city && console.log(`  city: ${city}`);
    data && console.log(data)
  }) // each tutor.
*/
    console.log(yamlp)
  });
}
