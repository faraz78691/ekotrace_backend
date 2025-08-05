const db = require("../utils/database");
const config = require("../config");
const baseurl = config.base_url;

module.exports = {
  insertUpLeaseEmission: async (data) => {
    return db.query(
      "INSERT INTO  `upstreamLease_emission` (facility_type,category,sub_category,calculation_method,franchise_space,scope1_emission,scope2_emission,emission,emission_factor_lease, emission_factor_lease_unit,emission_factor_vehichle,emission_factor_vehicle_unit,user_id,status,month,year,unit,facility_id,distance_travelled,distance_unit,vehicle_type,vehicle_subtype,vehicle_emission,no_of_vehicles) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        data.facility_type,
        data.category,
        data.sub_category,
        data.calculation_method,
        data.franchise_space,
        data.scope1_emission,
        data.scope2_emission,
        Number(data.emission) + Number(data.vehicle_emission),
        data.emission_factor_lease,
        data.emission_factor_lease_unit,
        data.emission_factor_vehichle,
        data.emission_factor_vehicle_unit,
        data.user_id,
        "P",
        data.month,
        data.year,
        data.unit,
        data.facility_id,
        data.distance_travelled,
        data.distance_unit,
        data.vehicle_type,
        data.vehicle_subtype,
        data.vehicle_emission,
        data.no_of_vehicles,
      ]
    );
  },

  insertdownLeaseEmission: async (data) => {
    return db.query(
      "INSERT INTO   `downstreamLease_emission` (facility_type,category,sub_category,calculation_method,franchise_space,scope1_emission,scope2_emission,emission,emission_factor_lease, emission_factor_lease_unit,emission_factor_vehichle,emission_factor_vehicle_unit,user_id,status,month,year,unit,facility_id,distance_travelled,distance_unit,vehicle_type,vehicle_subtype,vehicle_emission,no_of_vehicles) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        data.facility_type,
        data.category,
        data.sub_category,
        data.calculation_method,
        data.franchise_space,
        data.scope1_emission,
        data.scope2_emission,
        Number(data.emission) + Number(data.vehicle_emission),
        data.emission_factor_lease,
        data.emission_factor_lease_unit,
        data.emission_factor_vehichle,
        data.emission_factor_vehicle_unit,
        data.user_id,
        "P",
        data.month,
        data.year,
        data.unit,
        data.facility_id,
        data.distance_travelled,
        data.distance_unit,
        data.vehicle_type,
        data.vehicle_subtype,
        data.vehicle_emission,
        data.no_of_vehicles
      ]
    );
  },
};
