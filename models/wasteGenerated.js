const db = require("../utils/database");
const config = require("../config");
const baseurl = config.base_url;

module.exports = {
  fetchWasteEmission: async (column, id, waste_type, country_id, year) => {   
    console.log(column, id, waste_type, country_id, year); 
    return db.query(`select ${column} AS ef, Fiscal_Year from endoflife_waste_type_subcategory where  waste_type = ? and type = ? and country_id = ? AND RIGHT(Fiscal_Year, 4) = ?`, [id, waste_type, country_id , year]);
  },

  insertWasteGeneratedEmission: async (data) => {
    console.log(data);
    
    return db.query(
      "INSERT INTO   `waste_generated_emissions` (user_id, waste_type_id, waste_type, method, total_waste, unit, emission, emission_factor_used, emission_factor_unit, status, month,year, facility_id,waste_loop,product) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        data.user_id,
        data.waste_type_id,
        data.waste_type,
        data.method,
        data.total_waste,
        data.unit,
        data.emission,
        data.emission_factor_useed,
        data.emission_factor_unit,
        "P",
        data.month,
        data.year,
        data.facility_id,
        data.waste_loop,
        data.product
      ]
    );
  },

  getDataProgressStationaryCombustion: async (year, facilities) => {

    return db.query("SELECT count(*) as count, month  FROM `stationarycombustionde` WHERE year = ? and month in ('Jan','Feb','Mar','Apr', 'May','Jun','Jul','Aug','Sep','Oct','Nov', 'Dec') and facility_id = ? \
                     group by month", [year, facilities]);

  },

  getDataProgressPurchaseGoods: async (year, facilities) => {

    return db.query("SELECT count(*) as count, month  FROM `purchase_goods_categories` WHERE year = ? and month in ('Jan','Feb','Mar','Apr', 'May','Jun','Jul','Aug','Sep','Oct','Nov', 'Dec') and facilities = ?  \
                     group by month", [year, facilities]);

  },


  getDataProgressDownStreamVehicle: async (year, facilities) => {

    return db.query("SELECT count(*) as count, month  FROM `downstream_vehicle_storage_emissions` WHERE year = ? and month in ('Jan','Feb','Mar','Apr', 'May','Jun','Jul','Aug','Sep','Oct','Nov', 'Dec') and facility_id=? \
                     group by month", [year, facilities]);

  },

  getDataProgressUpStreamVehicle: async (year, facilities) => {

    return db.query("SELECT count(*) as count, month  FROM `upstream_vehicle_storage_emissions` WHERE year = ? and month in ('Jan','Feb','Mar','Apr', 'May','Jun','Jul','Aug','Sep','Oct','Nov', 'Dec')  and facility_id=? \
                     group by month", [year, facilities]);

  },

  getDataProgressFranchiseEmission: async (year, facilities) => {

    return db.query("SELECT count(*) as count, month  FROM `franchise_categories_emission` WHERE year = ? and month in ('Jan','Feb','Mar','Apr', 'May','Jun','Jul','Aug','Sep','Oct','Nov', 'Dec')  and facility_id=? \
                     group by month", [year, facilities]);

  },


  getDataProgressInvestmentEmission: async (year, facilities) => {

    return db.query("SELECT count(*) as count, month  FROM `investment_emissions` WHERE year = ? and month in ('Jan','Feb','Mar','Apr', 'May','Jun','Jul','Aug','Sep','Oct','Nov', 'Dec')  and facilities=?  \
                     group by month", [year, facilities]);

  },


  getDataProgressUpstreamLeaseEmission: async (year, facilities) => {

    return db.query("SELECT count(*) as count, month  FROM `upstreamLease_emission` WHERE year = ? and month in ('Jan','Feb','Mar','Apr', 'May','Jun','Jul','Aug','Sep','Oct','Nov', 'Dec')  and facility_id=? \
                     group by month", [year, facilities]);

  },

  getDataProgressDownstreamLeaseEmission: async (year, facilities) => {

    return db.query("SELECT count(*) as count, month  FROM `downstreamLease_emission` WHERE year = ? and month in ('Jan','Feb','Mar','Apr', 'May','Jun','Jul','Aug','Sep','Oct','Nov', 'Dec')  and facility_id=? \
                     group by month", [year, facilities]);

  },

  getDataProgressWasteGenerated: async (year, facilities) => {

    return db.query("SELECT count(*) as count, month  FROM `waste_generated_emissions` WHERE year = ? and month in ('Jan','Feb','Mar','Apr', 'May','Jun','Jul','Aug','Sep','Oct','Nov', 'Dec')  and facility_id=? \
                     group by month", [year, facilities]);

  },


  getDataProgressFlightTravel: async (year, facilities) => {

    return db.query("SELECT count(*) as count, month  FROM `flight_travel` WHERE year = ? and month in ('Jan','Feb','Mar','Apr', 'May','Jun','Jul','Aug','Sep','Oct','Nov', 'Dec')  and facilities=? \
                     group by month", [year, facilities]);

  },


  getDataProgressOtherTransport: async (year, facilities) => {

    return db.query("SELECT count(*) as count, month  FROM `other_modes_of_transport` WHERE year = ? and month in ('Jan','Feb','Mar','Apr', 'May','Jun','Jul','Aug','Sep','Oct','Nov', 'Dec')   and facilities=?\
                     group by month", [year, facilities]);

  },

  getDataProgressHotelStay: async (year, facilities) => {

    return db.query("SELECT count(*) as count, month  FROM `hotel_stay` WHERE year = ? and month in ('Jan','Feb','Mar','Apr', 'May','Jun','Jul','Aug','Sep','Oct','Nov', 'Dec')   and facilities=?\
                     group by month", [year, facilities]);

  },


  getDataProgressEmployeeCommuting: async (year, facilities) => {

    return db.query("SELECT count(*) as count, month  FROM `employee_commuting_category` WHERE year = ? and month in ('Jan','Feb','Mar','Apr', 'May','Jun','Jul','Aug','Sep','Oct','Nov', 'Dec')  and facilities=? \
                     group by month", [year, facilities]);

  },


  getDataProgressHomeOffice: async (year, facilities) => {

    return db.query("SELECT count(*) as count, month  FROM `homeoffice_category` WHERE year = ? and month in ('Jan','Feb','Mar','Apr', 'May','Jun','Jul','Aug','Sep','Oct','Nov', 'Dec')  and facilities=? \
                     group by month", [year, facilities]);

  },


  getDataProgressSoldProduct: async (year, facilities) => {

    return db.query("SELECT count(*) as count, month  FROM `sold_product_category` WHERE year = ? and month in ('Jan','Feb','Mar','Apr', 'May','Jun','Jul','Aug','Sep','Oct','Nov', 'Dec')  and facilities=? \
                     group by month", [year, facilities]);

  },


  getDataProgressEndOfLifeTreatment: async (year, facilities) => {

    return db.query("SELECT count(*) as count, month  FROM `endof_lifetreatment_category` WHERE year = ? and month in ('Jan','Feb','Mar','Apr', 'May','Jun','Jul','Aug','Sep','Oct','Nov', 'Dec')  and facilities=? \
                     group by month", [year, facilities]);

  },


  getDataProgressProOfSoldGoods: async (year, facilities) => {

    return db.query("SELECT count(*) as count, month  FROM `processing_of_sold_products_category` WHERE year = ? and month in ('Jan','Feb','Mar','Apr', 'May','Jun','Jul','Aug','Sep','Oct','Nov', 'Dec')  and facilities=? \
                     group by month", [year, facilities]);

  },


  getDataProgressRefrigerant: async (year, facilities) => {

    return db.query("SELECT count(*) as count, months  FROM `dbo.refrigerantde` WHERE year = ? and months in ('Jan','Feb','Mar','Apr', 'May','Jun','Jul','Aug','Sep','Oct','Nov', 'Dec') and facilities=?  \
                     group by months", [year, facilities]);

  },



  getDataProgressFireExtinguisher: async (year, facilities) => {

    return db.query("SELECT count(*) as count, months  FROM `dbo.fireextinguisherde` WHERE year = ? and months in ('Jan','Feb','Mar','Apr', 'May','Jun','Jul','Aug','Sep','Oct','Nov', 'Dec')  and facilities=? \
                     group by months", [year, facilities]);

  },


  getDataProgressElecricity: async (year, facilities) => {

    return db.query("SELECT count(*) as count, months  FROM `dbo.renewableelectricityde` WHERE year = ? and months in ('Jan','Feb','Mar','Apr', 'May','Jun','Jul','Aug','Sep','Oct','Nov', 'Dec')  and facilities=? \
                     group by months", [year, facilities]);

  },


  getDataProgressHeatandSteam: async (year, facilities) => {
    return db.query("SELECT count(*) as count, months  FROM `dbo.heatandsteamde` WHERE year = ? and months in ('Jan','Feb','Mar','Apr', 'May','Jun','Jul','Aug','Sep','Oct','Nov', 'Dec')  and facilities=? \
                     group by months", [year, facilities]);

  },

  getDataProgressWaterDischarge: async (year, facilities) => {
    return db.query("SELECT COUNT(DISTINCT water_discharge_by_destination.water_supply_treatment_id) AS count, water_discharge_by_destination.month FROM `water_discharge_by_destination` LEFT JOIN water_supply_treatment_category ON water_supply_treatment_category.id = water_discharge_by_destination.water_supply_treatment_id WHERE water_discharge_by_destination.year = ? and water_discharge_by_destination.month in ('Jan','Feb','Mar','Apr', 'May','Jun','Jul','Aug','Sep','Oct','Nov', 'Dec') AND water_supply_treatment_category.facilities = ? \
                     group by water_discharge_by_destination.month", [year, facilities]);
  },

  getDataProgressWaterWithdrawal: async (year, facilities) => {

    return db.query("SELECT COUNT(DISTINCT water_withdrawl_by_source.water_supply_treatment_id) AS count, water_withdrawl_by_source.month FROM `water_withdrawl_by_source` LEFT JOIN water_supply_treatment_category ON water_supply_treatment_category.id = water_withdrawl_by_source.water_supply_treatment_id WHERE water_withdrawl_by_source.year = ? and water_withdrawl_by_source.month IN ('Jan','Feb','Mar','Apr', 'May','Jun','Jul','Aug','Sep','Oct','Nov', 'Dec') AND water_supply_treatment_category.facilities = ? \
                     group by water_withdrawl_by_source.month", [year, facilities]);

  },

  getDataProgressCompanyOwnedVehicles: async (year, facilities) => {
    return db.query("SELECT count(*) as count, months FROM `dbo.vehiclede` WHERE year = ? and months in ('Jan','Feb','Mar','Apr', 'May','Jun','Jul','Aug','Sep','Oct','Nov', 'Dec')  and facilities=? \
                     group by months", [year, facilities]);

  },
};
