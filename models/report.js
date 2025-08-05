const db = require("../utils/database");
const config = require("../config");
const baseurl = config.base_url;

module.exports = {
  getPurchaseGoodsReport: async (
    user_id,
    facility,
    year,
    month,
    pageSize,
    offset
  ) => {
    return db.query(`select  'Purchase Goods' as category,        pgcef.product as Product, top.typesofpurchasename as Type_of_Purchase, pgc.unit, pgc.productcode,  dbu.tenantName as user_name, \
                     pgc.emission as Emission,  pgc.year as Years, pgc.month as Months, pgc.supplier as vendor, pgc.supplierspecificEF as vendor_ef, pgc.supplierunit as vendor_ef_unit, pgc.valuequantity as quantity \
                     from  purchase_goods_categories pgc,   \`dbo.typesofpurchase\`   top,  \`dbo.tenants\` dbu,  \
                     purchase_goods_categories_ef pgcef where  pgc.year =${year} and pgc.month in (${month}) and pgc.status ='S'  \
                      and pgc.productcode = pgcef.HSN_code and pgc.facilities in (${facility}) and dbu.id= pgc.user_id \
                     and pgc.product_category = pgcef.id  and top.id = pgc.typeofpurchase ORDER BY pgc.created_at ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },

  getDownStreamVehicleReport: async (
    user_id,
    facility,
    year,
    month,
    pageSize,
    offset
  ) => {
    return db.query(`select a.vehicle_type as category, a.sub_category as subcategory, a.no_of_vehicles as quantity,a.unit_of_mass as  unit , a.emission, a.facility_id as facility, a.distance_travelled_km, a.mass_of_product_trans , a.storage_facility_type, a.year, a.month, a.avg_no_of_days, a.area_occupied, a.no_of_vehicles \
                    ,dbu.tenantName as user_name from  downstream_vehicle_storage_emissions a, \`dbo.tenants\` dbu  where  dbu.id= a.user_id and a.status  ='S'  and a.facility_id ='${facility}' and a.year ='${year}' and a.month in (${month}) ORDER BY a.created_at ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },

  getUpStreamVehicleReport: async (
    user_id,
    facility,
    year,
    month,
    pageSize,
    offset
  ) => {
    return db.query(`select a.vehicle_type, vehicletypes.vehicle_type AS category, a.sub_category as subcategory, a.no_of_vehicles as quantity,a.unit_of_mass as  unit , a.emission, a.facility_id as facility, a.distance_travelled_km, a.mass_of_product_trans , a.storage_facility_type, a.year, a.month, a.avg_no_of_days, a.area_occupied, a.no_of_vehicles \
                    ,dbu.tenantName as user_name from  upstream_vehicle_storage_emissions a, \`dbo.tenants\` dbu, vehicletypes   where  dbu.id= a.user_id and a.status  ='S'  and a.facility_id ='${facility}' and a.year ='${year}' AND vehicletypes.id = a.vehicle_type AND a.month in (${month}) ORDER BY a.created_at ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },

  getFranchiseEmissionReport: async (
    user_id,
    facility,
    year,
    month,
    pageSize,
    offset
  ) => {
    return db.query(`select f.franchise_type as category, f.sub_category as subcategory, f.franchise_space as quantity,f.unit as  unit , f.emission, f.facility_id as facility, f.year, f.month,  dbu.tenantName as user_name\
                    from  franchise_categories_emission f, \`dbo.tenants\` dbu  where  dbu.id= f.user_id and f.status  ='S'  and f.facility_id ='${facility}' and f.year ='${year}' and f.month in (${month}) ORDER BY f.created_at ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },

  getInvestmentEmissionReport: async (
    user_id,
    facility,
    year,
    month,
    pageSize,
    offset
  ) => {
    return db.query(`select f.category as category, f.sub_category as subcategory, (CASE f.equity_share WHEN 0 THEN f.equity_of_projectcost ELSE f.equity_share END)  as quantity,f.unit as  unit , f.emission, f.facilities as facility, f.year, f.month,dbu.tenantName as user_name \
                    from  investment_emissions f, \`dbo.tenants\` dbu  where dbu.id= f.user_id and f.status  ='S'  and f.facilities ='${facility}' and f.year ='${year}' and f.month in (${month}) ORDER BY f.created_at ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },

  getStationaryCombustionReport: async (
    user_id,
    facility,
    year,
    month,
    pageSize,
    offset
  ) => {
    return db.query(`select f.SubCategoriesID as category_id, f.TypeName as subcategory, f.ReadingValue as quantity,f.Unit as  unit ,f.GHGEmission as emission, f.facility_id as facility, f.year, f.month, f.BlendType, f.BlendPercent, dbu.tenantName as user_name \
                    from  stationarycombustionde f,\`dbo.tenants\` dbu  where  dbu.id= f.user_id and f.status  ='S'  and f.facility_id ='${facility}' and f.year ='${year}' and f.month IN(${month}) ORDER BY f.SubmissionDate ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },

  getCategoryBySeedId: async (id) => {
    return db.query("select item from subcategoryseeddata where id = ?", [id]);
  },

  getUpstreamLeaseEmissionReport: async (
    user_id,
    facility,
    year,
    month,
    pageSize,
    offset
  ) => {
    return db.query(`select f.category, f.sub_category as subcategory, f.franchise_space as quantity, f.unit , f.emission, f.facility_id as facility, f.year, f.month, f.scope1_emission, f.scope2_emission, f.no_of_vehicles, f.distance_travelled, f.status,  dbu.tenantName as user_name\
                    from  upstreamLease_emission f, \`dbo.tenants\` dbu where f.status  ='S'  and f.facility_id ='${facility}' and f.year ='${year}' AND dbu.Id = f.user_id AND f.month in (${month}) ORDER BY f.created_at ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },

  getDownstreamLeaseEmissionReport: async (
    user_id,
    facility,
    year,
    month,
    pageSize,
    offset
  ) => {
    return db.query(`select f.category, f.sub_category as subcategory, f.franchise_space as quantity, f.unit , f.emission, f.facility_id as facility, f.year, f.month, f.scope1_emission, f.scope2_emission, f.no_of_vehicles, f.distance_travelled, f.status, dbu.tenantName as user_name \
                    from  downstreamLease_emission f,\`dbo.tenants\` dbu  where  dbu.id= f.user_id and f.status  ='S'  and f.facility_id ='${facility}' and f.year ='${year}' and f.month in (${month}) ORDER BY f.created_at ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },

  getWasteGeneratedEmissionReport: async (
    user_id,
    facility,
    year,
    month,
    pageSize,
    offset
  ) => {
    return db.query(`select f.product AS category, f.waste_type AS subcategory, f.method AS method, f.total_waste as quantity, unit , f.emission, f.facility_id as facility, f.year, f.month, dbu.tenantName as user_name \
                    from  waste_generated_emissions f, \`dbo.tenants\` dbu  where  dbu.id= f.user_id and  f.status  ='S'  and f.facility_id ='${facility}' and f.year ='${year}' and f.month in (${month}) ORDER BY f.created_at ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },

  getFlightTravelReport: async (
    user_id,
    facility,
    year,
    month,
    pageSize,
    offset
  ) => {
    return db.query(`select f.flight_Type as flight_type, f.flight_Class as flight_class, 'from', 'to', f.no_of_passengers, f.distance as distance,f.return_flight,   f.emission, f.distance, f.facilities, f.year, f.month,dbu.tenantName as user_name \
                    from  flight_travel  f,\`dbo.tenants\` dbu where  dbu.id= f.user_id and f.status  ='S'  and f.facilities ='${facility}' and f.year ='${year}' and f.month in (${month}) ORDER BY f.created_at ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },

  getOtherTransportReport: async (
    user_id,
    facility,
    year,
    month,
    pageSize,
    offset
  ) => {
    return db.query(`select f.mode_of_trasport as vehicle_type,type,  f.fuel_type as fuel_type, f.no_of_passengers, f.distance_travelled as distance,f.no_of_trips , f.emission, f.facilities, f.year, f.month,dbu.tenantName as user_name \
                    from  other_modes_of_transport  f,\`dbo.tenants\` dbu  where  dbu.id= f.user_id and f.status  ='S'  and f.facilities ='${facility}' and f.year ='${year}' and f.month in (${month}) ORDER BY f.created_at ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },

  getHotelStayReport: async (
    user_id,
    facility,
    year,
    month,
    pageSize,
    offset
  ) => {
    return db.query(`select f.country_of_stay,f.type_of_hotel ,  f.no_of_occupied_rooms, 	f.no_of_nights_per_room, f.emission, f.facilities, f.year, f.month,dbu.tenantName as user_name \
                    from  hotel_stay  f,\`dbo.tenants\` dbu  where  dbu.id= f.user_id and  f.status  ='S'  and f.facilities ='${facility}' and f.year ='${year}' and f.month in (${month}) ORDER BY f.created_at ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },

  getEmployeeCommutingReport: async (
    user_id,
    facility,
    year,
    pageSize,
    offset
  ) => {
    //return db.query(`select * from employee_commuting_category where status  ='S'  and facilities ='${facility}' and year ='${year}' and month in (${month}) ORDER BY created_at ASC`);
    return db.query(`SELECT f.*, dbu.tenantName AS user_name, C.category, S.subcategory FROM employee_commuting_category f, \`dbo.tenants\` dbu, employee_community_typeoftransport C, employee_community_typeoftransport S WHERE dbu.id = f.user_id AND C.category_id = f.typeoftransport AND S.id = f.subtype AND f.status = 'S' AND f.facilities = '${facility}' AND f.year = '${year}' GROUP BY f.id ORDER BY f.created_at ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },

  getHomeOfficeReport: async (
    user_id,
    facility,
    year,
    //month,
    pageSize,
    offset
  ) => {
    /*return db.query(`select typeofhomeoffice, noofemployees, noofdays, noofmonths, emission, facilities, year, month \
                    from  homeoffice_category where status  ='S'  and facilities ='${facility}' and year ='${year}' and month in (${month}) ORDER BY created_at ASC LIMIT ${pageSize} OFFSET ${offset}`);*/

    return db.query(`select f.typeofhomeoffice, f.noofemployees, f.noofdays, f.noofmonths, f.emission, f.facilities, f.year, month,dbu.tenantName as user_name \
                    from  homeoffice_category  f,\`dbo.tenants\` dbu  where  dbu.id= f.user_id and f.status  ='S'  and f.facilities ='${facility}' and f.year ='${year}' ORDER BY f.created_at ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },

  getSoldProductReport: async (
    user_id,
    facility,
    year,
    month,
    pageSize,
    offset
  ) => {
    return db.query(`select f.type , f.productcategory, f.no_of_Items ,f.no_of_Items_unit ,f.electricity_use, f.electricity_usage, f.electricity_per_usage,dbu.tenantName as user_name, \
                     f.fuel_type, f.fuel_consumed, f.fuel_consumed_usage, f.fuel_consumed_per_usage, f.referigentused, f.referigerantleakage, f.referigerant_usage, f.referigerant_per_usage ,f.emission, f.facilities, f.year, f.month \
                    from  sold_product_category  f,\`dbo.tenants\` dbu where  dbu.id= f.user_id and f.status  ='S'  and f.facilities ='${facility}' and f.year ='${year}' and f.month in (${month}) ORDER BY f.created_at ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },
  getSoldProductbyId: async (id) => {
    return db.query("select item from sold_product_category_ef where id = ?", [
      id,
    ]);
  },

  getEndOfLifeTreatmentReport: async (
    user_id,
    facility,
    year,
    month,
    pageSize,
    offset
  ) => {
    return db.query(`select f.waste_type, f.subcategory, f.total_waste, f.waste_unit, f.emission, f.landfill, f.combustion, f.recycling, f.composing, f.facilities, f.year, f.month ,dbu.tenantName as user_name\
                    from  endof_lifetreatment_category  f,\`dbo.tenants\` dbu  where  dbu.id= f.user_id and  f.status  ='S'  and f.facilities ='${facility}' and f.year ='${year}' and f.month in (${month}) ORDER BY f.created_at ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },

  getWasteTypebyId: async (id) => {
    return db.query("select type from endoflife_waste_type where id = ?", [
      id,
    ]);
  },

  getProOfSoldGoodsReport: async (
    user_id,
    facility,
    year,
    month,
    pageSize,
    offset
  ) => {
    return db.query(`select f.intermediate_category as category, f.calculation_method, f.processing_acitivity, f.sub_activity, f.emission, f.unit, f.facilities, f.year, f.month,dbu.tenantName as user_name \
                    from  processing_of_sold_products_category  f,\`dbo.tenants\` dbu  where  dbu.id= f.user_id and f.status  ='S'  and f.facilities ='${facility}' and f.year ='${year}' and f.month in (${month}) ORDER BY f.created_at ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },

  getRefrigerantReport: async (user_id,
    facility,
    year,
    month,
    pageSize,
    offset
  ) => {
    return db.query(`select f.refamount , f.GHGEmission as emission, f.unit, f.subCategoryTypeId as sub_id, f.TypeName, f.facilities, f.year, f.months,dbu.tenantName as user_name \
                    from  \`dbo.refrigerantde\`  f,\`dbo.tenants\` dbu where  dbu.id= f.user_id and  f.status  ='S'  and f.facilities ='${facility}' and f.year ='${year}' and f.months in (${month})  ORDER BY f.CreatedDate ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },

  getReferigerantbyId: async (id) => {
    return db.query("select item from \`dbo.refrigents\` where subCatTypeID = ?", [
      id,
    ]);
  },

  getFireExtinguisherReport: async (user_id,
    facility,
    year,
    month,
    pageSize,
    offset
  ) => {
    return db.query(`select f.numberofextinguisher , f.GHGEmission as emission, f.unit, f.quantityOfCO2makeup as quantity, f.SubCategorySeedID as sub_id, f.facilities, f.year, f.months, dbu.tenantName as user_name \
                    from  \`dbo.fireextinguisherde\`  f,\`dbo.tenants\` dbu  where  dbu.id= f.user_id and  f.status  ='S'  and f.facilities ='${facility}' and f.year ='${year}' and f.months in (${month}) ORDER BY f.CreatedDate ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },

  getFireExtbyId: async (id) => {
    return db.query("select item from \`dbo.fireextinguisher\` where SubCategorySeedID = ?", [
      id,
    ]);
  },

  getElecricityReport: async (
    user_id,
    facility,
    year,
    month,
    pageSize,
    offset
  ) => {
    return db.query(`select f.readingValue as reading_value, f.unit, f.GHGEmission as emission, f.energy, f.sourcename, f.facilities, f.year, f.months ,dbu.tenantName as user_name\
                    from  \`dbo.renewableelectricityde\`  f,\`dbo.tenants\` dbu  where  dbu.id= f.user_id and  f.status  ='S'  and f.facilities ='${facility}' and f.year ='${year}' and f.months in (${month}) ORDER BY f.CreatedDate ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },

  getHeatandSteamReport: async (
    user_id,
    facility,
    year,
    month,
    pageSize,
    offset
  ) => {
    return db.query(`select f.readingValue as reading_value, f.unit, f.GHGEmission as emission, energy, f.facilities, f.year, f.months ,dbu.tenantName as user_name \
                    from  \`dbo.heatandsteamde\`  f,\`dbo.tenants\` dbu  where  dbu.id= f.user_id and f.status  ='S'  and f.facilities ='${facility}' and f.year ='${year}' and f.months in (${month}) ORDER BY f.CreatedDate ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },


  getWaterSupplyandTreatment: async (
    user_id,
    facility,
    year,
    month,
    pageSize,
    offset
  ) => {
    return db.query(`select f.water_supply ,f.water_treatment, f.water_supply_unit, f.water_treatment_unit, f.emission, f.facilities, f.year, f.month, dbu.tenantName as user_name \
                    from  \`water_supply_treatment_category\`  f,\`dbo.tenants\` dbu where  dbu.id= f.user_id and  f.status  ='S'  and f.facilities ='${facility}' and f.year ='${year}' and f.month in (${month}) ORDER BY f.created_at ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },

  getCompanyOwnedVehicles: async (
    user_id,
    facility,
    year,
    month,
    pageSize,
    offset
  ) => {
    return db.query(`select f.vehicleTypeID, f.NoOfVehicles as No_of_vehicles , f.GHGEmission as emission, f.Unit as unit ,  f.ModeOfDE as Mode_of_vehicle , f.ModeofDEID, f.AvgPeoplePerTrip, f.TotalnoOftripsPerVehicle, f.facilities, f.year, f.months, f.value,dbu.tenantName as user_name \
                    from  \`dbo.vehiclede\`  f,\`dbo.tenants\` dbu  where  dbu.id= f.user_id and  f.status  ='S'  and f.facilities ='${facility}' and f.year ='${year}' and f.months IN(${month}) ORDER BY f.CreatedDate ASC LIMIT ${pageSize} OFFSET ${offset}`);
  },

  getVehicle: async (id) => {
    return db.query("select item from \`companyownedvehicles\` where ID = ?", [
      id,
    ]);
  },
};
