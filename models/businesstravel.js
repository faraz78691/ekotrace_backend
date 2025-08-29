const db = require("../utils/database");
const config = require("../config");
const baseurl = config.base_url;

module.exports = {

  getOffsetByCountry: (async (country) => {
    return db.query('select * from hotel_booking where country = ?', [country]);
  }),

  getLatLongByCode: (async (ap_code) => {
    return db.query('select * from 	flight_airport_code where airport_code = ?', [ap_code]);
  }),

  getFlightParams: (async (search_str, country_id) => {
    return db.query('SELECT  * FROM flight_semantics WHERE distance = ? and country_id=? ', [search_str, country_id]);
  }),


  getemssiomFactor: (async (sub_category) => {
    return db.query('SELECT  * FROM emission_factors WHERE sub_category = ?', [sub_category]);
  }),

  Othermodes_of_transport: async (user) => {
    return db.query("insert into other_modes_of_transport  set ?", [user]);
  },

  hotelStay: async (user) => {
    return db.query("insert into hotel_stay  set ?", [user]);
  },

  flight_travel: async (user) => {
    return db.query("insert into flight_travel  set ?", [user]);
  },

  insertbusinessunitsetting: async (user) => {
    return db.query("insert into business_unit_setting  set ?", [user]);
  },

  insertemployee_commuting_category: async (data) => {
    return db.query("INSERT INTO  `employee_commuting_category` (noofemployees,workingdays,totalnoofcommutes,typeoftransport,subtype,allemployeescommute,avgcommutedistance,emission,EFs,unit,user_id,batch,facilities,year,month) VALUES ?",
      [data.map((item) => [
        item.noofemployees,
        item.workingdays,
        item.totalnoofcommutes,
        item.typeoftransport,
        item.subtype,
        item.allemployeescommute,
        item.avgcommutedistance,
        item.emission,
        item.EFs,
        item.unit,
        item.user_id,
        item.batch,
        item.facilities,
        item.year,
        item.month
      ])]);
  },

  homeoffice_emission_factors: async (type, country_id, year) => {
    const query = `
      SELECT * 
      FROM homeoffice_emission_factors 
      WHERE typeId = ? 
        AND country_id = ? 
        AND RIGHT(Fiscal_Year, 4) = ?
    `;
  
    const params = [type, country_id, year];
    return db.query(query, params);
  },
  


  homeoffice_emission_category: async (data) => {
    return db.query("INSERT INTO  `homeoffice_category` (typeofhomeoffice,noofemployees,noofdays,noofmonths,emission,emission_factor,emission_factor_unit,user_id,batch,facilities,year,month) VALUES ?",
      [data.map((item) => [
        item.typeofhomeoffice,
        item.noofemployees,
        item.noofdays,
        item.noofmonths,
        item.emission,
        item.emission_factor,
        item.emission_factor_unit,
        item.user_id,
        item.batch,
        item.facilities,
        item.year,
        item.month
      ])]);
  },


  soldproductsemission_factors: (async (productcategory, country_id) => {
    return db.query('SELECT  * FROM sold_product_category_ef WHERE id = ? and country_id = ?', [productcategory, country_id]);
  }),

  insertsoldproductsemission: async (product) => {
    return db.query("insert into sold_product_category  set ?", [product]);
  },


  insertendof_lifetreatment_category: async (product) => {
    return db.query("insert into endof_lifetreatment_category  set ?", [product]);
  },


  endof_lifeSubCatmission_factors: (async (productcategory, country_id) => {

    return db.query('SELECT  * FROM endoflife_waste_type_subcategory WHERE type = ? and country_id = ?', [productcategory, country_id]);
  }),


  endoflife_waste_type: (async (productcategory, country_id) => {

    let countrydata = '';
    if (country_id) {
      countrydata = ` and country_id = '${country_id}'`;
    }
    return db.query(`SELECT  * FROM 	endoflife_waste_type WHERE id = ?  ${countrydata}`, [productcategory]);
  }),


  water_supply_treatment_type: (async (id, country_id, year) => {
    return db.query(`SELECT  * FROM 	water_supply_treatment_type where type = '${id}' and country_id ='${country_id}' and RIGHT(Fiscal_Year, 4) = '${year}' `);
  }),


  insertwater_supply_treatment_category: async (product) => {
    return db.query("insert into water_supply_treatment_category  set ?", [product]);
  },

  insert_water_withdrawl_by_source: async (data) => {
    return db.query(`INSERT INTO  water_withdrawl_by_source (kilolitres,water_withdrawl,user_id,water_supply_treatment_id,month,year, totalwaterwithdrawl,withdrawl_emissions) VALUES ?`,
      [data.map((item) => [
        item.kilolitres,
        item.water_withdrawl,
        item.user_id,
        item.water_supply_treatment_id,
        item.month,
        item.year,
        item.totalwaterwithdrawl,
        item.withdrawl_emissions  
      ])]);
  },


  insert_water_discharge_by_destination: async (data) => {
    return db.query(`INSERT INTO   water_discharge_by_destination (water_discharge,withthtreatment,leveloftreatment,user_id,water_supply_treatment_id,month,year,totalwaterdischarge,treated_water,total_treatment_emissions) VALUES ?`,
      [data.map((item) => [
        item.water_discharge,
        item.withthtreatment,
        item.leveloftreatment,
        item.user_id,
        item.water_supply_treatment_id,
        item.month,
        item.year,
        item.totalwaterdischarge,
        item.treated_water,
        item.total_treatment_emissions
      ])]);
  },

  insert_water_discharge_by_destination_only: async (data) => {
    return db.query(`INSERT INTO   water_discharge_by_destination_only (water_discharge,kilolitres,user_id,water_supply_treatment_id,month,year,totaldischarge) VALUES ?`,
      [data.map((item) => [
        item.water_discharge,
        item.kilolitres,
        item.user_id,
        item.water_supply_treatment_id,
        item.month,
        item.year,
        item.totaldischarge
      ])]);
  },

  insertprocessing_of_sold_productsCategory: async (product) => {
    return db.query("insert into processing_of_sold_products_category  set ?", [product]);
  },
  insertprocessing_of_sold_products_ef: async (product) => {
    return db.query("insert into processing_of_sold_products_ef  set ?", [product]);
  },

  updateWater_ef: async (emission,withdrawn_emission, treatment_emission,  waterTreated, non_water_treated,totalwatertreated, id) => {
    return db.query("UPDATE water_supply_treatment_category set emission = ?,withdrawn_emission = ?, treatment_emission = ?,  water_treated = ?, water_non_treated = ?,totalwatertreated	= ? where id= ?", [emission, withdrawn_emission, treatment_emission, waterTreated, non_water_treated, totalwatertreated, id]);
  },

}