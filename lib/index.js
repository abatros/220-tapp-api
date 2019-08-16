module.exports.state = {
  user:null,
  organization:null,
  program:null,
  client:null
};

module.exports.xnor1 = (s)=>{
  return s.toLowerCase().replace(/\s+/g,'-'); // should remove accents too.
}


module.exports.drop_tapp_instance = require('./drop-tapp-instance.js')
module.exports.drop_a_district = require('./drop-a-district.js')
module.exports.drop_districts_all = require('./drop-districts-all.js')
module.exports.drop_a_school = require('./drop-a-school.js')
module.exports.drop_an_agency = require('./drop-an-agency.js')
module.exports.drop_a_folder = require('./drop-a-folder.js')
module.exports.drop_a_student = require('./drop-a-student.js')

module.exports.get_folder = require('./get-folder.js')
module.exports.get_organization = require('./get-organization.js')
module.exports.get_tapp_instance = require('./get-tapp-instance.js')

module.exports.list_agencies = require('./list-agencies.js')
module.exports.list_contracts = require('./list-contracts.js')
module.exports.list_districts = require('./list-districts.js')
module.exports.list_schools = require('./list-schools.js')
module.exports.list_folders = require('./list-folders.js')
module.exports.list_organizations = require('./list-organizations.js')
module.exports.list_programs = require('./list-programs.js')
module.exports.list_users = require('./list-users.js')
module.exports.list_students = require('./list-students.js')
module.exports.list_tutors = require('./list-tutors.js')

module.exports.purge_programs = require('./purge-programs.js')
module.exports.purge_folders = require('./purge-folders.js')
module.exports.purge_groups = require('./purge-groups.js')
module.exports.purge_organizations = require('./purge-organizations.js')

module.exports.register_a_district = require('./register-a-district.js')
module.exports.register_a_school = require('./register-a-school.js')
module.exports.register_an_agency = require('./register-an-agency.js')
module.exports.register_a_tutor = require('./register-a-tutor.js')
module.exports.register_a_student = require('./register-a-student.js')
module.exports.register_a_contract = require('./register-a-contract.js')


module.exports.user = require('./user.js')
module.exports.organization = require('./organization.js')
//module.exports.create_instance = require('./create-instance.js')
module.exports.repair_instance = require('./repair-instance.js')
module.exports.reset_instance = require('./reset-instance.js')

module.exports.program = require('./program.js')
module.exports.dump_wecan_2016 = require('./dump-wecan-2016.js')
module.exports.open_connection = require('./open-connection.js')
module.exports.open_tapp_instance = require('./open-tapp-instance.js')

module.exports.xray_instance = require('./xray-instance.js')
module.exports.xray_folder = require('./xray-folder.js')
module.exports.xray_item = require('./xray-item.js')
module.exports.test = require('./test.js')
