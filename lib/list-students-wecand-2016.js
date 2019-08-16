const {api, _assert, xnor1} = require('219-openacs-api');

/*

    LIST PROGRAMS
    from app_instance or query on database ?

*/

module.exports = async (o)=>{
  const {app_instance, verbose} = o;

  const contracts = await db.query(`
    select
      c.contract_id, c.agency_id, c.student_id,
      s.*
    from contracts_table c
    join students s on (s.student_id = c.student_id)
  `, {}, {single:false})

  const students = {};

  contracts.forEach((contract,j) =>{
    const {first_names, last_name, student_id, school_name, data} = contract;
    students[student_id] = {
      first_names, last_name, student_id
    }
  })

  // console.log(`students:`,{students})

  Object.values(students).forEach(student =>{
    const {first_names, last_name, student_id} = student;
    console.log(`
- otype: student
  first_names: ${first_names}
  last_name: ${last_name}
  id: ${student_id}
  ssn: 123-66-${student_id}
      `)
  })


}
