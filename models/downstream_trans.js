const db = require("../utils/database");
const config = require("../config");
const baseurl = config.base_url;

module.exports = {
  fetchUserById: async (id) => {
    return db.query(" select * from aspnetusers where id= ?", [id]);
  },
  fetchUserByEmail: async (email) => {
    return db.query("select * from aspnetusers where Email = ?", [email]);
  },
  fetchVehicleId: async (vehicle_type) => {
    return db.query("select id from vehicletypes where vehicle_type = ?", [
      vehicle_type,
    ]);
  },
  fetchVehicleByVehicleTypeId: async (id) => {
    return db.query("select id from vehicletypes where id = ?", [
      id
    ]);
  },
  fetchVehicleEmission: async (vehicle_id, vehicle_type, country_id,year) => {
    return db.query(
      "select * from vehicle_subcategory where vehicle_category_id = ? and vehicle_type = ? and country_id = ? and Right(Fiscal_Year, 4) = ? ",
      [vehicle_id, vehicle_type, country_id, year]
    )
  },

  insertDownStreamVehicleStorageEmission: async (data) => {
    return db.query(
      "INSERT INTO   `downstream_vehicle_storage_emissions` (vehicle_type, sub_category,no_of_vehicles,mass_of_product_trans,unit_of_mass,distance_travelled_km,emission, emission_factor_value, emission_factor_value_unit, emission_factor_storage, emission_factor_storage_unit, user_id,status,storage_facility_type,area_occupied,avg_no_of_days, facility_id,month,year) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        data.vehicleType,
        data.subCategory,
        data.noOfVehicles,
        data.massOfProducts,
        data.unit_of_mass,
        data.distanceInKms,
        Number(data.emissionVehicle) + Number(data.emissionStorage),
        data.emission_factor_value,
        data.emission_factor_value_unit,
        data.emission_factor_storage,
        data.emission_factor_storage_unit,
        data.userId,
        data.status,
        data.storageFType,
        data.areaOccupied,
        data.averageNoOfDays,
        data.facility_id,
        data.month,
        data.year,
      ]
    );
  },
  insertUpStreamVehicleStorageEmission: async (data) => {
    return db.query(
      "INSERT INTO   `upstream_vehicle_storage_emissions` (vehicle_type, sub_category,no_of_vehicles,mass_of_product_trans, unit_of_mass, distance_travelled_km,emission, emission_factor_value, emission_factor_value_unit, emission_factor_storage, emission_factor_storage_unit, user_id,status,storage_facility_type,area_occupied,avg_no_of_days, facility_id,month,year) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        data.vehicleType,
        data.subCategory,
        data.noOfVehicles,
        data.massOfProducts,
        data.unit_of_mass,
        data.distanceInKms,
        Number(data.emissionVehicle) + Number(data.emissionStorage),
        data.emission_factor_value,
        data.emission_factor_value_unit,
        data.emission_factor_storage,
        data.emission_factor_storage_unit,
        data.userId,
        data.status,
        data.storageFType,
        data.areaOccupied,
        data.averageNoOfDays,
        data.facility_id,
        data.month,
        data.year,
      ]
    );
  },
  updateEmissionStatus: async (id, emission, status) => {
    return db.query(
      "update purchase_goods_categories set emission=? , status = ? where id= ?",
      [emission, status, id]
    );
  },

};
