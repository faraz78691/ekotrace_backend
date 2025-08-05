const Joi = require("joi");
const config = require("../config");
const xlsx = require("xlsx");
const jwt = require("jsonwebtoken");

const { getSelectedData, getData, country_check } = require("../models/common");

const { insertUpLeaseEmission, insertdownLeaseEmission } = require("../models/upLease");


const {
  fetchVehicleId,
  fetchVehicleEmission,
} = require("../models/downstream_trans");

const { checkNUllUnD } = require("../services/helper")

exports.upLeaseEmissionCalculate = async (req, res) => {
  try {
    const {
      months,
      year,
      facility_type,
      category,
      sub_category,
      calculation_method,
      franchise_space,
      scope1_emission,
      scope2_emission,
      vehicle_type,
      vehicle_subtype,
      no_of_vehicles,
      distance_travelled,
      is_facility,
      is_vehicle,
      unit,
      facility_id, distance_unit
    } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        is_facility: [Joi.number().required().empty()],
        // months: Joi.array().items(Joi.string().required()).required(),
        months: [Joi.string().required().empty()],
        year: [Joi.string().required().empty()],
        facility_type: [Joi.string().optional().empty()],
        category: [Joi.string().optional().empty()],
        sub_category: [Joi.string().optional().empty()],
        calculation_method: [Joi.string().optional().empty()],
        franchise_space: [Joi.number().optional().empty()],
        scope1_emission: [Joi.number().optional().empty()],
        scope2_emission: [Joi.number().optional().empty()],
        vehicle_type: [Joi.string().optional().empty()],
        vehicle_subtype: [Joi.string().optional().empty()],
        no_of_vehicles: [Joi.number().optional().empty()],
        distance_travelled: [Joi.number().optional().empty()],
        is_vehicle: [Joi.number().required().empty()],
        unit: [Joi.string().optional().empty()],
        facility_id: [Joi.number().required().empty()],
        distance_unit: [Joi.string().optional().empty()],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 200,
        success: false,
      });
    }
    const user_id = req.user.user_id;
    let resultInserted = [];
    let upLeaseData = {};
    let vehicleData = {}
    var monthsArr = JSON.parse(months);


    let distancekm = 0;
    let areaoccp = 0;
    if (is_vehicle == 1) {
      if (distance_unit == 'miles' && distance_travelled) {
        distancekm = parseFloat(distance_travelled * 1.60934)
      } else {
        distancekm = distance_travelled
      }

      if (unit == 'm2' && franchise_space) {
        areaoccp = parseFloat(franchise_space * 10.7639)
      } else {
        areaoccp = franchise_space
      }
    } else {
      areaoccp = franchise_space
    }

    let countrydata = await country_check(facility_id);

    if (countrydata.length == 0) {
      return res.json({
        success: false,
        message: "No country found for this EF",
        status: 400,
      });
    }

    if (Number(is_facility)) {
      upLeaseData = {
        user_id: user_id,
        facility_type: facility_type,
        category: category,
        sub_category: sub_category,
        calculation_method: calculation_method,
        franchise_space: franchise_space ? franchise_space : "",
        scope1_emission: scope1_emission ? scope1_emission : "",
        scope2_emission: scope2_emission ? scope2_emission : "",
        emission: 0,
        month: "",
        year: year,
        unit: unit ? unit : "",
        facility_id: facility_id ? facility_id : "",
        distance_travelled: distance_travelled,
        distance_unit: distance_unit ? distance_unit : "",
        vehicle_type: vehicle_type ? vehicle_type : "",
        vehicle_subtype: vehicle_subtype ? vehicle_subtype : "",
        vehicle_emission: 0,
        no_of_vehicles: no_of_vehicles ? no_of_vehicles : 0,
      };
      if (calculation_method === "Average data method") {
        let where = `where categories = '${category}' and sub_categories = '${sub_category}' and country_id = '${countrydata[0].CountryId}' and Right(Fiscal_Year,4) = '${year}'`;
        const emissionDetails = await getSelectedData("franchise_categories_subcategories", where, "*");
        if (emissionDetails.length > 0) {
          let yearRange = emissionDetails[0]?.Fiscal_Year;
          let [startYear, endYear] = yearRange.split('-').map(Number);

          if (year >= startYear && year <= endYear) {
            const ef = emissionDetails[0].ef;
            let totalEmission = ef * areaoccp;
            upLeaseData.emission_factor_lease = ef;
            upLeaseData.emission_factor_lease_unit = 'kg co2e/m2.month';
            upLeaseData.emission = totalEmission;
          } else if (year == startYear) {
            const ef = emissionDetails[0].ef;
            let totalEmission = ef * areaoccp;
            upLeaseData.emission_factor_lease = ef;
            upLeaseData.emission_factor_lease_unit = 'kg co2e/m2.month';
            upLeaseData.emission = totalEmission;
          } else {
            return res.json({
              success: false,
              message: "EF not Found for this year",
              status: 400,
            });
          }

        } else {
          return res.json({
            status: false,
            message: "EF not Found",
            status: 400
          });
        }
      } else if (calculation_method === "Facility Specific method") {
        upLeaseData.emission = Number(scope1_emission) + Number(scope2_emission);
      } else {
        return res.json({
          status: false,
          msg: "Please select a valid calculation method",
          error: "Incorrect parameter passed",
          status: 500,
        });
      }
    }

    if (Number(is_vehicle)) {
      upLeaseData = {
        user_id: user_id,
        facility_type: "",
        category: category ? category : "",
        sub_category: sub_category ? sub_category : "",
        calculation_method: calculation_method ? calculation_method : "",
        franchise_space: franchise_space ? franchise_space : "",
        scope1_emission: scope1_emission ? scope1_emission : "",
        scope2_emission: scope2_emission ? scope2_emission : "",
        emission: upLeaseData.emission ? upLeaseData.emission : 0,
        emission_factor_lease: upLeaseData.emission_factor_lease ? upLeaseData.emission_factor_lease : 0.000,
        emission_factor_lease_unit: upLeaseData.emission_factor_lease_unit ? upLeaseData.emission_factor_lease_unit : null,
        month: "",
        year: year,
        unit: unit,
        facility_id: facility_id ? facility_id : "",
        distance_travelled: distance_travelled,
        distance_unit: distance_unit ? distance_unit : "",
        vehicle_type: vehicle_type ? vehicle_type : "",
        vehicle_subtype: vehicle_subtype ? vehicle_subtype : "",
        vehicle_emission: 0,
        no_of_vehicles: no_of_vehicles ? no_of_vehicles : 0,
      };
      const vehicleIdRes = await fetchVehicleId(vehicle_type);
      let vehicleId = vehicleIdRes[0].id;
      const efRes = await fetchVehicleEmission(vehicleId, vehicle_subtype, countrydata[0].CountryId, year);
      if (efRes.length == 0) {
        return res.json({
          success: false,
          message: "Ef not found",
          status: 400,
        });
      } else {

        let yearRange = efRes[0]?.Fiscal_Year;
        let [startYear, endYear] = yearRange.split('-').map(Number);

        if (year >= startYear && year <= endYear) {
          const ef = efRes[0]?.emission_factor;
          upLeaseData.emission_factor_vehichle = ef;
          upLeaseData.emission_factor_vehicle_unit = 'kg co2e/km';
          let noOfVehicles = checkNUllUnD(no_of_vehicles);
          let distanceTravelled = checkNUllUnD(distancekm);
          const emission = Number(noOfVehicles * ef * distanceTravelled);
          upLeaseData.vehicle_emission = emission;
        } else if (year == startYear) {
          const ef = efRes[0]?.emission_factor;
          upLeaseData.emission_factor_vehichle = ef;
          upLeaseData.emission_factor_vehicle_unit = 'kg co2e/km';
          let noOfVehicles = checkNUllUnD(no_of_vehicles);
          let distanceTravelled = checkNUllUnD(distancekm);
          const emission = Number(noOfVehicles * ef * distanceTravelled);
          upLeaseData.vehicle_emission = emission;
        } else {
          return res.json({
            success: false,
            message: "EF not Found for this year",
            status: 400,
          });
        }
      }

      // for (let month of monthsArr) {
      //   vehicleData.month = month;
      //   var tempInserted = await insertUpLeaseEmission(vehicleData);
      //   resultInserted.push(tempInserted.insertId);
      // }
    }
   
    if (upLeaseData) {
      for (let month of monthsArr) {
        upLeaseData.month = month;
        var tempInserted = await insertUpLeaseEmission(upLeaseData);
        resultInserted.push(tempInserted.insertId);
      }

    }

    if (resultInserted.length > 0) {
      return res.json({
        success: true,
        message: "Emissions Updated Succesfully",
        status: 200,
        upLeaseData: upLeaseData,
        vehicleData: vehicleData,
        insertIds: resultInserted,
      });
    } else {
      return res.json({
        success: false,
        message: "Some Problem in Inserting the emission data by user",
        error: "Error Occured",
        status: 500,
      });
    }
  } catch (err) {
    console.log(err);
    return res.json({
      success: false,
      message: "Internal server error",
      error: err,
      status: 500,
    });
  }
};

exports.getUpstreamLeaseEmission = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    let where = `where user_id = '${user_id}'`;
    const upLeaseEmissionDetails = await getData(
      "upstreamLease_emission",
      where
    );
    if (upLeaseEmissionDetails.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched the Franchise Emissions",
        categories: upLeaseEmissionDetails,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Node data found for this user's Franchise Emissions",
        status: 500,
      });
    }
  } catch (err) {
    console.log(err);
    return res.json({
      success: false,
      message: "Internal server error",
      error: err,
      status: 500,
    });
  }
};

exports.downLeaseEmissionCalculate = async (req, res) => {
  try {
    const {
      months,
      year,
      facility_type,
      category,
      sub_category,
      calculation_method,
      franchise_space,
      scope1_emission,
      scope2_emission,
      vehicle_type,
      vehicle_subtype,
      no_of_vehicles,
      distance_travelled,
      is_facility,
      is_vehicle,
      unit,
      facility_id, distance_unit
    } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        is_facility: [Joi.number().required().empty()],
        months: [Joi.string().required().empty()],
        year: [Joi.string().required().empty()],
        facility_type: [Joi.string().optional().empty()],
        category: [Joi.string().optional().empty()],
        sub_category: [Joi.string().optional().empty()],
        calculation_method: [Joi.string().optional().empty()],
        franchise_space: [Joi.number().optional().empty()],
        scope1_emission: [Joi.number().optional().empty()],
        scope2_emission: [Joi.number().optional().empty()],
        vehicle_type: [Joi.string().optional().empty()],
        vehicle_subtype: [Joi.string().optional().empty()],
        no_of_vehicles: [Joi.number().optional().empty()],
        distance_travelled: [Joi.number().optional().empty()],
        is_vehicle: [Joi.number().required().empty()],
        unit: [Joi.string().optional().empty()],
        facility_id: [Joi.number().required().empty()],
        distance_unit: [Joi.string().optional().empty()],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 200,
        success: false,
      });
    }
    const user_id = req.user.user_id;
    let resultInserted = [];
    let downLeaseData = {};
    let vehicleData = {}
    var monthsArr = JSON.parse(months);

    let distancekm = 0;
    let areaoccp = 0;
    if (is_vehicle == 1) {
      if (distance_unit == 'miles' && distance_travelled) {
        distancekm = parseFloat(distance_travelled * 1.60934)
      } else {
        distancekm = distance_travelled
      }

      if (unit == 'm2' && franchise_space) {
        areaoccp = parseFloat(franchise_space * 10.7639)
      } else {
        areaoccp = franchise_space
      }
    } else {
      areaoccp = franchise_space
    }

    let countrydata = await country_check(facility_id);
    if (countrydata.length == 0) {
      return res.json({
        success: false,
        message: "EF not Found for this country",
        status: 400,
      });
    }

    //Check Facility Data 
    if (Number(is_facility)) {
      downLeaseData = {
        user_id: user_id,
        facility_type: facility_type,
        category: category,
        sub_category: sub_category,
        calculation_method: calculation_method,
        franchise_space: franchise_space ? franchise_space : "",
        scope1_emission: scope1_emission ? scope1_emission : "",
        scope2_emission: scope2_emission ? scope2_emission : "",
        emission: 0,
        month: "",
        year: year,
        unit: unit,
        facility_id: facility_id ? facility_id : "",
        distance_travelled: distance_travelled ? distance_travelled : "",
        distance_unit: distance_unit ? distance_unit : "",
        vehicle_type: vehicle_type ? vehicle_type : "",
        vehicle_subtype: vehicle_subtype ? vehicle_subtype : "",
        vehicle_emission: 0,
        no_of_vehicles: no_of_vehicles ? no_of_vehicles : 0,
      };
      if (calculation_method === "Average data method") {
        let where = `where categories = '${category}' and sub_categories = '${sub_category}' and country_id = '${countrydata[0].CountryId}' ORDER BY id DESC`;
        const emissionDetails = await getSelectedData(
          "franchise_categories_subcategories",
          where,
          "*"
        );
        if (emissionDetails.length > 0) {

          let yearRange = emissionDetails[0]?.Fiscal_Year; // The string representing the year range
          let [startYear, endYear] = yearRange.split('-').map(Number);

          if (year >= startYear && year <= endYear) {
            const ef = emissionDetails[0].ef;
            let totalEmission = ef * areaoccp;
            downLeaseData.emission_factor_lease = ef;
            downLeaseData.emission_factor_lease_unit = 'kg co2e/m2.month';
            downLeaseData.emission = totalEmission;
          } else if (year == startYear) {
            const ef = emissionDetails[0].ef;
            let totalEmission = ef * areaoccp;
            downLeaseData.emission_factor_lease = ef;
            downLeaseData.emission_factor_lease_unit = 'kg co2e/m2.month';
            downLeaseData.emission = totalEmission;
          } else {
            return res.json({
              success: false,
              message: "EF not Found for this year",
              status: 400,
            });
          }

        } else {
          return res.json({
            status: true,
            msg: "Some problem occured while selecting categories and sub-ctegories , Please check the input params",
            error: "Parameters Incorrect",
            status: 500,
          });
        }
      } else if (calculation_method === "Facility Specific method") {
        downLeaseData.emission =
          Number(scope1_emission) + Number(scope2_emission);
      } else {
        return res.json({
          status: false,
          msg: "Please select a valid calculation method",
          error: "Incorrect parameter passed",
          status: 500,
        });
      }

      // for (let month of monthsArr) {
      //   downLeaseData.month = month;
      //   var tempInserted = await insertdownLeaseEmission(downLeaseData);
      //   resultInserted.push(tempInserted.insertId);
      // }
    }
    //Check Vehicle Data as well 
    if (Number(is_vehicle)) {
      downLeaseData = {
        user_id: user_id,
        facility_type: facility_type,
        category: category,
        sub_category: sub_category,
        calculation_method: calculation_method,
        franchise_space: franchise_space ? franchise_space : "",
        scope1_emission: scope1_emission ? scope1_emission : "",
        scope2_emission: scope2_emission ? scope2_emission : "",
        emission: downLeaseData.emission ? downLeaseData.emission : 0,
        emission_factor_lease: downLeaseData.emission_factor_lease ? downLeaseData.emission_factor_lease : 0.000,
        emission_factor_lease_unit: downLeaseData.emission_factor_lease_unit ? downLeaseData.emission_factor_lease_unit : null,
        month: "",
        year: year,
        unit: unit,
        facility_id: facility_id ? facility_id : "",
        distance_travelled: distance_travelled ? distance_travelled : "",
        distance_unit: distance_unit ? distance_unit : "",
        vehicle_type: vehicle_type ? vehicle_type : "",
        vehicle_subtype: vehicle_subtype ? vehicle_subtype : "",
        vehicle_emission: 0,
        no_of_vehicles: no_of_vehicles ? no_of_vehicles : 0,

      };
      const vehicleIdRes = await fetchVehicleId(vehicle_type);
      let vehicleId = vehicleIdRes[0].id;
      const efRes = await fetchVehicleEmission(vehicleId, vehicle_subtype, countrydata[0].CountryId);

      if (efRes.length == 0) {
        return res.json({
          success: false,
          message: "No country found for this EF",
          status: 400,
        });
      } else {
        let yearRange = efRes[0]?.Fiscal_Year; // The string representing the year range
        let [startYear, endYear] = yearRange.split('-').map(Number);

        if (year >= startYear && year <= endYear) {
          const ef = efRes[0]?.emission_factor;
          let noOfVehicles = checkNUllUnD(no_of_vehicles);
          let distanceTravelled = checkNUllUnD(distancekm);
          downLeaseData.emission_factor_vehichle = ef;
          downLeaseData.emission_factor_vehicle_unit = 'kg co2e/km';
          const emission = Number(noOfVehicles * ef * distanceTravelled);
          downLeaseData.vehicle_emission = emission;
        } else if (year == startYear) {
          const ef = efRes[0]?.emission_factor;
          let noOfVehicles = checkNUllUnD(no_of_vehicles);
          let distanceTravelled = checkNUllUnD(distancekm);
          downLeaseData.emission_factor_vehichle = ef;
          downLeaseData.emission_factor_vehicle_unit = 'kg co2e/km';
          const emission = Number(noOfVehicles * ef * distanceTravelled);
          downLeaseData.vehicle_emission = emission;
        } else {
          return res.json({
            success: false,
            message: "EF not Found for this year",
            status: 400,
          });
        }
      }
    }

    if (downLeaseData) {
      for (let month of monthsArr) {
        downLeaseData.month = month;
        var tempInserted = await insertdownLeaseEmission(downLeaseData);
        resultInserted.push(tempInserted.insertId);
      }
    }

    if (resultInserted.length > 0) {
      return res.json({
        success: true,
        message: "Emissions Updated Succesfully",
        status: 200,
        downLeaseData: downLeaseData,
        vehicleData: vehicleData,
        insertIds: resultInserted,
      });
    } else {
      return res.json({
        success: false,
        message: "Some Problem in Inserting the emission data by user",
        error: "Error Occured",
        status: 500,
      });
    }
  } catch (err) {
    console.log(err);
    return res.json({
      success: false,
      message: "Internal server error",
      error: err,
      status: 500,
    });
  }
};

exports.getDownstreamLeaseEmission = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    let where = `where user_id = '${user_id}'`;
    const upLeaseEmissionDetails = await getData(
      "downstreamLease_emission",
      where
    );
    if (upLeaseEmissionDetails.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched the Franchise Emissions",
        categories: upLeaseEmissionDetails,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Node data found for this user's Franchise Emissions",
        status: 500,
      });
    }
  } catch (err) {
    console.log(err);
    return res.json({
      success: false,
      message: "Internal server error",
      error: err,
      status: 500,
    });
  }
};
