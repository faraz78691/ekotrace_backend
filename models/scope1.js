const db = require("../utils/database");
const config = require("../config");
const baseurl = config.base_url;

module.exports = {
  Addassignedmanagedatapoint: async (data) => {
    return db.query("insert into `dbo.managedatapoint`  set ?", [data]);
  },

  AddassignedDataPointbyfacility: async (data) => {
    return db.query("insert into `dbo.managedatapointcategory`  set ?", [data]);
  },

  Addmanagedatapointcategory: async (data) => {
    return db.query("insert into `dbo.managedatapointcategory`  set ?", [data]);
  },

  Addmanagedatapointsubcategory: async (data) => {
    return db.query("insert into `dbo.managedatapointsubcategory`  set ?", [data]);
  },

  AddstationarycombustionLiquid: async (data) => {
    return db.query("insert into `stationarycombustionde`  set ?", [data]);
  },

  Addrefrigerant: async (data) => {
    return db.query("insert into `dbo.refrigerantde`  set ?", [data]);
  },

  getrefrigerant: async (item, country_id) => {
    return db.query("select * from `dbo.refrigents`  where ID=? and country_id = ? ", [item, country_id]);
  },

  Allrefrigerants: async (user_id) => {
    return db.query("select A.*,B.item,B.kgCO2e_kg from `dbo.refrigerantde` A LEFT JOIN `dbo.refrigents` B ON B.ID = A.subCategoryTypeId where A.user_id=?", [user_id]);
  },

  Allfireextinguisher: async (user_id) => {
    return db.query("select A.*,B.item,B.kgCO2e_kg from `dbo.fireextinguisherde` A LEFT JOIN `dbo.fireextinguisher` B ON B.ID = A.subCategoryTypeId where A.user_id=?", [user_id]);
  },

  Addfireextinguisher: async (data) => {
    return db.query("insert into  `dbo.fireextinguisherde`  set ?", [data]);
  },

  getfireextinguisher: async (item, country_id) => {
    return db.query("select * from `dbo.fireextinguisher`  where SubCategorySeedID=?", [item, country_id]);
  },

  getpassengervehicletypes: async (country_id, year) => {
    return await db.query('SELECT ID, Item, ItemType AS VehicleType FROM `companyownedvehicles` WHERE country_id = "' + country_id + '" AND SubCategorySeedID = 10 and Right(Fiscal_Year, 4) = "' + year + '"');
  },

  getdeliveryvehicletypesWithCountryId: async (country_id) => {
    return db.query('select * from `dbo.deliveryvehicletypes` where vehicletypes_id < 4  AND country_id = "' + country_id + '"');
  },

  getdeliveryvehicletypes: async (country_id , year) => {
    return await db.query('SELECT ID, Item, ItemType AS VehicleType FROM `companyownedvehicles` WHERE country_id = "' + country_id + '" AND SubCategorySeedID = 11 and Right(Fiscal_Year, 4) = "' + year + '"');
  },

  getelectricity: async (id, CountryId) => {
    return db.query('select *,SubCategorySeedID as subCatTypeID from `dbo.electricity` where SubCategorySeedID = "' + id + '" AND country_id = "' + CountryId + '"');
  },


  getRenewableelectricity: async (id, CountryId) => {
    return db.query('select *,SubCategorySeedID as subCatTypeID from `dbo.electricity` where SubCategorySeedID = "' + id + '" AND country_id = "' + CountryId + '"');
  },


  getheatandsteam: async (id, CountryId) => {
    return db.query('select * from `dbo.heatandsteam` where SubCategorySeedID = "' + id + '" AND country_id = "' + CountryId + '"');
  },

  Addcompanyownedvehicles: async (data) => {
    return db.query("insert into  `dbo.vehiclede`  set ?", [data]);
  },

  getvehicletypesByName: async (VehicleTypeID, SubCategorySeedID, facilityId) => {
    const categoryValue = SubCategorySeedID == 10 ? 1 : 2;
    return db.query("SELECT tbl_vehicle_fleet.company_owned_vehicle_id AS vehicle_type_id, companyownedvehicles.* FROM `tbl_vehicle_fleet` LEFT JOIN companyownedvehicles ON companyownedvehicles.ID = tbl_vehicle_fleet.company_owned_vehicle_id WHERE tbl_vehicle_fleet.vehicle_model = ? AND tbl_vehicle_fleet.category = ? AND tbl_vehicle_fleet.facility_id = ?", [VehicleTypeID, categoryValue, facilityId]);
  },

  getvehicletypes: async (VehicleTypeID, SubCategorySeedID, country_id) => {
    return db.query("select * from `companyownedvehicles` where ID = ? and SubCategorySeedID = ? and country_id = ?", [VehicleTypeID, SubCategorySeedID, country_id]);
  },

  getAllcompanyownedvehicles: async (user_id, ModeofDEID) => {
    var join = "";
    if (ModeofDEID == 1) {
      join = ' LEFT JOIN  `dbo.passengervehicletypes` B ON A.VehicleTypeID = B.ID';
    } else {
      join = ' LEFT JOIN  `dbo.passengervehicletypes` B ON A.VehicleTypeID = B.ID';
    }
    return db.query('select A.*,B.VehicleType from `dbo.vehiclede` A  ' + join + ' where  A.user_id = ?', [user_id]);
  },

  getpassengervehicletypesById: async (id) => {
    return db.query("select * from `dbo.passengervehicletypes` where id=? ", [id]);
  },

  fetchStationaryCombustiondeByFacilityId: async (facility_id, fileUrl) => {
    return await db.query('SELECT CONCAT("' + fileUrl + '", stationarycombustionde.FileName) AS FileName, stationarycombustionde.CreatedDate, `dbo.tenants`.userName FROM `stationarycombustionde` LEFT JOIN `dbo.tenants` ON `dbo.tenants`.Id = stationarycombustionde.user_id WHERE stationarycombustionde.facility_id = ? AND stationarycombustionde.FileName IS NOT NULL;', [facility_id]);
  },

  fetchRefrigerantsByFacilityId: async (facility_id, fileUrl) => {
    return await db.query('SELECT CONCAT("' + fileUrl + '", `dbo.refrigerantde`.FileName) AS FileName, `dbo.refrigerantde`.CreatedDate, `dbo.tenants`.userName FROM `dbo.refrigerantde` LEFT JOIN `dbo.tenants` ON `dbo.tenants`.Id = `dbo.refrigerantde`.user_id WHERE `dbo.refrigerantde`.facilities = ? AND `dbo.refrigerantde`.FileName IS NOT NULL;', [facility_id]);
  },

  fetchFireExtinguisherByFacilityId: async (facility_id, fileUrl) => {
    return await db.query('SELECT CONCAT("' + fileUrl + '", `dbo.fireextinguisherde`.FileName) AS FileName, `dbo.fireextinguisherde`.CreatedDate, `dbo.tenants`.userName FROM `dbo.fireextinguisherde` LEFT JOIN `dbo.tenants` ON `dbo.tenants`.Id = `dbo.fireextinguisherde`.user_id WHERE `dbo.fireextinguisherde`.facilities = ? AND `dbo.fireextinguisherde`.FileName IS NOT NULL;', [facility_id]);
  },

  fetchCompanyOwnedVehichleByFacilityId: async (facility_id, fileUrl) => {
    return await db.query('SELECT CONCAT("' + fileUrl + '", `dbo.vehiclede`.FileName) AS FileName, `dbo.vehiclede`.CreatedDate, `dbo.tenants`.userName FROM `dbo.vehiclede` LEFT JOIN `dbo.tenants` ON `dbo.tenants`.Id = `dbo.vehiclede`.user_id WHERE `dbo.vehiclede`.facilities = ? AND `dbo.vehiclede`.FileName IS NOT NULL;', [facility_id]);
  },

  fetchElectricityByFacilityId: async (facility_id, fileUrl) => {
    return await db.query('SELECT CONCAT("' + fileUrl + '", `dbo.renewableelectricityde`.FileName) AS FileName, `dbo.renewableelectricityde`.CreatedDate, `dbo.tenants`.userName FROM `dbo.renewableelectricityde` LEFT JOIN `dbo.tenants` ON `dbo.tenants`.Id = `dbo.renewableelectricityde`.user_id WHERE `dbo.renewableelectricityde`.facilities = ? AND `dbo.renewableelectricityde`.FileName IS NOT NULL;', [facility_id])
  },

  fetchHeatAndSteamByFacilityId: async (facility_id, fileUrl) => {
    return await db.query('SELECT CONCAT("' + fileUrl + '", `dbo.heatandsteamde`.FileName) AS FileName, `dbo.heatandsteamde`.CreatedDate, `dbo.tenants`.userName FROM `dbo.heatandsteamde` LEFT JOIN `dbo.tenants` ON `dbo.tenants`.Id = `dbo.heatandsteamde`.user_id WHERE `dbo.heatandsteamde`.facilities = ? AND `dbo.heatandsteamde`.FileName IS NOT NULL;', [facility_id]);
  },

  fetchPurchasedGoodsAndServicesByFacilityId: async (facility_id, fileUrl) => {
    return await db.query('SELECT CONCAT("' + fileUrl + '", purchase_goods_categories.FileName) AS FileName, purchase_goods_categories.created_at, `dbo.tenants`.userName FROM purchase_goods_categories LEFT JOIN `dbo.tenants` ON `dbo.tenants`.Id = purchase_goods_categories.user_id WHERE purchase_goods_categories.facilities = ? AND purchase_goods_categories.FileName IS NOT NULL;', [facility_id])
  },

  fetchBussinessTravelByFacilityId: async (facility_id, fileUrl) => {
    const flight_travel = await db.query('SELECT CONCAT("' + fileUrl + '", flight_travel.FileName) AS FileName, flight_travel.created_at, `dbo.tenants`.userName FROM flight_travel LEFT JOIN `dbo.tenants` ON `dbo.tenants`.Id = flight_travel.user_id WHERE flight_travel.facilities = ? AND flight_travel.FileName IS NOT NULL;', [facility_id]);
    const hotel_stay = await db.query('SELECT CONCAT("' + fileUrl + '", hotel_stay.FileName) AS FileName, hotel_stay.created_at, `dbo.tenants`.userName FROM hotel_stay LEFT JOIN `dbo.tenants` ON `dbo.tenants`.Id = hotel_stay.user_id WHERE hotel_stay.facilities = ? AND hotel_stay.FileName IS NOT NULL;', [facility_id]);
    const other_mode_of_transport = await db.query('SELECT CONCAT("' + fileUrl + '", other_modes_of_transport.FileName) AS FileName, other_modes_of_transport.created_at, `dbo.tenants`.userName FROM other_modes_of_transport LEFT JOIN `dbo.tenants` ON `dbo.tenants`.Id = other_modes_of_transport.user_id WHERE other_modes_of_transport.facilities = ? AND other_modes_of_transport.FileName IS NOT NULL;', [facility_id])

    return {
      flight_travel,
      hotel_stay,
      other_mode_of_transport
    }
  }

}
