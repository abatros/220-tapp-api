const YAML = require('json-to-pretty-yaml');

const {api, _assert} = require('219-openacs-api');

/*

    LIST PROGRAMS
    from app_instance or query on database ?

*/

module.exports = async (o)=>{
  const {app_instance, verbose} = o;

  const contracts = await db.query(`
    select
      c.*
    from contracts c
    `, {}, {single:false})

  /*
  contracts.forEach((contract,j) =>{
    if (verbose) {
      console.log({contract})
    } else {
      const {contract_id, first_names, last_name, student_id, school_name, data} = contract;
      console.log(`--${j+1}:${contracts.length} [cid]:${contract_id} [sid]:${student_id} "${first_names} ${last_name}" (${data && data.city})`,data)
    }
  }) */



  const c2 = contracts.map(contract =>{
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

    return YAML.stringify([data])
    .replace(/\n\s\s/g,'\n')
    .replace(/"/g,'')
    .replace(/: null/g,': 0')
    .replace(/- : Submit/g,'- assessment: undefined');
  });


  //console.log(data)
//  const yamlp = YAML.stringify(c2)
  console.log(c2.join('\n'))

};
