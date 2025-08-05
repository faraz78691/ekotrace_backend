const db = require("../utils/database");
module.exports = {
  insertData: async (table, where) => {
    return db.query(`insert into ${table} set ? ${where}`);
  },
  updateData: async (table, where, data) => {
    return db.query(`update ${table} SET ? ${where}`, [data]);
  },

  getData: async (table, where) => {
    return db.query(`select * from ${table} ${where}`);
  },
  deleteData: async (table, where) => {
    return db.query(`Delete from ${table} ${where}`);
  },
  getSelectedData: async (table, where, column) => {
    return db.query(`select ${column} from ${table} ${where}`);
  },
  fetchCount: async (table, where) => {
    return db.query(`select  count(*) as total from ${table} ${where}`);
  },
  getSelectedColumn: async (table, where, column) => {
    return db.query(`select ${column} from ${table} ${where}`);
  },

  country_check: (async (facilities) => {
    return db.query('select * from `dbo.facilities` where ID = "' + facilities + '"');
  }),

  country_check_all: (async (facilities) => {
    return db.query('select * from `dbo.facilities` where ID IN (' + facilities + ')');
  }),

  getAllFacilites: (async (facilities) => {
    return db.query('select * from `dbo.facilities` where ID IN (' + facilities + ')');
  }),


  countryBysubgroup: (async (sub_group_id) => {
    return db.query('select * from `dbo.group` where id = ?', [sub_group_id]);
  }),

  getGroupIdByTenant: (async (tenant_id) => {
    return db.query('select group_id from \`dbo.aspnetuserroles\` where tenant_id = ?', [tenant_id]);
  }),

};
