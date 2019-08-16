const YAML = require('json-to-pretty-yaml');

const {api, _assert} = require('219-openacs-api');

/*

    LIST PROGRAMS
    from app_instance or query on database ?

*/



module.exports = async (o)=>{
  const {app_instance, verbose} = o;

  const _districts = {};
  await db.query(`
    select * from districts;
  `,{},{single:false})
  .then(districts =>{
    districts.forEach(district =>{
      _district[district_id] = district;
      output_district_data({
        district_name, district_id,
        fax, city, phone, sa
      });
    })
  })


  const school = await db.query(`
    select schools.*
      d.data as ddata,
      d.group_name as dgroup_name,
      d.zipcode as dzipcode,

    from schools
    join districts d on (organization_id = district_id)
    `, {}, {single:false})

  schools.forEach((school,j) =>{
    const {school_id, school_name, zipcode, email, url, title, data, district_name, district_id} = school;
    let {data} = school;
    data = data||{};
    const {fax, city, phone, street_address:sa} = data; // school

    if (!districts.has(district_id)) {
      let {ddata} = school; // district
      ddata = ddata ||{};
      const {fax, city, phone, street_address:sa} = ddata; // district
      districts.add(district_id);
    }

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
