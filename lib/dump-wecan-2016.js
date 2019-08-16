const fs = require('fs')
//const YAML = require('json-to-pretty-yaml');
//const moment = require('moment');

const {_assert} = require('./utils.js');

/*

    DUMP WECAN

*/



module.exports = async (o)=>{
  const {app_instance, verbose} = o;
  const _districts = {};
  const _schools = {};
  const _agencies = {};
  const _tutors = {};
  const _students = {};
  const _users = {};
  const _contracts = {};
//  const _district_contracts = {};

  await db.query(`
    select * from districts;
  `,{},{single:false})
  .then(districts =>{
    districts.forEach(district =>{
      const {district_id, district_name} = district;
      let {data} = district; data = data||{};
      const {fax,city,phone,sa} = data;

      Object.assign(data, {
        district_id, district_name,
        otype: 'district'
      })

      _districts[district_id] = data;
      console.log(`district:`,data);
    })
  })

  // ---------------------------------------------------------------------------

  await db.query(`
    select * from schools;
  `,{},{single:false})
  .then(schools =>{
    for (school of schools) {
      const {school_id, school_name, zipcode, email, url, title, district_id} = school;
      let {data} = school;
      data = data||{};
      const {fax, city, phone, street_address:sa} = data; // school

      if (!_districts[district_id]) {
        console.log(`district-not-found:`,{school});
        continue;
      }

      Object.assign(data, {
        school_id, school_name, zipcode, email, url, title,
        district_id, district_name: _districts[district_id].district_name,
        otype: 'school'
      })
      _schools[school_id] = data;
      console.log(`school:`,data);
    }
  });

  // ---------------------------------------------------------------------------

  await db.query(`
    select * from agencies;
  `,{},{single:false})
  .then(agencies =>{
    for (agency of agencies) {
      const {agency_id, agency_name, email, url, title} = agency;
      let {data} = agency;
      data = data||{};
      const {fax, city, phone, street_address:sa} = data; // agency

      Object.assign(data, {
        agency_id, agency_name, email, url, title,
        otype: 'school'
      })
      _agencies[agency_id] = data;
      console.log(`agency:`,data);
    }
  });

  // ---------------------------------------------------------------------------

  const users = await db.query(`
    select *
    from user_long
    `, {}, {single:false})
  .then(users =>{
    users.forEach((user,j) =>{
      const {user_id, username, screen_name, password, first_names, last_name, email,
        city, zipcode, context_id, object_type} = user;
      /*
          DO NOT USE THE DATA, it's specific to student or tutor
      */
      let {data} = user;
      data = data||{};
      const x = Object.assign(data, {
        user_id, username, screen_name, password, first_names, last_name, email,
        context_id, object_type,
        otype: 'user'
      })
      _users[user_id] = data;
//      console.log(`user:`,data); //
    });
  });

  // STUDENTS AND TUTORS ARE USERS.

  // ---------------------------------------------------------------------------

  await db.query(`
    select *
    from tutors
    `, {}, {single:false})
  .then(tutors =>{
    tutors.forEach((tutor,j) =>{
      const {tutor_id, username, screen_name, first_names, last_name, email} = tutor;
      let {data} = tutor;
      data = data||{};
      Object.assign(data, {
        tutor_id, username, screen_name, first_names, last_name, email,
        otype: 'tutor'
      })
      _tutors[tutor_id] = data;
      console.log(`tutor:`,data);
    });
  })


  // ---------------------------------------------------------------------------

  await db.query(`
    select *
    from students
    `, {}, {single:false})
  .then(students =>{
    students.forEach((student,j) =>{
      const {first_names, last_name, student_id, ssid, zipcode, school_id} = student;
      let {data} = student;
      data = data||{};
      Object.assign(data, {
        first_names, last_name, student_id, ssid, zipcode, school_id,
        otype: 'student'
      })
      _students[student_id] = data;
      console.log(`student:`,data);
    });
  })


  // ---------------------------------------------------------------------------

  await db.query(`
    select
      c.*
    from contracts c
    `, {}, {single:false})
  .then(contracts =>{
    contracts.forEach(contract =>{
      const {contract_id, district_id, agency_id, student_id, program_code,
        start_date, end_date, tags,
        initial_credit, actual_credit, actual_credit_checked,
        state
        } = contract;

      let {data} = contract; // from acs_object
      data = data||{};
    //    data = data ||{};
      _assert(data, contract, "Missing data@22")
      Object.assign(data, {
        contract_id, district_id, agency_id, student_id, program_code,
        start_date,
        end_date, tags,
        initial_credit, actual_credit,
        actual_credit_checked,
        state,
        otype: 'contract'
      })
      data.start_date = new Date(start_date).toISOString().substring(0,10);
      data.end_date = new Date(end_date).toISOString().substring(0,10);
      data.actual_credit_checked = new Date(actual_credit_checked).toISOString().substring(0,10);
      _contracts[contract_id] = data;
      console.log(`contract:`,data);
    }) // each contract
  }) // then


  // ---------------------------------------------------------------------------

  await db.query(`select * from daily_attendances`,{},{single:false})
  .then(attendances =>{
    for (att of attendances) {
      const {contract_id, attendance_date, duration, comments, tags} = att;
//      attendance_date = new Date(attendance_date).toISOString().substring(0,10);

      _contracts[contract_id].attendance = _contracts[contract_id].attendance || [];
      _contracts[contract_id].attendance.push({
        date: new Date(attendance_date).toISOString().substring(0,10),
        duration, comments, tags
      })
    }
  })


  // ---------------------------------------------------------------------------

  await db.query(`
    select * from acs_rels
    `, {}, {single:false})
  .then(acs_rels =>{
    for (rel of acs_rels) {
      const {rel_id, rel_type, object_id_one, object_id_two} = rel;
      switch (rel_type) {
        case 'agency-director':
        if (!_agencies[object_id_one]) {
          console.log(`# ALERT agency1-not-found:`,{rel});
          continue;
        }
        if (!_users[object_id_two]) {
          console.log(`# ALERT user2-not-found:`,{rel});
          continue;
        }
        _agencies[object_id_one].admin = _agencies[object_id_one].admin || new Set();
        _agencies[object_id_one].admin.add(object_id_two);
        break;

        case 'agency-staff':
        if (!_agencies[object_id_one]) {
          console.log(`# ALERT agency-not-found:`,{rel});
          continue;
        }
        if (!_users[object_id_two]) {
          console.log(`# ALERT user2-not-found:`,{rel});
          continue;
        }
        _agencies[object_id_one].staff = _agencies[object_id_one].staff || new Set();
        _agencies[object_id_one].staff.add(object_id_two);
        break;

        case 'tutor-contract':
        if (!_users[object_id_one]) {
          console.log(`# ALERT user-not-found:`,{rel});
          continue;
        }/*
        if (!_contracts[object_id_two]) {
          console.log(`# ALERT contract2-not-found:`,{rel});
          continue;
        }*/
        break;

        case 'tutor-student':
        if (!_users[object_id_one]) {
          console.log(`# ALERT tutor-not-found:`,{rel});
          continue;
        }
        if (!_students[object_id_two]) {
          console.log(`# ALERT2 student-not-found:`,{rel});
          continue;
        }

        _tutors[object_id_one].students = _tutors[object_id_one].students || new Set();
        _tutors[object_id_one].students.add(object_id_two)

        break;

        case 'admin-rel':
        if (!_users[object_id_two]) {
          console.log(`# ALERT user-not-found:`,{rel});
          continue;
        }
        break;

        case 'district-contract':
        if (!_districts[object_id_one]) {
          console.log(`# ALERT district-not-found:`,{rel});
          console.log(`two:`,_districts[object_id_one])
//          throw `fatal@240`
          continue;
        }
        if (!_students[object_id_two]) {
          console.log(`# ALERT student2-not-found:`,{rel});
          continue;
        } else {
          const {student_id, username, email} = _students[object_id_two];
          _districts[object_id_one].students = _districts[object_id_one].students || [];
          _districts[object_id_one].students.push({
            student_id, username, email
          })
        }
        break;

        default:
          throw `UNKNOW rel_type <${rel_type}>`


      } // switch

    } // each admin
  });

  const full = [];
  full.push(...Object.values(_districts))
  full.push(...Object.values(_schools))
  full.push(...Object.values(_agencies))
  full.push(...Object.values(_users))
  full.push(...Object.values(_tutors))
  full.push(...Object.values(_students))
  full.push(...Object.values(_contracts))

  fs.writeFileSync('dump-wecan-2016.yaml',YAML.stringify(full)
  .replace(/\n\s\s/g,'\n')
  .replace(/"/g,'')
  .replace(/: null/g,': 0')
  .replace(/- : Submit/g,'- assessment: undefined')
  .replace(/- : /g,'- district_u: undefined')
  .replace(/\*/g,'')
  );


  console.log(`************************\n`,Object.values(_districts))

/*
  console.log(YAML.stringify(Object.values(_districts)))
  console.log(YAML.stringify(Object.values(_schools)))
  console.log(YAML.stringify(Object.values(_agencies)))
  console.log(YAML.stringify(Object.values(_users)))
  console.log(YAML.stringify(Object.values(_tutors)))
  console.log(YAML.stringify(Object.values(_students)))
  console.log(YAML.stringify(Object.values(_contracts)))
*/





} // end
