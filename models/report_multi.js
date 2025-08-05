const db = require("../utils/database");
const config = require("../config");
const baseurl = config.base_url;

module.exports = {
  getPurchaseGoodsReportMulti: async ( 
    facility,
    year,
    month

  ) => {
    return db.query(`select 'Scope3' as scope, 'Purchase Goods' as data_point, typeofpurchase as category, year, month,  sum(emission) as emission, facilities as facility \
                        from  purchase_goods_categories where status  ='S'  and facilities in (${facility}) and year ='${year}' and month in (${month}) GROUP BY facility  ORDER BY created_at ASC`);
  },

  getDownStreamVehicleReportMulti: async (
    facility,
    year,
    month

  ) => {
    return db.query(`select 'Scope3' as scope, 'DownStream Vehicles' as data_point, vehicle_type as category, year, month,  sum(emission) as emission, facility_id as facility \
                    from  downstream_vehicle_storage_emissions where status  ='S'  and facility_id in (${facility}) and year ='${year}' and month in (${month}) GROUP BY facility ORDER BY created_at ASC `);
  },

  getUpStreamVehicleReportMulti: async ( 
    facility,
    year,
    month

  ) => {
    return db.query(`select 'Scope3' as scope, 'Upstream Vehicles' as data_point, vehicle_type as category, year, month, sum(emission) as emission, facilities as facility\
                    from  upstream_vehicle_storage_emissions where status  ='S'  and facility_id in (${facility})  and year ='${year}' and month in (${month}) GROUP BY facility ORDER BY created_at ASC `);
  },

  getFranchiseEmissionReportMulti: async (
    facility,
    year,
    month
  ) => {
    return db.query(`select 'Scope3' as scope, 'Franchise Emissions' as data_point, franchise_type as category, year, month, franchise_space as quantity, sum(emission) as emission, facility_id as facility\
                    from  franchise_categories_emission where status  ='S'  and facility_id in (${facility}) and year ='${year}' and month in (${month}) GROUP BY facility ORDER BY created_at ASC `);
  },

  getInvestmentEmissionReportMulti: async (
    facility,
    year,
    month
  ) => {
    return db.query(`select 'Scope3' as scope, ,'Investment Emissions' as data_point, category as category, year, month, sum(emission) as emission, facilities as facility, year, month \
                    from  investment_emissions where status  ='S'  and facilities in (${facility}) and year ='${year}' and month in (${month}) GROUP BY facility ORDER BY created_at ASC `);
  },

  getStationaryCombustionReportMulti: async (
    facility,
    year,
    month
  ) => {
    return db.query(`select 'Scope1' as scope,'Stationary Combustion' as data_point, SubCategoriesID as category_id, year, month ,sum(GHGEmission) as emission, facility_id as facility\
                    from  stationarycombustionde where status  ='S'  and facility_id in (${facility}) and year ='${year}' and month IN(${month}) GROUP BY facility ORDER BY SubmissionDate ASC `);
  },

  getCategoryBySeedIdMulti: async (id) => {
    return db.query("select item from subcategoryseeddata where id = ?", [id]);
  },

  getUpstreamLeaseEmissionReportMulti: async (
    facility,
    year,
    month

  ) => {
    return db.query(`select 'Scope3' as scope, 'UpStream Lease Emission' as data_point, category, year, month,  sum(emission) as emission, facility_id as facility\
                    from  upstreamLease_emission where status  ='S'  and facility_id in (${facility}) and year ='${year}' and month in (${month}) GROUP BY facility ORDER BY created_at ASC `);
  },

  getDownstreamLeaseEmissionReportMulti: async (
    facility,
    year,
    month

  ) => {
    return db.query(`select 'Scope3' as scope, 'Down Stream Lease Emission' as data_point, category, year, month,  sum(emission) as emission, facility_id as facility  \
                    from  downstreamLease_emission where status  ='S'  and facility_id in (${facility}) and year ='${year}' and month in (${month}) GROUP BY facility  ORDER BY created_at ASC `);
  },

  getWasteGeneratedEmissionReportMulti: async (
    facility,
    year,
    month

  ) => {
    return db.query(`select 'Scope3' as scope, 'Waste Generation Emission' as data_point,  waste_type as category, year, month, sum(emission) as emission, facility_id as facility  \
                    from  waste_generated_emissions where status  ='S'  and facility_id in (${facility}) and year ='${year}' and month in (${month}) GROUP BY facility ORDER BY created_at ASC `);
  },

  getFlightTravelReportMulti: async (
    facility,
    year,
    month
  ) => {
    return db.query(`select 'Scope3' as scope, 'Business Flights' as data_point, flight_Type as category, year, month, sum(emission) as emission, facilities as facility\
                    from  flight_travel where status  ='S'  and facilities in (${facility})and year ='${year}' and month in (${month}) GROUP BY facility ORDER BY created_at ASC `);
  },
  getOtherTransportReportMulti: async (
    facility,
    year,
    month

  ) => {
    return db.query(`select 'Scope3' as scope, 'Other Transports' as data_point, 'Other Transport' as category, year, month, emission, facilities as facility\
                    from  other_modes_of_transport where status  ='S'  and facilities in (${facility})and year ='${year}' and month in (${month}) GROUP BY facility ORDER BY created_at ASC `);
  },
  getHotelStayReportMulti: async (
    facility,
    year,
    month

  ) => {
    return db.query(`select 'Scope3' as scope, 'HotelStay' as data_point, 'HotelStay' as category, year, month, sum(emission) as emission, facilities as facility\
                    from  hotel_stay where status  ='S'  and facilities in (${facility})and year ='${year}' and month in (${month}) GROUP BY facility ORDER BY created_at ASC `);
  },

  getEmployeeCommutingReportMulti: async (
    facility,
    year,

  ) => {
    //return db.query(`select * from employee_commuting_category where status  ='S'  and facilities in (${facility})and year ='${year}' and month in (${month}) ORDER BY created_at ASC`);
    return db.query(`select 'Scope3' as scope,'Employee Commuting' as data_point, 'Employee Commuting' as category, year, month, sum(emission) as emission, facilities as facility from employee_commuting_category where status  ='S'  and facilities in (${facility}) and year ='${year}' GROUP BY facility ORDER BY created_at ASC `);
  },

  getHomeOfficeReportMulti: async (
    facility,
    year,
    //month,

  ) => {
    /*return db.query(`select typeofhomeoffice, noofemployees, noofdays, noofmonths, sum(emission) as emission, facilities, year, month \
                    from  homeoffice_category where status  ='S'  and facilities in (${facility})and year ='${year}' and month in (${month}) ORDER BY created_at ASC `);*/

    return db.query(`select 'Scope3' as scope, 'Employee Commuting' as data_point, typeofhomeoffice as category,year, month, sum(emission) as emission, facilities as facility  \
                    from  homeoffice_category where status  ='S'  and facilities in (${facility}) and year ='${year}' GROUP BY facilities ORDER BY created_at ASC `);
  },

  getSoldProductReportMulti: async (
    facility,
    year,
    month

  ) => {
    return db.query(`select 'Scope3' as scope, 'Sold Products' as data_point, type as category, year, month, sum(emission) as emission, facilities as facility, type \
                    from  sold_product_category where status  ='S'  and facilities in (${facility}) and year ='${year}' and month in (${month})  GROUP BY facilities ORDER BY created_at ASC `);
  },
  getSoldProductbyId: async (id) => {
    return db.query("select item from sold_product_category_ef where id = ?", [
      id,
    ]);
  },

  getEndOfLifeTreatmentReportMulti: async (
    facility,
    year,
    month

  ) => {
    return db.query(`select 'Scope3' as scope, 'End of Life Treatment' as data_point, waste_type as category,  year, month, sum(emission) as emission, facilities as facility\
                    from  endof_lifetreatment_category where status  ='S'  and facilities in (${facility}) and year ='${year}' and month in (${month}) GROUP BY facilities ORDER BY created_at ASC `);
  },
  
  getWasteTypebyId: async (id) => {
    return db.query("select type from endoflife_waste_type where id = ?", [
      id,
    ]);
  },

  getProOfSoldGoodsReportMulti: async (
    facility,
    year,
    month

  ) => {
    return db.query(`select 'Scope3' as scope, 'End of Life Treatment' as data_point, intermediate_category as category, year, month, sum(emission) as emission, unit, facilities as facility \
                    from  processing_of_sold_products_category where status  ='S'  and facilities in (${facility}) and year ='${year}' and month in (${month}) GROUP BY facilities ORDER BY created_at ASC `);
  },

  getRefrigerantReportMulti: async(
    facility,
    year,
    month

  )=> {
    return db.query(`select 'Scope1' as scope, 'Refrigerants' as data_point,  sum(GHGEmission) as emission, year, months as month, facilities as facility, subCategoryTypeId as sub_id \
                    from  \`dbo.refrigerantde\` where status  ='S'  and facilities in (${facility}) and year ='${year}' and months in (${month}) GROUP BY facilities  ORDER BY CreatedDate ASC `);
  },

  getReferigerantbyIdMulti: async (id) => {
    return db.query("select item from \`dbo.refrigents\` where subCatTypeID = ?", [
      id,
    ]);
  },

  getFireExtinguisherReportMulti: async(
    facility,
    year,
    month

  )=> {
    return db.query(`select 'Scope1' as scope, 'Fire Extinguisher' as data_point, sum(GHGEmission) as emission,  year, months as month, facilities as facility, SubCategorySeedID as sub_id \
                    from  \`dbo.fireextinguisherde\` where status  ='S'  and facilities in (${facility}) and year ='${year}' and months in (${month}) GROUP BY facilities ORDER BY CreatedDate ASC `);
  },



  getElecricityReportMulti: async (
    facility,
    year,
    month

  ) => {
    return db.query(`select  'Scope2' as scope, 'Renewable Electricity' as data_point ,sum(GHGEmission) as emission, year, months as month, facilities as facility, SubCategorySeedID as category_id \
                    from  \`dbo.renewableelectricityde\` where status  ='S'  and facilities in (${facility}) and year ='${year}' and months in (${month}) GROUP BY facilities  ORDER BY CreatedDate ASC `);
  },

  getHeatandSteamReportMulti: async (
    facility,
    year,
    month

  ) => {
    return db.query(`select 'Scope2' as scope, 'Heat and Steam' as data_point, sum(GHGEmission) as emission, year, months as month, facilities as facility, SubCategorySeedID as category_id\
                    from  \`dbo.heatandsteamde\` where status  ='S'  and facilities in (${facility}) and year ='${year}' and months in (${month}) GROUP BY facilities ORDER BY CreatedDate ASC `);
  },


  getWaterSupplyandTreatmentMulti: async (
    facility,
    year,
    month

  ) => {
    return db.query(`select 'Scope3' as scope, 'Water Supply Treatment' as data_point, 'Water Supply' as category,  sum(emission) as emission, facilities as facility, year, month \
                    from  \`water_supply_treatment_category\` where status  ='S'  and facilities in (${facility}) and year ='${year}' and month in (${month}) GROUP BY facilities ORDER BY created_at ASC `);
  },

  getCompanyOwnedVehiclesMulti: async (
    facility,
    year,
    month

  ) => {
    return db.query(`select 'Scope3' as scope, 'Company Owned Vehicle' as data_point, sum(GHGEmission) as emission, facilities as facility, year, months as month\
                    from  \`dbo.vehiclede\` where status  ='S'  and facilities in (${facility}) and year ='${year}' and months IN(${month}) GROUP BY facilities ORDER BY CreatedDate ASC `);
  },

  getProOfSoldGoodsReportMulti: async (
    facility,
    year,
    month,
  ) => {
    return db.query(`select 'Scope3' as scope, 'Processing of Sold Goods' as data_point, intermediate_category as category,  emission, facilities as facility, year, month \
                    from  processing_of_sold_products_category where status  ='S'  and facilities in (${facility}) and year ='${year}' and month in (${month}) GROUP BY facilities ORDER BY created_at`);
  },

};
