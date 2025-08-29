const Joi = require("joi");
const path = require("path");
const moment = require("moment");
const fs = require("fs");
const axios = require("axios");
const config = require("../config");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
var GeoPoint = require("geopoint");


const {
  getFlightParams, getLatLongByCode, Othermodes_of_transport, hotelStay, getOffsetByCountry,
  flight_travel, getemssiomFactor, insertbusinessunitsetting, insertemployee_commuting_category,
  homeoffice_emission_factors, homeoffice_emission_category,
  soldproductsemission_factors, insertsoldproductsemission,
  insertendof_lifetreatment_category, endof_lifeSubCatmission_factors, endoflife_waste_type,
  water_supply_treatment_type, insertwater_supply_treatment_category, insert_water_withdrawl_by_source, updateWater_ef,
  insert_water_discharge_by_destination, insert_water_discharge_by_destination_only, insertprocessing_of_sold_productsCategory, insertprocessing_of_sold_products_ef

} = require("../models/businesstravel");


const { Addassignedmanagedatapoint } = require("../models/scope1")

const {
  insertData,
  updateData,
  getData,
  deleteData,
  fetchCount,
  getSelectedColumn,
  getSelectedData, country_check
} = require("../models/common");
const { error } = require("console");

const baseurl = config.base_url;
const Fcm_serverKey = config.fcm_serverKey;

exports.AllvehicleType = async (req, res) => {
  try {

    let where = ``;
    const vehicletype = await getSelectedColumn("vehicletypes", where, "*");
    if (vehicletype.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched vehicle types",
        batchIds: vehicletype,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Some problem occured while selecting vehicle types",
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

exports.subvehicleType = async (req, res) => {
  try {
    const { vehicletypes_id } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        vehicletypes_id: [Joi.number().empty().required()],
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
    } else {
      let where = ` where vehicletypes_id = '${vehicletypes_id}'`;
      const subvehicletype = await getSelectedColumn("`dbo.deliveryvehicletypes`", where, "*");
      if (subvehicletype.length > 0) {
        return res.json({
          success: true,
          message: "Succesfully Fetch Sub vehicletype",
          vehicletype: subvehicletype,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while selecting Sub vehicletype",
          status: 500,
        });
      }
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

exports.OtherModesOfTransportTypeName = async (req, res) => {
  const { facility_id } = req.body;

  try {
    const schema = Joi.object({
      facility_id: Joi.string().required()
    });

    const result = schema.validate(req.body);

    if (result.error) {
      const message = result.error.details.map(i => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    }
    let countrydata = await country_check(facility_id);
    const findTypeNameResponse = await getSelectedColumn("other_modes_of_transport_ef", 'WHERE country_id = "' + countrydata[0].CountryId + '" GROUP BY type_name', "id, type_name AS modes, country_id");
    if (findTypeNameResponse.length > 0) {
      return res.status(200).json({ error: false, message: "Data fetched successfully", success: true, data: findTypeNameResponse });
    } else {
      return res.status(404).json({ error: true, message: "No records found", success: false });
    }
  } catch (error) {
    return res.status(500).json({ error: true, message: "Intenal Server Error " + error.message, success: false });
  }
};

exports.OtherModesOfTransportNodeTypeByTypeName = async (req, res) => {
  const { type_name, facility_id } = req.body;
  try {
    const schema = Joi.object({
      type_name: Joi.string().required(),
      facility_id: Joi.number().required()
    });

    const result = schema.validate(req.body);

    if (result.error) {
      const message = result.error.details.map(i => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    }

    let countrydata = await country_check(facility_id);
    const findTypeNameResponse = await getSelectedColumn("other_modes_of_transport_ef", 'WHERE type_name = "' + type_name + '" AND country_id = "' + countrydata[0].CountryId + '"', "id, mode_type, type_name, country_id");
    if (findTypeNameResponse.length > 0) {
      return res.status(200).json({ error: false, message: "Data fetched successfully", success: true, data: findTypeNameResponse });
    } else {
      return res.status(404).json({ error: true, message: "No records found", success: false });
    }
  } catch (error) {
    return res.status(500).json({ error: true, message: "Intenal Server Error " + error.message, success: false });
  }
};

exports.flightTravel = async (req, res) => {
  const { flight_calc_mode, jsonData, year, facilities } = req.body;

  try {
    const schema = Joi.object({
      flight_calc_mode: Joi.string().required(),
      jsonData: Joi.string().required(),
      year: Joi.number().required(),
      facilities: Joi.number().required(),
      file: [Joi.string().optional()]
    });

    const result = schema.validate(req.body);

    if (result.error) {
      const message = result.error.details.map(i => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    }

    let parsedData;
    try {
      parsedData = JSON.parse(jsonData);
    } catch (e) {
      return res.json({
        success: false,
        message: "Invalid JSON in 'jsonData'",
        status: 400,
      });
    }

    const user_id = req.user.user_id;
    const allinsertedID = [];
    let distanceResult = 0;

    for (const val of parsedData) {
      try {
        const { from, to, flight_type, flight_class, no_of_trips, return_flight, cost_centre, via, no_of_passengers, reference_id, batch, month } = val;

        if (from && to) {
          const fromPointData = await getLatLongByCode(from);
          const viaPointData = via ? await getLatLongByCode(via) : null;
          const toPointData = await getLatLongByCode(to);

          if (fromPointData.length <= 0 || (via && (!viaPointData || viaPointData.length <= 0)) || toPointData.length <= 0) {
            return res.json({
              success: false,
              message: "Please check the IATA codes of the airports",
              status: 400,
            });
          }

          const fromPoint = new GeoPoint(
            Number(fromPointData[0].latitude),
            Number(fromPointData[0].longitude)
          );

          const toPoint = new GeoPoint(
            Number(toPointData[0].latitude),
            Number(toPointData[0].longitude)
          );

          if (via) {
            const viaPoint = new GeoPoint(
              Number(viaPointData[0].latitude),
              Number(viaPointData[0].longitude)
            );
            const distance1 = fromPoint.distanceTo(viaPoint, true);
            const distance2 = viaPoint.distanceTo(toPoint, true);
            distanceResult = distance1 + distance2;

            const getEmissionFactor = async (distance) => {
              let minDistance = 0;
              let maxDistance = Infinity;

              const flightTypes = await getSelectedColumn("flight_types", 'ORDER BY avg_distance ASC', '*');

              flightTypes.sort((a, b) => Number(a.avg_distance) - Number(b.avg_distance));

              for (let i = 0; i < flightTypes.length; i++) {
                const current = Number(flightTypes[i].avg_distance);

                if (distance <= current) {
                  maxDistance = current;
                  minDistance = i === 0 ? 0 : Number(flightTypes[i - 1].avg_distance) + 1;
                  break;
                }

                if (i === flightTypes.length - 1) {
                  minDistance = current;
                  maxDistance = Infinity;
                }
              }

              let where = `LEFT JOIN flight_travel_ef ON flight_travel_ef.flight_type_id = flight_types.id`;
              if (maxDistance === Infinity) {
                where += ` WHERE flight_types.avg_distance >= ${minDistance} AND flight_travel_ef.Fiscal_Year LIKE '%${year}'`;
              } else {
                where += ` WHERE flight_types.avg_distance BETWEEN ${minDistance} AND ${maxDistance} AND flight_travel_ef.Fiscal_Year LIKE '%${year}'`;
              }

              const flight_type_ef = await getSelectedColumn("flight_types", where, `flight_types.id, flight_types.flight_type, flight_travel_ef.*`);

              if (!flight_type_ef.length) {
                throw new Error("EF not found for this facility or year");
              }

              return flight_type_ef;
            };

            // try {
            //   const ef_factor1 = distance1 ? await getEmissionFactor(distance1) : 0;
            //   const ef_factor2 = distance2 ? await getEmissionFactor(distance2) : 0;

            //   const flight_class1 = flight_class === 'Economy' ? parseFloat(ef_factor1[0].economy) : flight_class === 'Business' ? parseFloat(ef_factor1[0].business) : parseFloat(ef_factor1[0].first_class);
            //   const flight_class2 = flight_class === 'Economy' ? parseFloat(ef_factor2[0].economy) : flight_class === 'Business' ? parseFloat(ef_factor2[0].business) : parseFloat(ef_factor2[0].first_class);

            //   let maxEF = flight_class1;
            //   let selectedFlightType = ef_factor1[0].flight_type;

            //   if (flight_class2 > flight_class1) {
            //     maxEF = flight_class2;
            //     selectedFlightType = ef_factor2[0].flight_type;
            //   }

            //   const flighttravel = {
            //     flight_calc_mode,
            //     flight_type: selectedFlightType,
            //     flight_class,
            //     return_flight: return_flight || "",
            //     no_of_trips: no_of_trips || 0,
            //     cost_centre: cost_centre || "",
            //     from: from || "",
            //     to: to || "",
            //     via: via || '',
            //     no_of_passengers: no_of_passengers || 0,
            //     reference_id: reference_id || 0,
            //     distance: return_flight == 'Yes' ? distanceResult * 2 : distanceResult || 0,
            //     emission: return_flight == 'Yes' ? Number((maxEF * no_of_passengers * distanceResult).toFixed(4)) * 2 : Number((maxEF * no_of_passengers * distanceResult).toFixed(4)),
            //     emission_factor: maxEF,
            //     FileName: req.file != undefined ? req.file.filename : null,
            //     user_id,
            //     batch,
            //     month,
            //     year,
            //     facilities
            //   };
            //   const flight = await flight_travel(flighttravel);
            //   allinsertedID.push(flight.insertId);
            // } catch (error) {
            //   return res.status(404).json({ error: true, success: false, message: error.message });
            // }

            try {
              const ef_factor1 = distance1 ? await getEmissionFactor(distance1) : [];
              const ef_factor2 = distance2 ? await getEmissionFactor(distance2) : [];

              const getEmissionFactorForYear = (ef) => {
                if (!ef[0] || !ef[0].Fiscal_Year) return null;
                const [startYear, endYear] = ef[0].Fiscal_Year.split('-').map(Number);
                if (year >= startYear && year <= endYear) {
                  return {
                    emission_factor: flight_class === 'Economy'
                      ? parseFloat(ef[0].economy)
                      : flight_class === 'Business'
                        ? parseFloat(ef[0].business)
                        : parseFloat(ef[0].first_class),
                    flight_type: ef[0].flight_type,
                    fiscal_year: ef[0].Fiscal_Year
                  };
                }
                return null;
              };

              const emissionFactor1 = getEmissionFactorForYear(ef_factor1);
              const emissionFactor2 = getEmissionFactorForYear(ef_factor2);

              let selectedEmission = emissionFactor1;
              if (emissionFactor2 && (!emissionFactor1 || emissionFactor2.emission_factor > emissionFactor1.emission_factor)) {
                selectedEmission = emissionFactor2;
              }

              const maxEF = selectedEmission ? selectedEmission.emission_factor : 0;
              const selectedFlightType = selectedEmission ? selectedEmission.flight_type : '';

              const totalDistance = return_flight === 'Yes' ? (distanceResult || 0) * 2 : (distanceResult || 0);
              const emission = Number((maxEF * (no_of_passengers || 0) * totalDistance).toFixed(4));

              const flighttravel = {
                flight_calc_mode,
                flight_type: selectedFlightType,
                flight_class,
                return_flight: return_flight || '',
                no_of_trips: no_of_trips || 0,
                cost_centre: cost_centre || '',
                from: from || '',
                to: to || '',
                via: via || '',
                no_of_passengers: no_of_passengers || 0,
                reference_id: reference_id || 0,
                distance: totalDistance,
                emission,
                emission_factor: maxEF,
                FileName: req.file ? req.file.filename : null,
                user_id,
                batch,
                month,
                year,
                facilities
              };

              const flight = await flight_travel(flighttravel);
              allinsertedID.push(flight.insertId);

            } catch (error) {
              return res.status(500).json({ error: true, success: false, message: error.message });
            }

          } else {
            distanceResult = fromPoint.distanceTo(toPoint, true);

            let minDistance = 0;
            let maxDistance = Infinity;

            const flightTypes = await getSelectedColumn("flight_types", 'ORDER BY avg_distance ASC', '*');

            flightTypes.sort((a, b) => Number(a.avg_distance) - Number(b.avg_distance));

            for (let i = 0; i < flightTypes.length; i++) {
              const current = Number(flightTypes[i].avg_distance);

              if (distanceResult <= current) {
                maxDistance = current;
                minDistance = i === 0 ? 0 : Number(flightTypes[i - 1].avg_distance) + 1;
                break;
              }

              if (i === flightTypes.length - 1) {
                minDistance = current;
                maxDistance = Infinity;
              }
            }

            let where = `LEFT JOIN flight_travel_ef ON flight_travel_ef.flight_type_id = flight_types.id`;

            if (maxDistance === Infinity) {
              where += ` WHERE flight_types.avg_distance >= ${minDistance} AND flight_travel_ef.Fiscal_Year LIKE '%${year}'`;
            } else {
              where += ` WHERE flight_types.avg_distance >= ${minDistance} AND flight_types.avg_distance <= ${maxDistance} AND flight_travel_ef.Fiscal_Year LIKE '%${year}'`;
            }

            const flight_type_ef = await getSelectedColumn("flight_types", where, `flight_types.id, flight_types.flight_type, flight_travel_ef.*`);

            if (flight_type_ef.length <= 0) return res.status(404).json({ error: true, success: false, message: "EF not found for this facility or year" })

            let yearRange = flight_type_ef[0]?.Fiscal_Year;
            let [startYear, endYear] = yearRange.split('-').map(Number);
            if (year >= startYear && year <= endYear) {
              const ef_factor = flight_class == 'Economy' ? flight_type_ef[0].economy : flight_class == 'Business' ? flight_type_ef[0].business : flight_type_ef[0].first_class;

              const flighttravel = {
                flight_calc_mode,
                flight_type: flight_type_ef[0].flight_type,
                flight_class,
                return_flight: return_flight || "",
                no_of_trips: no_of_trips || 0,
                cost_centre: cost_centre || "",
                from: from || "",
                to: to || "",
                via: via || '',
                no_of_passengers: no_of_passengers || 0,
                reference_id: reference_id || 0,
                distance: return_flight == 'Yes' ? distanceResult * 2 : distanceResult || 0,
                emission: return_flight == 'Yes' ? Number((ef_factor * no_of_passengers * distanceResult).toFixed(4)) * 2 : Number((ef_factor * no_of_passengers * distanceResult).toFixed(4)),
                emission_factor: ef_factor,
                FileName: req.file != undefined ? req.file.filename : null,
                user_id,
                batch,
                month,
                year,
                facilities
              };
              const flight = await flight_travel(flighttravel);
              allinsertedID.push(flight.insertId);
            } else if (year == startYear) {
              const ef_factor = flight_class == 'Economy' ? flight_type_ef[0].economy : flight_class == 'Business' ? flight_type_ef[0].business : flight_type_ef[0].first_class;

              const flighttravel = {
                flight_calc_mode,
                flight_type: flight_type_ef[0].flight_type,
                flight_class,
                return_flight: return_flight || "",
                no_of_trips: no_of_trips || 0,
                cost_centre: cost_centre || "",
                from: from || "",
                to: to || "",
                via: via || '',
                no_of_passengers: no_of_passengers || 0,
                reference_id: reference_id || 0,
                distance: return_flight == 'Yes' ? distanceResult * 2 : distanceResult || 0,
                emission: return_flight == 'Yes' ? Number((ef_factor * no_of_passengers * distanceResult).toFixed(4)) * 2 : Number((ef_factor * no_of_passengers * distanceResult).toFixed(4)),
                emission_factor: ef_factor,
                FileName: req.file != undefined ? req.file.filename : null,
                user_id,
                batch,
                month,
                year,
                facilities
              };
              const flight = await flight_travel(flighttravel);
              allinsertedID.push(flight.insertId);
            }
          }
        } else {
          let where = `LEFT JOIN flight_travel_ef ON flight_travel_ef.flight_type_id = flight_types.id WHERE flight_types.flight_type = '${flight_type}' AND flight_travel_ef.Fiscal_Year LIKE '%${year}'`;

          const flight_type_ef = await getSelectedColumn("flight_types", where, `flight_types.id, flight_types.flight_type, flight_types.avg_distance, flight_travel_ef.*`);

          if (flight_type_ef.length <= 0) return res.status(404).json({ error: true, success: false, message: "EF not found for this facility or year" })

          let yearRange = flight_type_ef[0]?.Fiscal_Year;
          let [startYear, endYear] = yearRange.split('-').map(Number);
          if (year >= startYear && year <= endYear) {
            const ef_factor = flight_class == 'Economy' ? flight_type_ef[0].economy : flight_class == 'Business' ? flight_type_ef[0].business : flight_type_ef[0].first_class;

            distanceResult = flight_type_ef[0].avg_distance;

            if (return_flight === true || return_flight == 'true' || return_flight == 'Yes') distanceResult *= 2;
            if (isNaN(distanceResult)) distanceResult = 0;

            const flighttravel = {
              flight_calc_mode,
              flight_type: flight_type,
              flight_class,
              return_flight: return_flight || "",
              no_of_trips: no_of_trips || 0,
              cost_centre: cost_centre || "",
              from: from || "",
              to: to || "",
              via: via || '',
              no_of_passengers: no_of_passengers || 0,
              reference_id: reference_id || 0,
              distance: distanceResult || 0,
              emission: Number((ef_factor * no_of_trips * distanceResult).toFixed(4)),
              emission_factor: ef_factor,
              FileName: req.file != undefined ? req.file.filename : null,
              user_id,
              batch,
              month,
              year,
              facilities
            };
            const flight = await flight_travel(flighttravel);
            allinsertedID.push(flight.insertId);
          } else if (year == startYear) {
            const ef_factor = flight_class == 'Economy' ? flight_type_ef[0].economy : flight_class == 'Business' ? flight_type_ef[0].business : flight_type_ef[0].first_class;

            distanceResult = flight_type_ef[0].avg_distance;

            if (return_flight === true || return_flight == 'true' || return_flight == 'Yes') distanceResult *= 2;
            if (isNaN(distanceResult)) distanceResult = 0;

            const flighttravel = {
              flight_calc_mode,
              flight_type: flight_type,
              flight_class,
              return_flight: return_flight || "",
              no_of_trips: no_of_trips || 0,
              cost_centre: cost_centre || "",
              from: from || "",
              to: to || "",
              via: via || '',
              no_of_passengers: no_of_passengers || 0,
              reference_id: reference_id || 0,
              distance: distanceResult || 0,
              emission: Number((ef_factor * no_of_trips * distanceResult).toFixed(4)),
              emission_factor: ef_factor,
              FileName: req.file != undefined ? req.file.filename : null,
              user_id,
              batch,
              month,
              year,
              facilities
            };
            const flight = await flight_travel(flighttravel);
            allinsertedID.push(flight.insertId);
          }
        }
      } catch (flightError) {
        console.error("Error processing a flight record:", flightError);
      }
    }

    return res.json({
      success: allinsertedID.length > 0,
      message: allinsertedID.length > 0 ? "Data Entry Done Successfully" : "Data Entry Not Done Successfully",
    });

  } catch (error) {
    console.log(error);
    if (error.code === "23505") {
      return res.json({
        success: false,
        message: "Key (transaction_id) already exists.",
        status: 400,
      });
    } else {
      return res.json({
        success: false,
        message: "An internal server error occurred. Please try again later.",
        status: 500,
      });
    }
  }
};

exports.Othermodes_of_transport = async (req, res) => {
  try {
    const { year, facilities, jsonData } = req.body;
    const schema = Joi.object({
      year: Joi.number().required(),
      facilities: Joi.number().required(),
      jsonData: Joi.string().required(),
      file: Joi.string().optional()
    });

    const result = schema.validate(req.body);

    if (result.error) {
      const message = result.error.details.map(i => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      let parsedData;
      try {
        parsedData = JSON.parse(jsonData);
      } catch (e) {
        return res.json({
          success: false,
          message: "Invalid JSON in 'jsonData'",
          status: 400,
        });
      }

      var allinsertedID = [];
      const user_id = req.user.user_id;

      for (const val of parsedData) {
        try {
          const { mode_of_trasport, vehicle_type, fuel_type, type, distance_travelled, no_of_trips,
            no_of_passengers, batch, month } = val;
          let countrydata = await country_check(facilities);
          if (countrydata.length > 0) {
            var ef = '';
            var emission_factor_unit = '';

            let where = ` where mode_type = '${type}' and type_name = '${mode_of_trasport}' and country_id = '${countrydata[0].CountryId}'`;
            const efs = await getSelectedColumn("other_modes_of_transport_ef", where, "*");

            if (efs.length > 0) {
              let yearRange = efs[0]?.Fiscal_Year;
              let [startYear, endYear] = yearRange.split('-').map(Number);
              if (year >= startYear && year <= endYear) {
                if (mode_of_trasport == 'Car' || mode_of_trasport == 'Auto') {
                  ef = parseFloat(efs[0]?.ef * no_of_trips * distance_travelled);
                  emission_factor_unit = 'kg co2e/km';
                }
                if (mode_of_trasport == 'Rail' || mode_of_trasport == 'Ferry' || mode_of_trasport == 'Bus') {
                  ef = parseFloat(efs[0]?.ef * no_of_trips * distance_travelled * no_of_passengers);
                  emission_factor_unit = 'kg co2e/passengers.km';
                }
              } else if (year == startYear) {
                if (mode_of_trasport == 'Car' || mode_of_trasport == 'Auto') {
                  ef = parseFloat(efs[0]?.ef * no_of_trips * distance_travelled);
                  emission_factor_unit = 'kg co2e/km';
                }
                if (mode_of_trasport == 'Rail' || mode_of_trasport == 'Ferry' || mode_of_trasport == 'Bus') {
                  ef = parseFloat(efs[0]?.ef * no_of_trips * distance_travelled * no_of_passengers);
                  emission_factor_unit = 'kg co2e/passengers.km';
                }
              }
              let data_info = {
                mode_of_trasport: mode_of_trasport,
                vehicle_type: vehicle_type ? vehicle_type : null,
                fuel_type: fuel_type ? fuel_type : "",
                distance_travelled: distance_travelled,
                no_of_trips: no_of_trips,
                user_id: user_id,
                type: type ? type : "",
                no_of_passengers: no_of_passengers ? no_of_passengers : 0,
                emission: ef,
                emission_factor_unit: emission_factor_unit,
                FileName: req.file != undefined ? req.file.filename : null,
                batch: batch ? batch : 1,
                month: month,
                year: year,
                facilities: facilities
              }
              const create_data = await Othermodes_of_transport(data_info);
              allinsertedID.push(create_data.insertId);
            }
          }
        } catch (flightError) {
          console.error("Error processing a flight record:", flightError);
        }
      }
      if (allinsertedID.length > 0) {
        return res.json({
          success: true,
          message: "Successfully",
          emission: ef,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "No data Found!",
          status: 200,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
      status: 500,
      error: error,
    });
  }
};

exports.hotelStay = async (req, res) => {
  try {
    const { year, facilities, jsonData } = req.body;
    const schema = Joi.object({
      year: Joi.number().required(),
      facilities: Joi.number().required(),
      jsonData: Joi.string().required(),
      file: Joi.string().optional()
    });

    const result = schema.validate(req.body);

    if (result.error) {
      const message = result.error.details.map(i => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      let parsedData;
      try {
        parsedData = JSON.parse(jsonData);
      } catch (e) {
        return res.json({
          success: false,
          message: "Invalid JSON in 'jsonData'",
          status: 400,
        });
      }
      var finalco2 = 0;
      var allinsertedID = [];
      const user_id = req.user.user_id;
      for (const val of parsedData) {
        try {
          const { country_of_stay, type_of_hotel, no_of_occupied_rooms, no_of_nights_per_room, batch, month } = val;
          let countrydata = await country_check(facilities);
          if (countrydata.length > 0) {
            const hotelBooking = await getOffsetByCountry(country_of_stay);
            let rating_type = "none";

            if (hotelBooking.length > 0) {
              let yearRange = hotelBooking[0]?.Fiscal_Year;
              let [startYear, endYear] = yearRange.split('-').map(Number);
              if (year >= startYear && year <= endYear) {
                switch (type_of_hotel) {
                  case "star_2":
                    finalco2 = hotelBooking[0].star_2;
                    rating_type = "2 Star";
                    break;
                  case "star_3":
                    finalco2 = hotelBooking[0].star_3;
                    rating_type = "3 Star";
                    break;
                  case "star_4":
                    finalco2 = hotelBooking[0].star_4;
                    rating_type = "4 Star";
                    break;
                  case "star_5":
                    finalco2 = hotelBooking[0].star_5;
                    rating_type = "5 Star";
                    break;
                  case "star_green":
                    finalco2 = hotelBooking[0].star_green;
                    rating_type = "Green Star";
                    break;
                }
              } else if (year == startYear) {
                switch (type_of_hotel) {
                  case "star_2":
                    finalco2 = hotelBooking[0].star_2;
                    rating_type = "2 Star";
                    break;
                  case "star_3":
                    finalco2 = hotelBooking[0].star_3;
                    rating_type = "3 Star";
                    break;
                  case "star_4":
                    finalco2 = hotelBooking[0].star_4;
                    rating_type = "4 Star";
                    break;
                  case "star_5":
                    finalco2 = hotelBooking[0].star_5;
                    rating_type = "5 Star";
                    break;
                  case "star_green":
                    finalco2 = hotelBooking[0].star_green;
                    rating_type = "Green Star";
                    break;
                }
              }
              let data_info = {
                country_of_stay: country_of_stay,
                type_of_hotel: type_of_hotel,
                no_of_occupied_rooms: no_of_occupied_rooms,
                no_of_nights_per_room: no_of_nights_per_room,
                user_id: user_id,
                emission: (finalco2 * no_of_nights_per_room * no_of_occupied_rooms),
                emission_factor_unit: 'kg c02e/room.night',
                FileName: req.file != undefined ? req.file.filename : null,
                batch: batch,
                month: month,
                year: year,
                facilities: facilities
              }
              const create_data = await hotelStay(data_info);
              allinsertedID.push(create_data.insertId);
            }
          }
        } catch (flightError) {
          console.error("Error processing a flight record:", flightError);
        }
      }
      if (allinsertedID.length > 0) {
        return res.json({
          success: true,
          message: "Successfully",
          emission: finalco2,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Successfully",
          status: 400,
        });
      }

    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
      status: 500,
      error: error,
    });
  }
};

exports.flight_types = async (req, res) => {
  try {
    let where = ``;
    const vehicleIdRes = await getSelectedColumn("flight_types", where, "*");
    if (vehicleIdRes.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched flight_types",
        batchIds: vehicleIdRes,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Some problem occured while selecting flight_types",
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

exports.Addbusinessunit = async (req, res) => {
  try {
    const { units } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        units: [Joi.number().empty().required()],
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
    } else {
      const user_id = req.user.user_id;

      let businessData = {
        user_id: user_id,
        units: units
      }
      const businessunit = await insertbusinessunitsetting(businessData);
      if (businessunit.affectedRows > 0) {
        return res.json({
          success: true,
          message: "Succesfully Added Business Units ",
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while Adding Business Units",
          status: 500,
        });
      }
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

exports.getAllbussinessUnit = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    let where = ` where user_id =  '${user_id}'`;
    const vehicleIdRes = await getSelectedColumn("business_unit_setting", where, "*");
    if (vehicleIdRes.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched business unit",
        categories: vehicleIdRes,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Some problem occured while selecting business unit",
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

exports.deletebusinessunit = async (req, res) => {
  try {
    const { units } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        units: [Joi.number().empty().required()],
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
    } else {
      const authHeader = req.headers.auth;
      const jwtToken = authHeader.replace("Bearer ", "");
      const decoded = jwt.decode(jwtToken);
      const user_id = decoded.user_id;

      let businessData = {
        user_id: user_id,
        units: units
      }
      const businessunit = await insertbusinessunitsetting(businessData);
      if (businessunit.affectedRows > 0) {
        return res.json({
          success: true,
          message: "Succesfully Added Business Units ",
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while Adding Business Units",
          status: 500,
        });
      }
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

exports.AddemployeeCommuting = async (req, res) => {
  try {
    const { noofemployees, workingdays, typeoftransport, batch, facilities, year, month } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        noofemployees: [Joi.number().empty().required()],
        workingdays: [Joi.number().empty().required()],
        totalnoofcommutes: [Joi.optional().allow("")],
        typeoftransport: [Joi.optional().allow("")],
        batch: [Joi.number().empty().required()],
        facilities: [Joi.number().empty().required()],
        year: [Joi.string().empty().required()],
        month: [Joi.string().empty().required()],
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
    } else {
      const user_id = req.user.user_id;

      let array = [];


      let where = ` where facilities ='${facilities}' AND YEAR(created_at) = '${year}'  and status != 'R'`;
      const allemployeescommute = await getSelectedColumn("employee_commuting_category", where, "*");

      if (allemployeescommute.length > 0) {
        return res.json({
          success: false,
          message: "Data is already added to this facility in this year",
          status: 400,
        });
      }

      let countrydata = await country_check(facilities);
      //console.log(countrydata[0].CountryId);
      if (countrydata.length == 0) {
        return res.json({
          success: false,
          message: "EF not Found while Adding employeecommuting",
          status: 400,
        });
      }
      if (typeoftransport) {
        let json = JSON.parse(typeoftransport);
        await Promise.all(
          json.map(async (item) => {
            let where = "";
            if (item.subtype) {
              where = ` where  id ='${item.subtype}' and country_id = '${countrydata[0].CountryId}'`;
            } else {
              where = ` where  id ='${item.type}' and country_id = '${countrydata[0].CountryId}'`;
            }
            const getemployeecommuting = await getSelectedColumn("employee_community_typeoftransport ", where, "*");
            // let ef
            var emission_kg = 0;
            var totatotalnoofcommutes = parseFloat(noofemployees * workingdays * 2 * 12); //added 12 
            if (getemployeecommuting.length > 0) {


              let yearRange = getemployeecommuting[0]?.Fiscal_Year; // The string representing the year range
              let [startYear, endYear] = yearRange.split('-').map(Number);

              if (year >= startYear && year <= endYear) {
                if (item.employeesCommute && item.avgCommute) {

                  emission_kg = parseFloat((item.employeesCommute / 100) * item.avgCommute * totatotalnoofcommutes * getemployeecommuting[0]?.efskgCO2e)
                } else if (item.avgCommute) {
                  emission_kg = parseFloat(item.avgCommute * totatotalnoofcommutes * getemployeecommuting[0]?.efskgCO2e)
                } else if (item.employeesCommute) {
                  emission_kg = parseFloat((item.employeesCommute / 100)  * totatotalnoofcommutes * getemployeecommuting[0]?.efskgCO2e)
                } else {
                  emission_kg = parseFloat(totatotalnoofcommutes * getemployeecommuting[0]?.efskgCO2e)
                }
              } else if (year == startYear) {
                if (item.employeesCommute && item.avgCommute) {

                  emission_kg = parseFloat((item.employeesCommute / 100)  * item.avgCommute * totatotalnoofcommutes * getemployeecommuting[0]?.efskgCO2e)
                } else if (item.avgCommute) {
                  emission_kg = parseFloat(item.avgCommute * totatotalnoofcommutes * getemployeecommuting[0]?.efskgCO2e)
                } else if (item.employeesCommute) {
                  emission_kg = parseFloat((item.employeesCommute / 100)  * totatotalnoofcommutes * getemployeecommuting[0]?.efskgCO2e)
                } else {
                  emission_kg = parseFloat(totatotalnoofcommutes * getemployeecommuting[0]?.efskgCO2e)
                }
              } else {
                return res.json({
                  success: false,
                  message: "EF not Found for this year",
                  status: 400,
                });
              }

            } else {
              //emission_kg =  parseFloat(totatotalnoofcommutes)
              return res.json({
                success: false,
                message: "EF not Found while Adding employee commuting",
                status: 400,
              });
            }

            // console.log(emission_kg);
            let months = JSON.parse(month);

            let employee_commuting_category = {
              noofemployees: noofemployees ? noofemployees : 0,
              workingdays: workingdays ? workingdays : 0,
              totalnoofcommutes: totatotalnoofcommutes ? totatotalnoofcommutes : 0,
              typeoftransport: item.type ? item.type : "",
              allemployeescommute: item.employeesCommute ? (item.employeesCommute)  : 0,
              subtype: item.subtype ? item.subtype : 0,
              avgcommutedistance: item.avgCommute ? item.avgCommute : 0,
              emission: emission_kg,
              EFs: getemployeecommuting[0]?.efskgCO2e,
              unit: 'passenger.km',
              user_id: user_id,
              batch: batch,
              facilities: facilities,
              year: year,
              month: months[0]
            }
            array.push(employee_commuting_category);
          })
        );
      }

      const employee_commuting = await insertemployee_commuting_category(array);
      if (employee_commuting.affectedRows > 0) {

        let where = ` where user_id =  '${user_id}'`;
        const allemployeescommute = await getSelectedColumn("employee_commuting_category", where, "*");
        return res.json({
          success: true,
          message: "Succesfully Added employee commuting",
          categories: allemployeescommute,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while Adding employeecommuting",
          status: 500,
        });
      }



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

exports.typeof_homeoffice = async (req, res) => {
  try {
    let where = ``;
    const vehicleIdRes = await getSelectedColumn("homeoffice_emission_factors", where, "*");
    if (vehicleIdRes.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched type of home office",
        categories: vehicleIdRes,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Some problem occured while selecting type of home office",
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

exports.AddhomeofficeCategory = async (req, res) => {
  try {
    const { typeofhomeoffice, batch, facilities, month, year } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        typeofhomeoffice: [Joi.optional().allow("")],
        batch: [Joi.number().empty().required()],
        facilities: [Joi.number().empty().required()],
        year: [Joi.string().empty().required()],
        month: [Joi.string().empty().required()],
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
    } else {
      const user_id = req.user.user_id;

      let where = ` where facilities ='${facilities}' and YEAR(created_at) = '${year}' and status != 'R'`;
      const homeofficecategory_exits = await getSelectedColumn("homeoffice_category", where, "*");
      console.log(homeofficecategory_exits);

      if (homeofficecategory_exits.length > 0) {
        return res.json({
          success: false,
          message: "Data of this current Year is already inserted!",
          status: 400,
        });
      }
      let array = [];

      let countrydata = await country_check(facilities);
      //console.log(countrydata[0].CountryId);
      if (countrydata.length == 0) {
        return res.json({
          success: false,
          message: "EF not found",
          status: 400,
        });
      }
      let notFound = [];

      if (typeofhomeoffice) {
        let json = JSON.parse(typeofhomeoffice);
        await Promise.all(
          json.map(async (item) => {
            var emission_kg = 0;
            const assumptions = await homeoffice_emission_factors(item.type, countrydata[0].CountryId, year);
            console.log(assumptions);
            if (assumptions.length === 0) {
              notFound.push(item.type);
              return null;
            }

            if (item.noofemployees && item.noofdays && item.noofmonths) {


              let yearRange = assumptions[0]?.Fiscal_Year; // The string representing the year range
              let [startYear, endYear] = yearRange.split('-').map(Number);

              if (year >= startYear && year <= endYear) {
                emission_kg = parseFloat(item.noofemployees * item.noofdays * 4 * item.noofmonths * assumptions[0]?.workinghoursperday
                  * assumptions[0]?.finalEFkgco2);
              } else if (year == startYear) {
                emission_kg = parseFloat(item.noofemployees * item.noofdays * 4 * item.noofmonths * assumptions[0]?.workinghoursperday
                  * assumptions[0]?.finalEFkgco2);
              } else {
                return res.json({
                  success: false,
                  message: "EF not Found for this year",
                  status: 400,
                });
              }
            } else {
              emission_kg = 0;
            }

            let months = JSON.parse(month);


            let homeofficecategory = {
              typeofhomeoffice: item.type ? item.type : "",
              noofemployees: item.noofemployees ? item.noofemployees : 0,
              noofdays: item.noofdays ? item.noofdays : 0,
              noofmonths: item.noofmonths ? item.noofmonths : 0,
              emission: emission_kg,
              emission_factor: assumptions[0]?.finalEFkgco2,
              emission_factor_unit: "kg C02e/hr",
              user_id: user_id,
              batch: batch,
              facilities: facilities,
              year: year,
              month: months[0]
            }

            array.push(homeofficecategory);
          })
        );

        if (notFound.length > 0) {
          return res.status(200).json({
            success: false,
            message: `EF not found`,
          });
        }
      }



      const homeoffice = await homeoffice_emission_category(array);
      if (homeoffice.affectedRows > 0) {

        let where = ` where user_id =  '${user_id}'`;
        const homeofficecategory = await getSelectedColumn("homeoffice_category", where, "*");
        return res.json({
          success: true,
          message: "Succesfully Added homeoffice category",
          categories: homeofficecategory,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while Adding homeoffice category",
          status: 500,
        });
      }
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

exports.gethomeofficeCategory = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    let where = ` where user_id ='${user_id}' and YEAR(created_at) = YEAR(CURRENT_DATE())`;
    const homeofficecategory_exits = await getSelectedColumn("homeoffice_category", where, "*");


    if (homeofficecategory_exits.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched homeoffice category",
        categories: homeofficecategory_exits,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Some problem occured while selecting homeoffice category",
        status: 400,
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

exports.getemployeecommutingCategory = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    let where = ` where A.user_id ='${user_id}' `;
    const getemployeecommuting = await getSelectedColumn("employee_commuting_category A LEFT JOIN  employee_community_typeoftransport B ON B.id = A.typeoftransport ", where, "A.*,B.type");


    if (getemployeecommuting.length > 0) {

      return res.json({
        success: true,
        message: "Succesfully fetched employee commuting category",
        categories: getemployeecommuting,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Some problem occured while selecting employee commuting category",
        status: 400,
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

exports.gethotel_stay = async (req, res) => {
  try {
    //const { month,year } = req.body;
    // const schema = Joi.alternatives(
    //   Joi.object({
    //    month:[Joi.string().empty().required()],
    //    year: [Joi.string().empty().required()],
    //   })
    // );
    // const result = schema.validate(req.body);
    // if (result.error) {
    //   const message = result.error.details.map((i) => i.message).join(",");
    //   return res.json({
    //     message: result.error.details[0].message,
    //     error: message,
    //     missingParams: result.error.details[0].message,
    //     status: 200,
    //     success: false,
    //   });
    // }else{
    const user_id = req.user.user_id;

    //let stringWithoutBrackets = month.replace(/\[|\]/g, '');
    //let where = ` where user_id ='${user_id}' and month IN(${stringWithoutBrackets}) and year='${year}'`;
    let where = ` where user_id ='${user_id}' `;
    const hotelstay = await getSelectedColumn("hotel_stay", where, "*");


    if (hotelstay.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched hotel stay",
        categories: hotelstay,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Some problem occured while selecting hotel_stay",
        status: 400,
      });
    }
    // }
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

exports.getothermodesofTransport = async (req, res) => {
  try {

    // const { month,year } = req.body;
    // const schema = Joi.alternatives(
    //   Joi.object({
    //    month:[Joi.string().empty().required()],
    //    year: [Joi.string().empty().required()],
    //   })
    // );
    // const result = schema.validate(req.body);
    // if (result.error) {
    //   const message = result.error.details.map((i) => i.message).join(",");
    //   return res.json({
    //     message: result.error.details[0].message,
    //     error: message,
    //     missingParams: result.error.details[0].message,
    //     status: 200,
    //     success: false,
    //   });
    // }else{
    const user_id = req.user.user_id;

    //let stringWithoutBrackets = month.replace(/\[|\]/g, '');
    //let where = ` where user_id ='${user_id}' and month IN(${stringWithoutBrackets}) and year='${year}'`;
    let where = ` where user_id ='${user_id}'`;

    const hotelstay = await getSelectedColumn("other_modes_of_transport", where, "*");


    if (hotelstay.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched hotel stay",
        categories: hotelstay,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Some problem occured while selecting hotel_stay",
        status: 400,
      });
    }
    //}
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

exports.getflight_travel = async (req, res) => {
  try {

    // const { month,year } = req.body;
    // const schema = Joi.alternatives(
    //   Joi.object({
    //    month:[Joi.string().empty().required()],
    //    year: [Joi.string().empty().required()],
    //   })
    // );
    // const result = schema.validate(req.body);
    // if (result.error) {
    //   const message = result.error.details.map((i) => i.message).join(",");
    //   return res.json({
    //     message: result.error.details[0].message,
    //     error: message,
    //     missingParams: result.error.details[0].message,
    //     status: 200,
    //     success: false,
    //   });
    // }else{

    const user_id = req.user.user_id;


    //let stringWithoutBrackets = month.replace(/\[|\]/g, '');
    // let where = ` where user_id ='${user_id}' and month IN(${stringWithoutBrackets}) and year='${year}'`;
    let where = ` where user_id ='${user_id}' `;
    const getflighttravel = await getSelectedColumn("flight_travel", where, "*");


    if (getflighttravel.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched flight travel",
        categories: getflighttravel,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Some problem occured while selecting flight travel",
        status: 400,
      });
    }
    // }
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
//

exports.getflightairportcode = async (req, res) => {
  try {
    let where = ``;
    const flightairport_code = await getSelectedColumn("`flight_airport_code`", where, "*");


    if (flightairport_code.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched flight airport code",
        categories: flightairport_code,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Some problem occured while selecting flight airport code",
        status: 400,
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

exports.getsoldproductCategory = async (req, res) => {
  try {
    const { type,country_code,year } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        type: [Joi.number().empty().required()],
        country_code: [Joi.string().empty().required()],
        year: [Joi.number().empty().required()],

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
    } else {

      let where = ` where type ='${type}' and country_id = '${country_code}' and Right(Fiscal_Year,4) = '${year}'`;
      const getSoldproduct = await getSelectedColumn("sold_product_category_ef", where, "*");


      if (getSoldproduct.length > 0) {
        return res.json({
          success: true,
          message: "Succesfully fetched Sold product",
          categories: getSoldproduct,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while selecting Sold product",
          status: 400,
        });
      }
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

exports.getrefrigents = async (req, res) => {
  try {
    let where = ``;
    const getSoldproduct = await getSelectedColumn("`dbo.refrigents`", where, "*");


    if (getSoldproduct.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched refrigents",
        categories: getSoldproduct,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Some problem occured while selecting refrigents",
        status: 400,
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

exports.getsoldproductFuelType = async (req, res) => {
  try {
    let where = ` where SubCategorySeedID = 1`;
    const soldproductFuelType = await getSelectedColumn("stationarycombustion", where, "*");


    if (soldproductFuelType.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched sold product Fuel Type",
        categories: soldproductFuelType,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Some problem occured while selecting sold product Fuel Type",
        status: 400,
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

exports.AddSoldProductsCategory = async (req, res) => {
  try {
    const { type, productcategory, no_of_Items, no_of_Items_unit, expectedlifetimeproduct, expectedlifetime_nooftimesused, electricity_use
      , electricity_usage, fuel_type, fuel_consumed,
      fuel_consumed_usage, referigentused, referigerantleakage, referigerant_usage, batch, month, year, facilities } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        type: [Joi.string().empty().required()],
        productcategory: [Joi.string().empty().required()],
        no_of_Items: [Joi.string().empty().required()],
        no_of_Items_unit: [Joi.string().empty().required()],
        batch: [Joi.string().empty().required()],
        expectedlifetimeproduct: [Joi.optional().allow("")],
        expectedlifetime_nooftimesused: [Joi.optional().allow("")],
        electricity_use: [Joi.optional().allow("")],
        electricity_usage: [Joi.optional().allow("")],
        fuel_type: [Joi.optional().allow("")],
        fuel_consumed: [Joi.optional().allow("")],
        fuel_consumed_usage: [Joi.optional().allow("")],
        referigentused: [Joi.optional().allow("")],
        referigerantleakage: [Joi.optional().allow("")],
        referigerant_usage: [Joi.optional().allow("")],
        month: [Joi.string().empty().required()],
        year: [Joi.string().empty().required()],
        facilities: [Joi.number().empty().required()],
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
    } else {
      var allinsertedID = [];

      const user_id = req.user.user_id;

      let prductef = '';
      let finalfrigentsEF = 0;
      let expectedlifetime_per_times = 0;
      let fuel_consumed_per_usage
      let referigerant_per_usage
      let electricity_per_usage
      let fuelconsumedEF = 0;
      let finalExpectedLifetimeProduct = 1;
      let electricityUseData = 1;
      let finalproductEF = 0;
      let emission = 0;
      let emission_factor_unit = "";

      let countrydata = await country_check(facilities);
      if (countrydata.length == 0) return res.json({ success: false, message: "EF not Found for sold products category", status: 400 });

      const chekefproduct = await soldproductsemission_factors(productcategory, countrydata[0].CountryId);

      if (chekefproduct.length > 0) {
        let yearRange = chekefproduct[0]?.Fiscal_Year;
        let [startYear, endYear] = yearRange.split('-').map(Number);

        if (no_of_Items_unit == '2') {
          prductef = chekefproduct[0]['tonnes'];
          emission_factor_unit = "tonnes";
        }
        if (no_of_Items_unit == '3') {
          prductef = chekefproduct[0]['kg'];
          emission_factor_unit = "kg";
        }
        if (no_of_Items_unit == '4') {
          prductef = chekefproduct[0]['litres'];
          emission_factor_unit = "litres";
        }

        if (no_of_Items_unit == '1') {
          prductef = 1;
          emission_factor_unit = "No. of items";
        }

        if (year >= startYear && year <= endYear) {
          finalproductEF = parseFloat(prductef * no_of_Items);
        } else if (year == startYear) {
          finalproductEF = parseFloat(prductef * no_of_Items);
        } else {
          return res.json({
            success: false,
            message: "EF not Found for this year",
            status: 400,
          });
        }

      } else {
        finalproductEF = parseFloat(no_of_Items);
      }

      if (expectedlifetimeproduct) {
        finalExpectedLifetimeProduct = expectedlifetimeproduct
      }

      if (electricity_usage) {
        const findElelctricityData = await getSelectedColumn("\`dbo.electricity\`", `where country_id = '${countrydata[0].CountryId}'`, "*");
        if (findElelctricityData.length > 0) {
          electricityUseData = electricity_use * findElelctricityData[0].kgCO2e_kwh;
        } else {
          electricityUseData = electricity_use * 1;
        }
      }

      if (fuel_consumed_usage) {
        let where = ` where Item = '${fuel_type}' and country_id = '${countrydata[0].CountryId}'`;
        const fuelconsumed = await getSelectedColumn("stationarycombustion", where, "*");
        if (fuelconsumed.length > 0) {
          let yearRange = fuelconsumed[0]?.Fiscal_Year;
          let [startYear, endYear] = yearRange.split('-').map(Number);
          if (year >= startYear && year <= endYear) {
            if (fuelconsumed[0].SubCategorySeedID == 1) {
              fuelconsumedEF = parseFloat(fuelconsumed[0]['kgCO2e_litre'] * fuel_consumed)
            } else {
              fuelconsumedEF = parseFloat(fuelconsumed[0]['kgCO2e_kg'] * fuel_consumed)
            }
          } else if (year == startYear) {
            if (fuelconsumed[0].SubCategorySeedID == 1) {
              fuelconsumedEF = parseFloat(fuelconsumed[0]['kgCO2e_litre'] * fuel_consumed)
            } else {
              fuelconsumedEF = parseFloat(fuelconsumed[0]['kgCO2e_kg'] * fuel_consumed)
            }
          } else {
            fuelconsumedEF = fuel_consumed * 1;
          }
        } else {
          fuelconsumedEF = fuel_consumed * 1;
        }
      }

      if (referigerant_usage) {
        let where = ` where Item = '${referigentused}' and country_id = '${countrydata[0].CountryId}'`;
        const refrigents = await getSelectedColumn("`dbo.refrigents`", where, "*");
        if (refrigents.length > 0) {
          let yearRange = refrigents[0]?.Fiscal_Year; // The string representing the year range
          let [startYear, endYear] = yearRange.split('-').map(Number);
          if (year >= startYear && year <= endYear) {
            finalfrigentsEF = parseFloat(refrigents[0]['kgCO2e_kg'] * referigerantleakage)
          } else if (year == startYear) {
            finalfrigentsEF = parseFloat(refrigents[0]['kgCO2e_kg'] * referigerantleakage)
          } else {
            finalfrigentsEF = referigerantleakage * 1;
          }
        } else {
          finalfrigentsEF = referigerantleakage * 1;
        }
      }

      if (finalproductEF) emission = parseFloat(finalproductEF * finalExpectedLifetimeProduct * (electricityUseData + fuelconsumedEF + finalfrigentsEF));

      let array = {
        type: type,
        productcategory: productcategory,
        no_of_Items: no_of_Items,
        no_of_Items_unit: no_of_Items_unit,
        batch: batch,
        finalproductEF: finalproductEF ? finalproductEF : "",
        expectedlifetimeproduct: expectedlifetimeproduct ? expectedlifetimeproduct : "",
        expectedlifetime_nooftimesused: expectedlifetime_nooftimesused ? expectedlifetime_nooftimesused : "",
        electricity_use: electricity_use ? electricity_use : "",
        electricity_usage: electricity_usage ? electricity_usage : "",
        electricity_per_usage: electricityUseData ? electricityUseData : "",
        expectedlifetime_per_times: finalExpectedLifetimeProduct ? finalExpectedLifetimeProduct : "",
        fuel_type: fuel_type ? fuel_type : "",
        fuel_consumed: fuel_consumed ? fuel_consumed : "",
        fuel_consumed_usage: fuel_consumed_usage ? fuel_consumed_usage : "",
        fuel_consumed_per_usage: fuelconsumedEF ? fuelconsumedEF : "",
        referigentused: referigentused ? referigentused : "",
        referigerantleakage: referigerantleakage ? referigerantleakage : "",
        referigerant_usage: referigerant_usage ? referigerant_usage : "",
        referigerant_per_usage: referigerant_per_usage ? referigerant_per_usage : "",
        finalfrigentsEF: finalfrigentsEF ? finalfrigentsEF : 0,
        fuelconsumedEF: fuelconsumedEF ? fuelconsumedEF : 0,
        emission: emission ? emission : 0,
        emission_factor_used: prductef ? prductef : "",
        emission_factor_unit: 'kg CO2e/' + emission_factor_unit,
        user_id: user_id,
        year: year,
        facilities: facilities
      }

      let months = JSON.parse(month);
      for (let monthdata of months) {
        array.month = monthdata;
        const soldproductsemission = await insertsoldproductsemission(array);
        allinsertedID.push(soldproductsemission.insertId);
      }

      if (allinsertedID.length > 0) {
        let where = ` where user_id =  '${user_id}'`;
        const soldproductcategory = await getSelectedColumn("sold_product_category", where, "*");

        return res.json({
          success: true,
          message: "Succesfully Added sold products category",
          categories: soldproductcategory,
          emission: emission,
          finalfrigentsEF: finalfrigentsEF,
          fuelconsumedEF: fuelconsumedEF,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while Addingsold products category",
          status: 500,
        });
      }
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

exports.getAllsoldproductCategory = async (req, res) => {
  try {

    // const { month,year } = req.body;
    // const schema = Joi.alternatives(
    //   Joi.object({
    //    month:[Joi.string().empty().required()],
    //    year: [Joi.string().empty().required()],
    //   })
    // );
    // const result = schema.validate(req.body);
    // if (result.error) {
    //   const message = result.error.details.map((i) => i.message).join(",");
    //   return res.json({
    //     message: result.error.details[0].message,
    //     error: message,
    //     missingParams: result.error.details[0].message,
    //     status: 200,
    //     success: false,
    //   });
    // }else{

    const user_id = req.user.user_id;


    //let stringWithoutBrackets = month.replace(/\[|\]/g, '');
    //let where = ` where user_id ='${user_id}' and month IN(${stringWithoutBrackets}) and year='${year}'`;
    let where = ` where user_id ='${user_id}'`;

    const getSoldproduct = await getSelectedColumn("sold_product_category", where, "*");


    if (getSoldproduct.length > 0) {

      await Promise.all(getSoldproduct.map(async (item) => {
        if (item.no_of_Items_unit == 1) {
          item.no_of_Items_unit = 'No. of Item';
        } else if (item.no_of_Items_unit == 2) {
          item.no_of_Items_unit = 'Tonnes';
        } else if (item.no_of_Items_unit == 3) {
          item.no_of_Items_unit = 'kg';
        } else if (item.no_of_Items_unit == 4) {
          item.no_of_Items_unit = 'litres';
        }

        if (item.expectedlifetime_nooftimesused == 1) {
          item.expectedlifetime_nooftimesused = 'No. of times used';
        } else if (item.expectedlifetime_nooftimesused == 2) {
          item.expectedlifetime_nooftimesused = 'Days';
        } else if (item.expectedlifetime_nooftimesused == 3) {
          item.expectedlifetime_nooftimesused = 'Months';
        } else if (item.expectedlifetime_nooftimesused == 4) {
          item.expectedlifetime_nooftimesused = 'Years';
        }

        if (item.fuel_consumed_usage == 1) {
          item.fuel_consumed_usage = 'per usage';
        } else if (item.fuel_consumed_usage == 2) {
          item.fuel_consumed_usage = 'per day';
        } else if (item.fuel_consumed_usage == 3) {
          item.fuel_consumed_usage = 'per month';
        } else if (item.fuel_consumed_usage == 4) {
          item.fuel_consumed_usage = 'per year';
        }

        if (item.electricity_usage == 1) {
          item.electricity_usage = 'per usage';
        } else if (item.electricity_usage == 2) {
          item.electricity_usage = 'per day';
        } else if (item.electricity_usage == 3) {
          item.electricity_usage = 'per month';
        } else if (item.electricity_usage == 4) {
          item.electricity_usage = 'per year';
        }

        if (item.referigerant_usage == 1) {
          item.referigerant_usage = 'per usage';
        } else if (item.referigerant_usage == 2) {
          item.referigerant_usage = 'per day';
        } else if (item.referigerant_usage == 3) {
          item.referigerant_usage = 'per month';
        } else if (item.referigerant_usage == 4) {
          item.referigerant_usage = 'per year';
        }

      }));
      return res.json({
        success: true,
        message: "Succesfully fetched refrigents",
        categories: getSoldproduct,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Some problem occured while selecting refrigents",
        status: 400,
      });
    }
    // }
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

exports.getendoflife_waste_type = async (req, res) => {
  try {
    const schema = Joi.object({
      facility_id: Joi.string().required(),
    });

    const { error, value } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { facility_id } = value;

    const countryResponse = await country_check(facility_id);
    if (!countryResponse.length) {
      return res.status(400).json({ error: true, message: "Invalid Facility ID", success: false });
    }


    let where = `where country_id = ${countryResponse[0].CountryId}`;
    const life_waste_type = await getSelectedColumn("endoflife_waste_type", where, "*");


    if (life_waste_type.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched endoflife waste type",
        categories: life_waste_type,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Some problem occured while selecting endoflife waste type",
        status: 400,
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

exports.getendoflife_waste_type_subcategory = async (req, res) => {
  try {
    const { type, year } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        type: [Joi.number().empty().required()],
        year: [Joi.number().empty().required()],
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
    } else {
      let where = ` 
       WHERE waste_type = '${type}' 
       AND RIGHT(Fiscal_Year, 4) = '${year}'`;

      const endoflife_waste_type = await getSelectedColumn("`endoflife_waste_type_subcategory`", where, "*");

      if (endoflife_waste_type.length > 0) {
        return res.json({
          success: true,
          message: "Succesfully fetched endoflife Sub waste type",
          categories: endoflife_waste_type,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while selecting endoflife Sub waste type",
          status: 400,
        });
      }
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

exports.AddendoflifeCategory = async (req, res) => {
  try {
    const { batch, waste_type, subcategory, total_waste
      , waste_unit, landfill, combustion, recycling, composing, month, year, facilities } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        waste_type: [Joi.string().empty().required()],
        subcategory: [Joi.string().empty().required()],
        total_waste: [Joi.string().empty().required()],
        waste_unit: [Joi.string().empty().required()],
        batch: [Joi.string().empty().required()],
        landfill: [Joi.optional().allow("")],
        combustion: [Joi.optional().allow("")],
        recycling: [Joi.optional().allow("")],
        composing: [Joi.optional().allow("")],
        month: [Joi.string().empty().required()],
        year: [Joi.string().empty().required()],
        facilities: [Joi.string().empty().required()],
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
    } else {
      var allinsertedID = [];
      const user_id = req.user.user_id;

      let emission = 0;
      let finalproductEF = 0;

      let countrydata = await country_check(facilities);
      //console.log(countrydata[0].CountryId);
      if (countrydata.length == 0) {
        return res.json({
          success: false,
          message: "EF not Found End of life treatment category",
          status: 400,
        });
      }

      let lanef = '';
      let combustionef = '';
      let recyclingef = '';
      let composingef = '';
      let landfill = '';
      let incineration = '';
      let recycling = '';
      let composting = '';

      if (subcategory) {
        const subCategory = await endof_lifeSubCatmission_factors(subcategory, countrydata[0].CountryId);
        if (subCategory.length > 0) {
          //landfill  combustion  recycling  composing
          // if(waste_unit == 'tonnes'){
          //   prductef = subCategory[0]['tonnes'];
          // }
          // if(waste_unit == 'kg'){
          //   prductef = subCategory[0]['kg'];
          // }
          // if(waste_unit == 'litres'){
          //   prductef = subCategory[0]['litres'];
          // }
          landfill = subCategory[0].landfill;
          lanef = parseFloat(subCategory[0].landfill * landfill * total_waste)
          incineration = subCategory[0].incineration;
          combustionef = parseFloat(subCategory[0].incineration * combustion * total_waste)
          recycling = subCategory[0].recycling;
          recyclingef = parseFloat(subCategory[0].recycling * recycling * total_waste)
          composting = subCategory[0].composting;
          composingef = parseFloat(subCategory[0].composting * composing * total_waste)

          let yearRange = subCategory[0]?.Fiscal_Year;
          let [startYear, endYear] = yearRange.split('-').map(Number);

          if (year >= startYear && year <= endYear) {
            finalproductEF = parseFloat(lanef + combustionef + recyclingef + composingef);
          } else if (year == startYear) {
            finalproductEF = parseFloat(lanef + combustionef + recyclingef + composingef);
          } else {
            return res.json({
              success: false,
              message: "EF not Found for this year in fuel_type",
              status: 400,
            });
          }
        } else {
          return res.json({
            success: false,
            message: "EF not Found End of life treatment category",
            status: 400,
          });
        }
      }

      if (finalproductEF) emission = parseFloat(finalproductEF);

      let array = {
        waste_type: waste_type,
        subcategory: subcategory,
        total_waste: total_waste,
        waste_unit: waste_unit,
        batch: batch,
        landfill: landfill,
        combustion: combustion,
        recycling: recycling,
        composing: composing,
        emission: emission ? emission : 0,
        emission_factor_lan: landfill ? landfill : 0,
        emission_factor_combustion: incineration ? incineration : 0,
        emission_factor_recycling: recycling ? recycling : 0,
        emission_factor_composing: composting ? composting : 0,
        emission_factor_unit: 'kg CO2e/tonnes',
        user_id: user_id,
        facilities: facilities,
        year: year,
      }
      console.log(array);

      let months = JSON.parse(month);
      for (let monthdata of months) {
        array.month = monthdata;
        const endoflifetreatmentemission = await insertendof_lifetreatment_category(array);
        allinsertedID.push(endoflifetreatmentemission.insertId);
      }


      if (allinsertedID.length > 0) {

        let where = ` where user_id =  '${user_id}'`;
        const endoflifetreatment = await getSelectedColumn("endof_lifetreatment_category", where, "*");
        return res.json({
          success: true,
          message: "Succesfully Added endof life treatment category",
          categories: endoflifetreatment,
          emission: emission,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while endof life treatment  category",
          status: 500,
        });
      }
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

exports.getendof_lifetreatment_category = async (req, res) => {
  try {

    // const { month,year } = req.body;
    // const schema = Joi.alternatives(
    //   Joi.object({
    //    month:[Joi.string().empty().required()],
    //    year: [Joi.string().empty().required()],
    //   })
    // );
    // const result = schema.validate(req.body);
    // if (result.error) {
    //   const message = result.error.details.map((i) => i.message).join(",");
    //   return res.json({
    //     message: result.error.details[0].message,
    //     error: message,
    //     missingParams: result.error.details[0].message,
    //     status: 200,
    //     success: false,
    //   });
    // }else{
    const user_id = req.user.user_id;


    //let stringWithoutBrackets = month.replace(/\[|\]/g, '');
    //let where = ` where user_id ='${user_id}' and month IN(${stringWithoutBrackets}) and year='${year}'`;
    let where = ` where user_id ='${user_id}'`;

    const getSoldproduct = await getSelectedColumn("endof_lifetreatment_category", where, "*");


    if (getSoldproduct.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched endof_life treatment category",
        categories: getSoldproduct,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Some problem occured while selecting endof_life treatment category",
        status: 400,
      });
    }
    // }
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

exports.AddwatersupplytreatmentCategory = async (req, res) => {
  try {
    const { water_supply, water_treatment, water_supply_unit, water_discharge_only, water_treatment_unit,
      water_withdrawl, water_discharge, batch, facilities, month, year } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        water_supply: [Joi.string().empty().required()],
        water_treatment: [Joi.string().empty().required()],
        water_supply_unit: [Joi.string().empty().required()],
        water_treatment_unit: [Joi.string().empty().required()],
        water_withdrawl: [Joi.optional().allow("")],
        water_discharge: [Joi.optional().allow("")],
        water_discharge_only: [Joi.optional().allow("")],
        facilities: [Joi.string().empty().required()],
        batch: [Joi.string().empty().required()],
        month: [Joi.string().empty().required()],
        year: [Joi.string().empty().required()],

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
    } else {
      const user_id = req.user.user_id;

      let water_supplytreatmentcategory = ""
      let insertId = [];
      let insertMonth = []
      let countrydata = await country_check(facilities);
      if (countrydata.length == 0) {
        return res.json({
          success: false,
          message: "EF not Found for water supply treatment category",
          status: 400,
        });
      }
      let emsision = 0;

      if (water_supply) {
        const watersupply = await water_supply_treatment_type(1, countrydata[0].CountryId, year);
        const watertreatment = await water_supply_treatment_type(2, countrydata[0].CountryId, year);

        let water_supply_ef = "";
        let water_treatment_ef = "";
        let withdrawn_emission_factor_used = "";

        if (watersupply.length > 0) {
          let yearRange = watersupply[0]?.Fiscal_Year; // The string representing the year range
          let [startYear, endYear] = yearRange.split('-').map(Number);
          if (year >= startYear && year <= endYear) {
            if (water_supply_unit == '1') {
              let totalem = parseFloat(watersupply[0]?.kgCO2e_cubic_metres * water_supply) + parseFloat(watertreatment[0]?.kgCO2e_cubic_metres)
              withdrawn_emission_factor_used = watersupply[0]?.kgCO2e_cubic_metres;
              water_supply_ef = totalem;
            } else if (water_supply_unit == '2') {
              let totalem = parseFloat(watersupply[0]?.kgCO2e_Kilo_litres * water_supply) + parseFloat(watertreatment[0]?.kgCO2e_Kilo_litres)
              withdrawn_emission_factor_used = watersupply[0]?.kgCO2e_Kilo_litres;
              water_supply_ef = totalem
            }
          } else if (year == startYear) {
            if (water_supply_unit == '1') {
              let totalem = parseFloat(watersupply[0]?.kgCO2e_cubic_metres * water_supply) + parseFloat(watertreatment[0]?.kgCO2e_cubic_metres)
              withdrawn_emission_factor_used = watersupply[0]?.kgCO2e_cubic_metres;
              water_supply_ef = totalem;
            } else if (water_supply_unit == '2') {
              let totalem = parseFloat(watersupply[0]?.kgCO2e_Kilo_litres * water_supply) + parseFloat(watertreatment[0]?.kgCO2e_Kilo_litres)
              withdrawn_emission_factor_used = watersupply[0]?.kgCO2e_Kilo_litres;
              water_supply_ef = totalem
            }
          } else {
            return res.json({
              success: false,
              message: "EF not Found for this year",
              status: 400,
            });
          }
        } else {
          return res.json({
            success: false,
            message: "EF not Found for water supply category",
            status: 400,
          });
        }


   
        emsision = parseFloat(water_supply_ef).toFixed(4);

        let category = {
          water_supply: water_supply ? water_supply : "",
          water_treatment: water_treatment ? water_treatment : "",
          water_supply_unit: water_supply_unit ? water_supply_unit : "",
          water_treatment_unit: water_treatment_unit ? water_treatment_unit : "",
          emission: emsision ? emsision : "",
          withdrawn_emission: emsision ? emsision : "",
          withdrawn_emission_factor_used: withdrawn_emission_factor_used ? withdrawn_emission_factor_used : "",
          emission_factor_unit: "kg C02e/KL",
          facilities: facilities ? facilities : "",
          user_id: user_id,
          batch: batch,
          year: year
        }
        let months = JSON.parse(month);
        for (let monthdata of months) {
          category.month = monthdata;
          const water_supplytreatmentcategory = await insertwater_supply_treatment_category(category);
          if (water_supplytreatmentcategory.affectedRows > 0) {
            let insertIdid = water_supplytreatmentcategory.insertId
            insertId.push(insertIdid);
            insertMonth?.push({
              insertId: insertIdid,
              month: monthdata
            })
          }
        }
      }
      if (water_withdrawl) {
        let array = [];
        let json = JSON.parse(water_withdrawl);
        await Promise.all(
          json.map(async (item) => {
            for (let i = 0; i < insertId.length; i++) {
              let totalwaterwithdrawl = parseFloat(water_supply * item.kilolitres / 100);
              let months = JSON.parse(month);
              if (i == 0) {
                for (var k = 0; k < months?.length; k++) {
                  let data12 = insertMonth?.filter((item) => (
                    item?.month == months[k] && item
                  ))

                  array.push({
                    kilolitres: item.kilolitres ? item.kilolitres : 0,
                    water_withdrawl: item.type ? item.type : "",
                    user_id: user_id,
                    water_supply_treatment_id: data12?.length != 0 ? data12[0]?.insertId ? data12[0]?.insertId : '' : '',
                    year: year,
                    totalwaterwithdrawl: totalwaterwithdrawl,
                    month: months[k]
                  });
                }
              }
            }
          })
        );
        const water_supplytreatmentcategory2 = await insert_water_withdrawl_by_source(array);
      }

      let dischargearray = [];
      if (water_discharge_only) {
        let array1 = [];
        let json = JSON.parse(water_discharge_only);
        await Promise.all(
          json.map(async (item) => {
            for (let i = 0; i < insertId.length; i++) {
              let totaldischarge = parseFloat(water_treatment * item.kilolitres / 100);
              dischargearray.push(totaldischarge);
              // let category = {
              //   water_discharge: item.type ? item.type : "",
              //   kilolitres: item.kilolitres ? item.kilolitres : 0,
              //   user_id: user_id,
              //   water_supply_treatment_id: insertId[i] ? insertId[i] : "",
              //   year: year,
              //   totaldischarge: totaldischarge
              // }
              let months = JSON.parse(month);
              if (i == 0) {
                for (var k = 0; k < months?.length; k++) {
                  let data12 = insertMonth?.filter((item) => (
                    item?.month == months[k] && item
                  ))
                  array1.push({
                    water_discharge: item.type ? item.type : "",
                    kilolitres: item.kilolitres ? item.kilolitres : 0,
                    user_id: user_id,
                    water_supply_treatment_id: data12?.length != 0 ? data12[0]?.insertId ? data12[0]?.insertId : '' : '',
                    year: year,
                    totaldischarge: totaldischarge,
                    month: months[k]
                  });
                }

              }
            }
          })
        );
        const water_supplytreatmentcategory1 = await insert_water_discharge_by_destination_only(array1);
      }

      let totalwater = 0;
      if (water_discharge) {
        let array1 = [];
        let json = JSON.parse(water_discharge);
        console.log(json);
        await Promise.all(
          json.map(async (item, j) => {
            for (let i = 0; i < insertId.length; i++) {
              let totalwaterdischarge = "";
              console.log(dischargearray[j], "dischargearray[item]dischargearray[item]")
              if (dischargearray[j]) {
                let totaldischarge = dischargearray[j];
                totalwaterdischarge = item.withthtreatment / 100 * totaldischarge;
              } else {
                totalwaterdischarge = 0
              }
              totalwater += totalwaterdischarge;
              let months = JSON.parse(month);
              if (i == 0) {
                for (var k = 0; k < months?.length; k++) {
                  let data12 = insertMonth?.filter((item) => (
                    item?.month == months[k] && item
                  ))
                  array1.push({
                    water_discharge: item.type ? item.type : "",
                    withthtreatment: item.withthtreatment ? item.withthtreatment : "",
                    leveloftreatment: item.leveloftreatment ? item.leveloftreatment : "",
                    user_id: user_id,
                    water_supply_treatment_id: data12?.length != 0 ? data12[0]?.insertId ? data12[0]?.insertId : '' : '',
                    year: year,
                    totalwaterdischarge: totalwaterdischarge ? totalwaterdischarge : 0,
                    month: months[k]
                  });
                }
              }

            }
          }));
        const water_supplytreatmentcategory1 = await insert_water_discharge_by_destination(array1);
      }

      let emissiondata = '';
      let waterTreated = 0;
      let treatment_emission_factor_used = "";
      if (water_treatment) {
        const watertreatment = await water_supply_treatment_type(2, countrydata[0].CountryId, year);
        if (watertreatment.length > 0) {
          let yearRange = watertreatment[0]?.Fiscal_Year; // The string representing the year range
          let [startYear, endYear] = yearRange.split('-').map(Number);
          if (year >= startYear && year <= endYear) {
            if (water_supply_unit == '1') {
              waterTreated = parseFloat(watertreatment[0]?.kgCO2e_cubic_metres * totalwater);
              let totalem = parseFloat(watertreatment[0]?.kgCO2e_cubic_metres * totalwater) + parseFloat(emsision);
              treatment_emission_factor_used = watertreatment[0]?.kgCO2e_cubic_metres;
              emissiondata = totalem;
            } else if (water_supply_unit == '2') {
              waterTreated = parseFloat(watertreatment[0]?.kgCO2e_Kilo_litres * totalwater);
              let totalem = parseFloat(watertreatment[0]?.kgCO2e_Kilo_litres * totalwater) + parseFloat(emsision)
              treatment_emission_factor_used = watertreatment[0]?.kgCO2e_Kilo_litres;
              emissiondata = totalem
            }
          } else if (year == startYear) {
            if (water_supply_unit == '1') {
              waterTreated = parseFloat(watertreatment[0]?.kgCO2e_cubic_metres * totalwater);
              let totalem = parseFloat(watertreatment[0]?.kgCO2e_cubic_metres * totalwater) + parseFloat(emsision)
              treatment_emission_factor_used = watertreatment[0]?.kgCO2e_cubic_metres;
              emissiondata = totalem;
            } else if (water_supply_unit == '2') {
              waterTreated = parseFloat(watertreatment[0]?.kgCO2e_Kilo_litres * totalwater);
              let totalem = parseFloat(watertreatment[0]?.kgCO2e_Kilo_litres * totalwater) + parseFloat(emsision)
              treatment_emission_factor_used = watertreatment[0]?.kgCO2e_Kilo_litres;
              emissiondata = totalem
            }
          }
        }
      }

      let non_water_treated = water_treatment - totalwater;
      if (insertId) {
        for (let i = 0; i < insertId.length; i++) {
          const waterpplyory1 = await updateWater_ef(emissiondata, parseFloat(waterTreated).toFixed(4), treatment_emission_factor_used, totalwater, non_water_treated, insertId[i]);
        }
        let where = ` where user_id =  '${user_id}' and facilities = '${facilities}'`;
        const water_supplytreatmentcategory1 = await getSelectedColumn("water_supply_treatment_category", where, "*");
        return res.json({
          success: true,
          message: "Succesfully Added water supply treatment category",
          categories: water_supplytreatmentcategory1,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while Adding water supply treatment category",
          status: 500,
        });
      }
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
exports.UploadWaterSupplyDE = async (req, res) => {
  try {
    const { water_supply, water_treatment, water_supply_unit, water_discharge_only, water_treatment_unit,
      water_withdrawl, water_discharge, batch, facilities, month, year } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        water_supply: [Joi.string().empty().required()],
        water_treatment: [Joi.string().empty().required()],
        water_supply_unit: [Joi.string().empty().required()],
        water_treatment_unit: [Joi.string().empty().required()],
        water_withdrawl: [Joi.optional().allow("")],
        water_discharge: [Joi.optional().allow("")],
        water_discharge_only: [Joi.optional().allow("")],
        facilities: [Joi.string().empty().required()],
        batch: [Joi.string().empty().required()],
        month: [Joi.string().empty().required()],
        year: [Joi.string().empty().required()],

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
    } else {
      const user_id = req.user.user_id;

      let water_supplytreatmentcategory = ""
      let insertId = [];
      let insertMonth = []
      let countrydata = await country_check(facilities);
      if (countrydata.length == 0) {
        return res.json({
          success: false,
          message: "EF not Found for water supply treatment category",
          status: 400,
        });
      }
      let emsision = 0;

      if (water_supply) {
        var watersupplyEf = await getData('waterSupply_sub_EFs' , `where country_id = ${countrydata[0].CountryId} and Right(Fiscal_Year,4) = '${year}' and unit_id = '${water_supply_unit}'`);
        const waterTreatmentEf = await getData('waterSupply_sub_EFs' , `where country_id = ${countrydata[0].CountryId} and Right(Fiscal_Year,4) = '${year}' and unit_id = '${water_treatment_unit}'`);
    console.log("watersupplyEf",watersupplyEf);
        let water_supply_ef = "";
        let water_treatment_ef = "";
        let withdrawn_emission_factor_used = "";

        if (watersupplyEf.length > 0) {
          // let yearRange = watersupplyEf[0]?.Fiscal_Year; // The string representing the year range
          // let [startYear, endYear] = yearRange.split('-').map(Number);
          // if (year >= startYear && year <= endYear) {
          //   if (water_supply_unit == '1') {
          //     let totalem = parseFloat(watersupply[0]?.kgCO2e_cubic_metres * water_supply) + parseFloat(watertreatment[0]?.kgCO2e_cubic_metres)
          //     withdrawn_emission_factor_used = watersupply[0]?.kgCO2e_cubic_metres;
          //     water_supply_ef = totalem;
          //   } else if (water_supply_unit == '2') {
          //     let totalem = parseFloat(watersupply[0]?.kgCO2e_Kilo_litres * water_supply) + parseFloat(watertreatment[0]?.kgCO2e_Kilo_litres)
          //     withdrawn_emission_factor_used = watersupply[0]?.kgCO2e_Kilo_litres;
          //     water_supply_ef = totalem
          //   }
          // } else if (year == startYear) {
          //   if (water_supply_unit == '1') {
          //     let totalem = parseFloat(watersupply[0]?.kgCO2e_cubic_metres * water_supply) + parseFloat(watertreatment[0]?.kgCO2e_cubic_metres)
          //     withdrawn_emission_factor_used = watersupply[0]?.kgCO2e_cubic_metres;
          //     water_supply_ef = totalem;
          //   } else if (water_supply_unit == '2') {
          //     let totalem = parseFloat(watersupply[0]?.kgCO2e_Kilo_litres * water_supply) + parseFloat(watertreatment[0]?.kgCO2e_Kilo_litres)
          //     withdrawn_emission_factor_used = watersupply[0]?.kgCO2e_Kilo_litres;
          //     water_supply_ef = totalem
          //   }
          } else {
            return res.json({
              success: false,
              message: "EF not Found for this year",
              status: 400,
            });
          }
        } else {
          return res.json({
            success: false,
            message: "EF not Found for water supply category",
            status: 400,
          });
        }

        let waterSupplyEfValues = [
          watersupplyEf[0].surface_water,
          watersupplyEf[0].ground_water,
          watersupplyEf[0].third_party_water,
          watersupplyEf[0].sea_water,
          watersupplyEf[0].other_water
        ];
        let waterTreatmentEfValues = [
          watersupplyEf[0].primary_treatment,
          watersupplyEf[0].secondary_treamtment,
          watersupplyEf[0].tertiary_treatment,
       
        ];

        let waterTreatmentEfObj = {
          primary_treatment: watersupplyEf[0].primary_treatment,
          secondary_treamtment: watersupplyEf[0].secondary_treamtment,
          tertiary_treatment: watersupplyEf[0].tertiary_treatment
        }
   
        emsision = 0

        let category = {
          water_supply: water_supply ? water_supply : "",
          water_treatment: water_treatment ? water_treatment : "",
          water_supply_unit: water_supply_unit ? water_supply_unit : "",
          water_treatment_unit: water_treatment_unit ? water_treatment_unit : "",
          emission: emsision ? emsision : 0,
          withdrawn_emission: emsision ? emsision : 0,
          withdrawn_emission_factor_used: watersupplyEf ? waterSupplyEfValues.join(",") : "",
          treatment_emission_factor_used:waterTreatmentEfValues.join(",") || "",
          emission_factor_unit: "kg C02e/KL",
          facilities: facilities ? facilities : "",
          user_id: user_id,
          batch: batch,
          year: year
        }
        let months = JSON.parse(month);
        for (let monthdata of months) {
          category.month = monthdata;
          const water_supplytreatmentcategory = await insertwater_supply_treatment_category(category);
          console.log("water_supplytreatmentcategory", water_supplytreatmentcategory);
          if (water_supplytreatmentcategory.affectedRows > 0) {
            var insertIdid = water_supplytreatmentcategory.insertId
            insertId.push(insertIdid);
            insertMonth?.push({
              insertId: insertIdid,
              month: monthdata
            })
          }
        }
      
      let totalWithdrawnEmission = 0; // declared outside

      if (water_withdrawl) {
        let array = [];
        let json = JSON.parse(water_withdrawl);
      
        await Promise.all(
          json.map(async (item, index) => {
            for (let i = 0; i < insertId.length; i++) {
              let totalwaterwithdrawl = parseFloat(water_supply * item.kilolitres / 100);
              let withdrawn_emission = totalwaterwithdrawl * waterSupplyEfValues[index];
     
              totalWithdrawnEmission += withdrawn_emission; // accumulate
      
              let months = JSON.parse(month);
              if (i == 0) {
                for (var k = 0; k < months?.length; k++) {
                  let data12 = insertMonth?.filter((item) => (
                    item?.month == months[k] && item
                  ));
      
                  array.push({
                    kilolitres: item.kilolitres ? item.kilolitres : 0,
                    water_withdrawl: item.type ? item.type : "",
                    user_id: user_id,
                    water_supply_treatment_id: data12?.length != 0 ? data12[0]?.insertId ? data12[0]?.insertId : '' : '',
                    year: year,
                    totalwaterwithdrawl: totalwaterwithdrawl,
                    withdrawl_emissions: withdrawn_emission,
                    month: months[k]
                  });
                }
              }
            }
          })
        );
      
        const water_supplytreatmentcategory2 = await insert_water_withdrawl_by_source(array);
      }
      
      console.log("✅ Final totalWithdrawnEmission:", totalWithdrawnEmission); 

      let dischargearray = [];
      if (water_discharge_only) {
        let array1 = [];
        let json = JSON.parse(water_discharge_only);
        await Promise.all(
          json.map(async (item) => {
            for (let i = 0; i < insertId.length; i++) {
              let totaldischarge = parseFloat(water_treatment * item.kilolitres / 100);
              dischargearray.push(totaldischarge);
              // let category = {
              //   water_discharge: item.type ? item.type : "",
              //   kilolitres: item.kilolitres ? item.kilolitres : 0,
              //   user_id: user_id,
              //   water_supply_treatment_id: insertId[i] ? insertId[i] : "",
              //   year: year,
              //   totaldischarge: totaldischarge
              // }
              let months = JSON.parse(month);
              if (i == 0) {
                for (var k = 0; k < months?.length; k++) {
                  let data12 = insertMonth?.filter((item) => (
                    item?.month == months[k] && item
                  ))
                  array1.push({
                    water_discharge: item.type ? item.type : "",
                    kilolitres: item.kilolitres ? item.kilolitres : 0,
                    user_id: user_id,
                    water_supply_treatment_id: data12?.length != 0 ? data12[0]?.insertId ? data12[0]?.insertId : '' : '',
                    year: year,
                    totaldischarge: totaldischarge,
                    month: months[k]
                  });
                }

              }
            }
          })
        );
        const water_supplytreatmentcategory1 = await insert_water_discharge_by_destination_only(array1);
      }
      console.log("dischargearray", dischargearray);

      let totalWaterTreated = 0;
      let treatedWaterArray = [];
      let totalTreatedEmission = 0;
      if (water_discharge) {
        let array1 = [];
        let json = JSON.parse(water_discharge);
        console.log(json);
        await Promise.all(
          json.map(async (item, j) => {
            for (let i = 0; i < insertId.length; i++) {
              let treatedWater = 0;
              let treatmentEmission = 0;
       
              if (dischargearray[j]) {
                let totaldischarge = dischargearray[j];
                treatedWater = item.withthtreatment / 100 * totaldischarge;
                console.log("treatedWater", treatedWater);
                if(item.leveloftreatment == 'Primary'){
                  treatmentEmission = treatedWater * waterTreatmentEfObj.primary_treatment
                }else if(item.leveloftreatment == 'Secondary'){
                  treatmentEmission = treatedWater * waterTreatmentEfObj.secondary_treamtment
                }else if(item.leveloftreatment == 'Tertiary'){
                  treatmentEmission = treatedWater * waterTreatmentEfObj.tertiary_treatment
                }
             
                console.log("treatmentEmission", treatmentEmission);
                totalTreatedEmission += treatmentEmission;
                treatedWaterArray.push(treatedWater);
              } else {
                treatedWater = 0
              }
              totalWaterTreated += treatedWater;
              let months = JSON.parse(month);
              if (i == 0) {
                for (var k = 0; k < months?.length; k++) {
                  let data12 = insertMonth?.filter((item) => (
                    item?.month == months[k] && item
                  ))
                  array1.push({
                    water_discharge: item.type ? item.type : "",
                    withthtreatment: item.withthtreatment ? item.withthtreatment : "",
                    leveloftreatment: item.leveloftreatment ? item.leveloftreatment : "",
                    user_id: user_id,
                    water_supply_treatment_id: data12?.length != 0 ? data12[0]?.insertId ? data12[0]?.insertId : '' : '',
                    year: year,
                    totalwaterdischarge: treatedWater ? treatedWater : 0,
                    treated_water: treatedWater,
                    month: months[k],
                    total_treatment_emissions: treatmentEmission
                  });
                }
              }

            }
          }));
        const water_supplytreatmentcategory1 = await insert_water_discharge_by_destination(array1);
      }

      console.log("totalWaterTreated", totalWaterTreated);
      console.log("totalWithdrawnEmission", totalWithdrawnEmission);
      console.log("totalTreatedEmission", totalTreatedEmission);

      let emissiondata = '';
      let waterTreated = 0;
      let treatment_emission_factor_used = "";
  

      let non_water_treated = water_treatment - totalWaterTreated;
      let totalEmissions = totalTreatedEmission + totalWithdrawnEmission;
      if (insertId) {
        for (let i = 0; i < insertId.length; i++) {
          const waterpplyory1 = await updateWater_ef(totalEmissions,totalWithdrawnEmission,totalTreatedEmission, parseFloat(totalWaterTreated).toFixed(4), non_water_treated,totalWaterTreated, insertId[i]);
        }
        let where = ` where user_id =  '${user_id}' and facilities = '${facilities}'`;
        const water_supplytreatmentcategory1 = await getSelectedColumn("water_supply_treatment_category", where, "*");
        return res.json({
          success: true,
          message: "Succesfully Added water supply treatment category",
          categories: water_supplytreatmentcategory1,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while Adding water supply treatment category",
          status: 500,
        });
      }
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

exports.getwatersupplytreatmentCategory = async (req, res) => {
  try {

    // const { month,year,facilities } = req.body;
    // const schema = Joi.alternatives(
    //   Joi.object({
    //    month:[Joi.string().empty().required()],
    //    year: [Joi.string().empty().required()],
    //    facilities:[Joi.string().empty().required()],
    //   })
    // );
    // const result = schema.validate(req.body);
    // if (result.error) {
    //   const message = result.error.details.map((i) => i.message).join(",");
    //   return res.json({
    //     message: result.error.details[0].message,
    //     error: message,
    //     missingParams: result.error.details[0].message,
    //     status: 200,
    //     success: false,
    //   });
    // }else{
    const user_id = req.user.user_id;

    let where = ` where user_id ='${user_id}' `;
    const water_supply = await getSelectedColumn("water_supply_treatment_category", where, "*");


    if (water_supply.length > 0) {

      await Promise.all(
        water_supply.map(async (item) => {

          let where = ` where user_id ='${item.user_id}' and  water_supply_treatment_id ='${item.id}' `;
          const water_withdrawl = await getSelectedColumn("water_withdrawl_by_source", where, "*");
          item.water_withdrawl_by_source = water_withdrawl ? water_withdrawl : [];

          let where1 = ` where user_id ='${item.user_id}' and  water_supply_treatment_id ='${item.id}' `;
          const water_discharge = await getSelectedColumn("water_discharge_by_destination", where1, "*");
          item.water_discharge = water_discharge ? water_discharge : [];

        }));

      return res.json({
        success: true,
        message: "Succesfully fetched water supply treatment category",
        categories: water_supply,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Some problem occured while selecting water supply treatment category",
        status: 400,
      });
    }
    //}
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

exports.getintermediateCategory = async (req, res) => {
  try {
    let where = ` where Industry != "" and Industry != "Other" `;
    const water_supply = await getSelectedColumn("processing_of_sold_products_ef", where, "Distinct Industry");

    if (water_supply.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched processing of sold products category",
        categories: water_supply,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Some problem occured while selecting water supply treatment category",
        status: 400,
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

exports.getsectorCategory = async (req, res) => {
  try {
    const { industry } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        industry: [Joi.string().empty().required()],
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
    } else {

      let where = ` where sector != "" and Industry = '${industry}' `;
      const getSoldproduct = await getSelectedColumn("processing_of_sold_products_ef", where, "Distinct sector");


      if (getSoldproduct.length > 0) {
        return res.json({
          success: true,
          message: "Succesfully fetched processing of sold products category",
          categories: getSoldproduct,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while selecting processing of sold products category",
          status: 400,
        });
      }
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

exports.getsubsectorCategory = async (req, res) => {
  try {
    const { sector } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        sector: [Joi.string().empty().required()],
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
    } else {
      let where = ` where sub_sector != "" and Sector = '${sector}' `;
      const getSoldproduct = await getSelectedColumn("processing_of_sold_products_ef", where, "Distinct sub_sector");

      if (getSoldproduct.length > 0) {
        return res.json({
          success: true,
          message: "Succesfully fetched processing of sold products category",
          categories: getSoldproduct,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while selecting processing of sold products category",
          status: 400,
        });
      }
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

exports.Addprocessing_of_sold_productsCategory = async (req, res) => {
  try {
    const { month, year, intermediate_category, unit, calculation_method, valueofsoldintermediate,
      processing_acitivity, sub_activity, other, scope1emissions, scope2emissions, other_emission
      , facilities, batch } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        intermediate_category: [Joi.string().empty().required()],
        calculation_method: [Joi.string().empty().required()],
        valueofsoldintermediate: [Joi.string().empty().required()],
        processing_acitivity: [Joi.string().empty().required()],
        unit: [Joi.string().empty().required()],
        sub_activity: [Joi.optional().allow("")],
        other: [Joi.optional().allow("")],
        scope1emissions: [Joi.optional().allow("")],
        scope2emissions: [Joi.optional().allow("")],
        other_emission: [Joi.optional().allow("")],
        facilities: [Joi.string().empty().required()],
        batch: [Joi.string().empty().required()],
        month: [Joi.string().empty().required()],
        year: [Joi.string().empty().required()],
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
    } else {
      const user_id = req.user.user_id;

      let emission = 0;
      let unitef = 0;
      let where = "";
      let getSoldproduct = "";
      let allinsertedID = [];
      let efkgco2_inr = "";
      let efkgco2_kg = "";
      let efkgco2_litres = "";
      let efkgco2_tonnes = "";

      let countrydata = await country_check(facilities);
      //console.log(countrydata[0].CountryId);
      if (countrydata.length == 0) {
        return res.json({
          success: false,
          message: "EF not Found End of life treatment category",
          status: 400,
        });
      }
      if (valueofsoldintermediate) {
        if (processing_acitivity && intermediate_category) {
          where = ` where sector = '${processing_acitivity}' and country_id = '${countrydata[0].CountryId}' and Right(Fiscal_Year,4) = '${year}'`;
          getSoldproduct = await getSelectedColumn("processing_of_sold_products_ef", where, "*");

        } else if (processing_acitivity && intermediate_category && sub_activity) {
          where = ` where sub_sector = '${sub_activity}' and country_id = '${countrydata[0].CountryId}' and Right(Fiscal_Year,4) = '${year}'`;
          getSoldproduct = await getSelectedColumn("processing_of_sold_products_ef", where, "*");

        }

        if (getSoldproduct.length > 0) {
          let yearRange = getSoldproduct[0]?.Fiscal_Year; // The string representing the year range
          let [startYear, endYear] = yearRange.split('-').map(Number);

          if (year >= startYear && year <= endYear) {
            if (unit == 'kg') {
              unitef = getSoldproduct[0]['efkgco2_kg']
            } else if (unit == 'litres') {
              unitef = getSoldproduct[0]['efkgco2_litres']
            } else {
              unitef = getSoldproduct[0]['efkgco2_ccy']
            }
          } else if (year == startYear) {
            if (unit == 'kg') {
              unitef = getSoldproduct[0]['efkgco2_kg']
            } else if (unit == 'litres') {
              unitef = getSoldproduct[0]['efkgco2_litres']
            } else {
              unitef = getSoldproduct[0]['efkgco2_ccy']
            }
          } else {
            return res.json({
              success: false,
              message: "EF not Found for this year in fuel_type",
              status: 400,
            });
          }



        } else {
          return res.json({
            success: false,
            message: "EF not Found",
            status: 400,
          });
        }

        if (calculation_method == 'Site Specific method') {
          emission = parseFloat(scope1emissions) + parseFloat(scope2emissions) * parseFloat(valueofsoldintermediate)
        } else {
          emission = parseFloat(unitef * valueofsoldintermediate);
        }

        if (other) {
          if (unit == 'kg') {
            efkgco2_kg = other_emission
          } else if (unit == 'litres') {
            efkgco2_litres = other_emission
          } else {
            efkgco2_ccy = other_emission
          }

          const insertprocessingef = await insertprocessing_of_sold_products_ef({
            'Industry': intermediate_category,
            "sector": processing_acitivity,
            "sub_sector": sub_activity,
            efkgco2_kg: efkgco2_kg ? efkgco2_kg : "",
            efkgco2_litres: efkgco2_litres ? efkgco2_litres : "",
            efkgco2_ccy: efkgco2_ccy ? efkgco2_ccy : ""
          })
          emission = parseFloat(other_emission * valueofsoldintermediate)
        }


        console.log(emission, "emissionemissionemissionemissionemissionemission123")
        let category = {
          intermediate_category: intermediate_category ? intermediate_category : "",
          calculation_method: calculation_method ? calculation_method : "",
          valueofsoldintermediate: valueofsoldintermediate ? valueofsoldintermediate : "",
          processing_acitivity: processing_acitivity ? processing_acitivity : "",
          unit: unit ? unit : "",
          sub_activity: sub_activity ? sub_activity : "",
          scope1emissions: scope1emissions ? scope1emissions : "",
          scope2emissions: scope2emissions ? scope2emissions : "",
          facilities: facilities ? facilities : "",
          batch: batch ? batch : "",
          year: year ? year : "",
          emission: emission ? emission : 0,
          emission_factor_used: unitef ? unitef : "",
          emission_factor_unit: 'kg CO2e/' + unit,
          facilities: facilities ? facilities : "",
          user_id: user_id,
          batch: batch,
        }

        let months = JSON.parse(month);
        for (let monthdata of months) {
          category.month = monthdata;
          const processing_of_sold = await insertprocessing_of_sold_productsCategory(category);
          if (processing_of_sold.affectedRows > 0) {
            insertId = processing_of_sold.insertId
            allinsertedID.push(insertId);
          }
        }
      }

      if (allinsertedID.length > 0) {
        let where = ` where user_id =  '${user_id}' and facilities = '${facilities}'`;
        const water_supplytreatmentcategory1 = await getSelectedColumn("processing_of_sold_products_category", where, "*");
        return res.json({
          success: true,
          message: "Succesfully Added processing of sold products category",
          categories: water_supplytreatmentcategory1,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while Adding processing of sold products category",
          status: 500,
        });
      }
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

exports.getcurrencyByfacilities = async (req, res) => {
  try {
    const country_id = await country_check(req.body.facilities);

    let where = ` where ID =  '${country_id[0].CountryId}'`;
    const countrydata = await getSelectedColumn("`dbo.country`", where, "*");

    if (countrydata.length > 0) {

      return res.json({
        success: true,
        message: "Succesfully Added processing of sold products category",
        categories: countrydata[0]?.CurrencyCode,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Some problem occured while Adding processing of sold products category",
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

exports.getprocessing_of_sold_productsCategory = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    let where = ` where user_id =  '${user_id}'`;
    const processing_of_sold_productsCategory = await getSelectedColumn("processing_of_sold_products_category", where, "*");

    if (processing_of_sold_productsCategory.length > 0) {

      return res.json({
        success: true,
        message: "Succesfully Added processing of sold products category",
        categories: processing_of_sold_productsCategory,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Some problem occured while Adding processing of sold products category",
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

//////////////////////////////////////////////////////////

exports.GetSubCategoryTypes = async (req, res) => {
  try {

    const { id } = req.params;
    const schema = Joi.alternatives(
      Joi.object({
        id: [Joi.number().empty().required()],
      })
    );
    const result = schema.validate(req.params);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 200,
        success: false,
      });
    } else {

      const authHeader = req.headers.auth;
      const jwtToken = authHeader.replace("Bearer ", "");
      const decoded = jwt.decode(jwtToken);
      const user_id = decoded.user_id;

      let where = ` where SubCategorySeedID ='${id}'`;
      const soldproductFuelType = await getSelectedColumn("stationarycombustion", where, "*");


      if (soldproductFuelType.length > 0) {
        return res.json({
          success: true,
          message: "Succesfully fetched sold product Fuel Type",
          categories: soldproductFuelType,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while selecting sold product Fuel Type",
          status: 400,
        });
      }
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

exports.Getfacilities = async (req, res) => {
  try {

    const authHeader = req.headers.auth;
    const jwtToken = authHeader.replace("Bearer ", "");
    const decoded = jwt.decode(jwtToken);
    const user_id = decoded.user_id;

    let where = " LEFT JOIN  `dbo.city` C ON C.ID = F.CityId LEFT JOIN  `dbo.country` CO ON CO.ID = F.CountryId  LEFT JOIN  `dbo.state` S ON S.ID = F.StateId ";
    const facilities = await getSelectedColumn("`dbo.facilities` F ", where, " C.Name as city_name,CO.Name as country_name,S.Name as state_name,F.*");


    if (facilities.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched facilities",
        categories: facilities,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Some problem occured while selecting facilities",
        status: 400,
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

exports.GetScope = async (req, res) => {
  try {

    const authHeader = req.headers.auth;
    const jwtToken = authHeader.replace("Bearer ", "");
    const decoded = jwt.decode(jwtToken);
    const user_id = decoded.user_id;

    let where = "";
    const scopeseed = await getSelectedColumn("`dbo.scopeseed` ", where, " *");


    if (scopeseed.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched scopeseed",
        categories: scopeseed,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Some problem occured while selecting scopeseed",
        status: 400,
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

exports.GetAllcategoryByScope = async (req, res) => {
  try {

    const { ScopeID } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        ScopeID: [Joi.number().empty().required()],
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
    } else {

      const authHeader = req.headers.auth;
      const jwtToken = authHeader.replace("Bearer ", "");
      const decoded = jwt.decode(jwtToken);
      const user_id = decoded.user_id;

      let where = ` where ScopeId ='${ScopeID}'`;
      const category = await getSelectedColumn("`dbo.categoryseeddata`", where, "*");
      await Promise.all(
        category.map(async (item) => {
          let where = ` where CategorySeedDataId ='${item.Id}'`;
          const category1 = await getSelectedColumn("`dbo.subcategoryseeddata`", where, "*");
          item.subCategory = category1;
        }));

      if (category.length > 0) {
        return res.json({
          success: true,
          message: "Succesfully fetched category",
          categories: category,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while selecting category",
          status: 400,
        });
      }
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

exports.getAssignedDataPointbyfacility = async (req, res) => {
  try {

    const { facilityId } = req.params;
    const schema = Joi.alternatives(
      Joi.object({
        facilityId: [Joi.number().empty().required()],
      })
    );
    const result = schema.validate(req.params);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 200,
        success: false,
      });
    } else {

      const authHeader = req.headers.auth;
      const jwtToken = authHeader.replace("Bearer ", "");
      const decoded = jwt.decode(jwtToken);
      const user_id = decoded.user_id;

      let where = " where MD.facilityId = '" + facilityId + "'";
      const facilities = await getSelectedColumn("`dbo.managedatapoint` MD  ", where, "MD.*,S.ScopeName");

      await Promise.all(
        facilities.map(async (item) => {
          let where = " JOIN `dbo.categoryseeddata` C ON  MD.ManageDataPointCategorySeedID = C.Id  where  MD.ManageDataPointId = '" + item.ID + "'";
          const managePointCategories = await getSelectedColumn("`dbo.managedatapointcategory` MD ", where, "C.CatName,MD.*");

          item.manageDataPointCategories = managePointCategories;

          await Promise.all(
            managePointCategories.map(async (item1) => {
              let where1 = " LEFT JOIN `dbo.subcategoryseeddata` C ON  MD.ManageDataPointSubCategorySeedID = C.Id  where  MD.ManageDataPointCategoriesId = '" + item1.ID + "'";
              item1.manageDataPointSubCategories = await getSelectedColumn("`dbo.managedatapointsubcategory` MD ", where1, "C.Item as subCatName,MD.*");
            })
          );
        })
      );
      if (facilities.length > 0) {
        return res.json({
          success: true,
          message: "Succesfully fetched facilities",
          categories: facilities,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while selecting facilities",
          status: 400,
        });
      }
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

exports.AddassignedDataPointbyfacility = async (req, res) => {
  try {
    const { ScopeID, FacilityId, FiscalYear, category } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        ScopeID: [Joi.string().empty().required()],
        FacilityId: [Joi.string().empty().required()],
        FiscalYear: [Joi.string().empty().required()],
        category: [Joi.string().empty().required()],
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
    } else {
      const authHeader = req.headers.auth;
      const jwtToken = authHeader.replace("Bearer ", "");
      const decoded = jwt.decode(jwtToken);
      const user_id = decoded.user_id;

      let category = {
        ScopeID: ScopeID ? ScopeID : "",
        FacilityId: FacilityId ? FacilityId : "",
        FiscalYear: FiscalYear ? FiscalYear : "",
        category: category ? category : "",
        user_id: user_id
      }


      const processing_of_sold = await Addassignedmanagedatapoint(category);


      if (processing_of_sold.length > 0) {

        let where = ` where user_id =  '${user_id}' and facilities = '${facilities}'`;
        const water_supplytreatmentcategory1 = await getSelectedColumn("processing_of_sold_products_category", where, "*");
        return res.json({
          success: true,
          message: "Succesfully Added processing of sold products category",
          categories: water_supplytreatmentcategory1,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while Adding processing of sold products category",
          status: 500,
        });
      }
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

exports.AddstationarycombustionLiquid = async (req, res) => {
  try {
    const { ReadingValue, Unit, Note, Year, Month, BlendType, BlendID } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        ReadingValue: [Joi.string().empty().required()],
        Unit: [Joi.string().empty().required()],
        Note: [Joi.string().empty().required()],
        Year: [Joi.string().empty().required()],
        Month: [Joi.string().empty().required()],
        BlendType: [Joi.optional().allow("")],
        BlendID: [Joi.optional().allow("")],
        facilities: [Joi.string().empty().required()],
        batch: [Joi.string().empty().required()],
        TypeID: [Joi.string().empty().required()], //
        TypeName: [Joi.string().empty().required()],
        year: [Joi.string().empty().required()],
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
    } else {
      const authHeader = req.headers.auth;
      const jwtToken = authHeader.replace("Bearer ", "");
      const decoded = jwt.decode(jwtToken);
      const user_id = decoded.user_id;

      let emission = 0;
      let unitef = 0;
      let where = "";
      let getSoldproduct = "";
      let allinsertedID = [];
      let efkgco2_inr = "";
      let efkgco2_kg = "";
      let efkgco2_litres = "";
      let efkgco2_tonnes = "";

      if (valueofsoldintermediate) {

        if (processing_acitivity && intermediate_category) {
          where = ` where sector = '${processing_acitivity}'`;
          getSoldproduct = await getSelectedColumn("processing_of_sold_products_ef", where, "*");
        } else if (processing_acitivity && intermediate_category && sub_activity) {
          where = ` where sub_sector = '${sub_activity}' `;
          getSoldproduct = await getSelectedColumn("processing_of_sold_products_ef", where, "*");
        }

        if (getSoldproduct.length > 0) {
          if (unit == 'INR') {
            unitef = getSoldproduct[0]['efkgco2_inr']
          } else if (unit == 'kg') {
            unitef = getSoldproduct[0]['efkgco2_kg']
          }
          else if (unit == 'lites') {
            unitef = getSoldproduct[0]['efkgco2_litres']
          } else {
            unitef = getSoldproduct[0]['efkgco2_tonnes']
          }
        }

        if (unitef != 0) {
          emission = parseFloat(unitef * valueofsoldintermediate);
        } else {
          emission = 0;
        }

        if (calculation_method == 'Site Specific method') {
          emission = parseFloat(scope1emissions + scope2emissions) * valueofsoldintermediate
        }

        if (other) {

          if (unit == 'INR') {
            efkgco2_inr = other_emission
          } else if (unit == 'kg') {
            efkgco2_kg = other_emission
          }
          else if (unit == 'lites') {
            efkgco2_litres = other_emission
          } else {
            efkgco2_tonnes = other_emission
          }

          const insertprocessingef = await insertprocessing_of_sold_products_ef({
            'Industry': intermediate_category,
            "sector": processing_acitivity,
            "sub_sector": sub_activity,
            efkgco2_inr: efkgco2_inr ? efkgco2_inr : "",
            efkgco2_kg: efkgco2_kg ? efkgco2_kg : "",
            efkgco2_litres: efkgco2_litres ? efkgco2_litres : "",
            efkgco2_tonnes: efkgco2_tonnes ? efkgco2_tonnes : ""
          })

          emission = parseFloat(other_emission * valueofsoldintermediate)
        }

        let category = {
          intermediate_category: intermediate_category ? intermediate_category : "",
          calculation_method: calculation_method ? calculation_method : "",
          valueofsoldintermediate: valueofsoldintermediate ? valueofsoldintermediate : "",
          processing_acitivity: processing_acitivity ? processing_acitivity : "",
          unit: unit ? unit : "",
          sub_activity: sub_activity ? sub_activity : "",
          scope1emissions: scope1emissions ? scope1emissions : "",
          scope2emissions: scope2emissions ? scope2emissions : "",
          facilities: facilities ? facilities : "",
          batch: batch ? batch : "",
          year: year ? year : "",
          emission: emission ? emission : 0,
          facilities: facilities ? facilities : "",
          user_id: user_id,
          batch: batch,
        }


        let months = JSON.parse(month);
        for (let monthdata of months) {
          category.month = monthdata;
          const processing_of_sold = await insertprocessing_of_sold_productsCategory(category);
          if (processing_of_sold.affectedRows > 0) {
            insertId = processing_of_sold.insertId
            allinsertedID.push(insertId);
          }
        }
      }

      if (allinsertedID.length > 0) {

        let where = ` where user_id =  '${user_id}' and facilities = '${facilities}'`;
        const water_supplytreatmentcategory1 = await getSelectedColumn("processing_of_sold_products_category", where, "*");
        return res.json({
          success: true,
          message: "Succesfully Added processing of sold products category",
          categories: water_supplytreatmentcategory1,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while Adding processing of sold products category",
          status: 500,
        });
      }
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

exports.vehicleCategories_lease = async (req, res) => {
  try {
    let where = " where  lease_status = '1' ORDER BY vehicle_type ASC";
    const vehicleDetails = await getData("vehicletypes", where);
    if (vehicleDetails.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched the batch ids",
        categories: vehicleDetails,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Some problem occured while selecting the batch ids",
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

exports.vehicleSubCategories_lease = async (req, res) => {
  try {
    const { id, facility_id } = req.query;
    let countrydata = await country_check(facility_id);
    let where = `where vehicle_category_id = ${id} AND country_id = ${countrydata[0].CountryId} GROUP BY vehicle_type`;
    const vehicleDetails = await getData("vehicle_subcategory", where);
    if (vehicleDetails.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched the Vehicle details",
        categories: vehicleDetails,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Some problem occured while selecting the batch ids",
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

exports.employeeCommunityCategory = async (req, res) => {
  try {
    const { facility_id } = req.query;

    const schema = Joi.object({
      facility_id: Joi.number().required(),
    });

    const result = schema.validate(req.query);

    if (result.error) {
      const messages = result.error.details.map((i) => i.message);
      return res.status(400).json({
        message: messages[0],
        error: messages.join(", "),
        missingParams: messages,
        status: 400,
        success: false,
      });
    }
    const country = await country_check(facility_id);
    let where = `where id != 0 AND country_id = '${country[0].CountryId}' GROUP BY category `;
    const vehicletype = await getSelectedColumn("employee_community_typeoftransport", where, "MIN(category_id) as id ,category ");
    if (vehicletype.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched vehicle types",
        batchIds: vehicletype,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Some problem occured while selecting vehicle types",
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

exports.employeeCommunitySubCategory = async (req, res) => {
  try {

    const { category, facility_id, year } = req.params;

    const schema = Joi.alternatives(
      Joi.object({
        category: [Joi.string().empty().required()],
        facility_id: [Joi.string().empty().required()],
        year: [Joi.string().empty().required()],
      })
    );
    const result = schema.validate(req.params);
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
    const country = await country_check(facility_id);
    let where = ` where category_id = '${category}' AND country_id = '${country[0].CountryId}' and Right(Fiscal_Year, 4) = '${year}'`;
    const vehicletype = await getSelectedColumn("employee_community_typeoftransport", where, "subcategory,id");
    if (vehicletype.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched vehicle types",
        batchIds: vehicletype,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Sub category not found",
        status: 200,
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