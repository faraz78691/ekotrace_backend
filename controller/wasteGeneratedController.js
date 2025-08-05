const Joi = require("joi");
const config = require("../config");
const jwt = require("jsonwebtoken");

const { getSelectedData, getData, country_check, getSelectedColumn } = require("../models/common");

const {
  fetchWasteEmission,
  insertWasteGeneratedEmission,
  getDataProgressWaterWithdrawal,
  getDataProgressWaterDischarge,
  getDataProgressHeatandSteam,
  getDataProgressElecricity,
  getDataProgressFireExtinguisher,
  getDataProgressRefrigerant,
  getDataProgressProOfSoldGoods,
  getDataProgressEndOfLifeTreatment,
  getDataProgressSoldProduct,
  getDataProgressHotelStay,
  getDataProgressOtherTransport,
  getDataProgressFlightTravel,
  getDataProgressWasteGenerated,
  getDataProgressDownstreamLeaseEmission,
  getDataProgressUpstreamLeaseEmission,
  getDataProgressInvestmentEmission,
  getDataProgressFranchiseEmission,
  getDataProgressUpStreamVehicle,
  getDataProgressDownStreamVehicle,
  getDataProgressCompanyOwnedVehicles,
  getDataProgressPurchaseGoods,
  getDataProgressStationaryCombustion,
  getDataProgressHomeOffice,
  getDataProgressEmployeeCommuting
} = require("../models/wasteGenerated");

const { checkNUllUnD } = require("../services/helper");

exports.wasteGeneratedEmission = async (req, res) => {
  try {
    const {
      months,
      year,
      product,
      waste_type,
      waste_loop,
      method,
      total_waste,
      unit,
      id,
      facility_id,
    } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        months: [Joi.string().required().empty()],
        year: [Joi.string().required().empty()],
        id: [Joi.number().optional().empty()],
        product: [Joi.string().required().empty()],
        waste_type: [Joi.string().optional().empty()],
        method: [Joi.string().optional().empty()],
        total_waste: [Joi.number().optional().empty()],
        unit: [Joi.string().optional().empty()],
        facility_id: [Joi.number().required().empty()],
        waste_loop: [Joi.number().optional().empty()],
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
    var monthsArr = JSON.parse(months);
    //Check Waste Data
    wasteGeneratedData = {
      user_id: user_id,
      product: product,
      waste_type_id: id,
      waste_type: waste_type,
      total_waste: total_waste,
      method: method,
      emission: 0,
      month: "",
      year: year,
      unit: unit,
      facility_id: facility_id,
      waste_loop: waste_loop ? waste_loop : 0,
    };
    let countrydata = await country_check(facility_id);
    //console.log(countrydata[0].CountryId);
    if (countrydata.length == 0) {
      return res.json({
        success: false,
        message: "EF not Found while Adding Waste Generated Emissions",
        status: 400,
      });
    }
    const emissionDetails = await fetchWasteEmission(
      method,
      id,
      waste_type,
      countrydata[0].CountryId,
      year
    );
    console.log(emissionDetails);
    if (emissionDetails.length > 0) {
      const ef = emissionDetails[0].ef;
      let totalEmission = Number(ef) * Number(total_waste);
      wasteGeneratedData.emission_factor_useed = ef;
      wasteGeneratedData.emission_factor_unit = 'kg CO2e/kg';
      wasteGeneratedData.emission = totalEmission;

      // if (year >= startYear && year <= endYear) {
      //   const ef = emissionDetails[0].ef;
        
      //   let totalEmission = Number(ef) * Number(total_waste);
      //   wasteGeneratedData.emission_factor_useed = ef;
      //   wasteGeneratedData.emission_factor_unit = 'kg CO2e/kg';
      //   wasteGeneratedData.emission = totalEmission;
      // } else if (year == startYear) {
       
      // } else {
      //   return res.json({
      //     success: false,
      //     message: "EF not Found for this year",
      //     status: 400,
      //   });
      // }
    } else {
      return res.json({
        success: false,
        message: "EF not Found for this year",
        status: 400,
      });
    }

    for (let month of monthsArr) {
      wasteGeneratedData.month = month;
      var tempInserted = await insertWasteGeneratedEmission(wasteGeneratedData);
      resultInserted.push(tempInserted.insertId);
    }
    //Check Vehicle Data as well
    if (resultInserted.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully generated Waste Generated Emissions",
        wasteGeneratedData: wasteGeneratedData,
        insertIds: resultInserted,
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

exports.getwasteGeneratedEmission = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    let where = `where user_id = '${user_id}'`;
    const upLeaseEmissionDetails = await getData(
      "waste_generated_emissions",
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

const dataProgress = async (facilities, scopeObject) => {
  try {
    var expectedOutput = {
      Jan: 0,
      Feb: 0,
      Mar: 0,
      Apr: 0,
      May: 0,
      Jun: 0,
      Jul: 0,
      Aug: 0,
      Sep: 0,
      Oct: 0,
      Nov: 0,
      Dec: 0,
    };
    var DataProgress = [];
    var stationaryCombustion = { ...expectedOutput };
    var count = 0;
    const d = new Date();
    var currentYear = d.getFullYear();
    var Monthprogress = await getDataProgressStationaryCombustion(
      currentYear,
      facilities
    );
    if (Monthprogress.length > 0) {
      for (let key in stationaryCombustion) {
        Monthprogress.find((elem) => {
          if (elem.month == key) {
            stationaryCombustion[key] = 1;
            count++;
          }
        });
      }
      var percentage = ((count / 12) * 100).toFixed(2);
      scopeObject.scope1 += Number(percentage);
      DataProgress.push({
        category: "Stationary Combustion",
        data: stationaryCombustion,
        percentage: percentage,
        scope: "scope_1"
      });
    } else {
      DataProgress.push({
        category: "Stationary Combustion",
        data: [],
        percentage: 0,
        scope: "scope_1"
      });
    }

    var purchaseGoods = { ...expectedOutput };
    count = 0;
    var Monthprogress = await getDataProgressPurchaseGoods(
      currentYear,
      facilities
    );
    if (Monthprogress.length > 0) {
      for (let key in purchaseGoods) {
        Monthprogress.find((elem) => {
          if (elem.month == key) {
            purchaseGoods[key] = 1;
            count++;
          }
        });
      }
      var percentage = ((count / 12) * 100).toFixed(2);
      scopeObject.scope3 += Number(percentage);
      DataProgress.push({
        category: "Purchased goods and services",
        data: purchaseGoods,
        percentage: percentage,
        scope: "scope_3"
      });
    } else {
      DataProgress.push({
        category: "Purchased goods and services",
        data: [],
        percentage: 0,
        scope: "scope_3"
      });
    }

    var companyOwnedVehicles = { ...expectedOutput };
    count = 0;
    var Monthprogress = await getDataProgressCompanyOwnedVehicles(
      currentYear,
      facilities
    );
    if (Monthprogress.length > 0) {
      for (let key in companyOwnedVehicles) {
        Monthprogress.find((elem) => {
          if (elem.month == key) {
            companyOwnedVehicles[key] = 1;
            count++;
          }
        });
      }
      var percentage = ((count / 12) * 100).toFixed(2);
      scopeObject.scope1 += Number(percentage);
      DataProgress.push({
        category: "Company Owned Vehicles",
        data: companyOwnedVehicles,
        percentage: percentage,
        scope: "scope_1"
      });
    } else {
      DataProgress.push({
        category: "Company Owned Vehicles",
        data: [],
        percentage: 0,
        scope: "scope_1"
      });
    }

    var downStreamVehicles = { ...expectedOutput };
    count = 0;
    var Monthprogress = await getDataProgressDownStreamVehicle(
      currentYear,
      facilities
    );
    if (Monthprogress.length > 0) {
      for (let key in downStreamVehicles) {
        Monthprogress.find((elem) => {
          if (elem.month == key) {
            downStreamVehicles[key] = 1;
            count++;
          }
        });
      }
      var percentage = ((count / 12) * 100).toFixed(2);
      scopeObject.scope3 += Number(percentage);
      DataProgress.push({
        category: "Downstream Transportation and Distribution",
        data: downStreamVehicles,
        percentage: percentage,
        scope: "scope_3"
      });
    } else {
      DataProgress.push({
        category: "Downstream Transportation and Distribution",
        data: [],
        percentage: 0,
        scope: "scope_3"
      });
    }

    var upStreamVehicles = { ...expectedOutput };
    count = 0;
    var Monthprogress = await getDataProgressUpStreamVehicle(
      currentYear,
      facilities
    );
    if (Monthprogress.length > 0) {
      for (let key in upStreamVehicles) {
        Monthprogress.find((elem) => {
          if (elem.month == key) {
            upStreamVehicles[key] = 1;
            count++;
          }
        });
      }
      var percentage = ((count / 12) * 100).toFixed(2);
      scopeObject.scope3 += Number(percentage);
      DataProgress.push({
        category: "Upstream Transportation and Distribution",
        data: upStreamVehicles,
        percentage: percentage,
        scope: "scope_3"
      });
    } else {
      DataProgress.push({
        category: "Upstream Transportation and Distribution",
        data: [],
        percentage: 0,
        scope: "scope_3"
      });
    }

    var franchiseEmission = { ...expectedOutput };
    count = 0;
    var Monthprogress = await getDataProgressFranchiseEmission(
      currentYear,
      facilities
    );
    if (Monthprogress.length > 0) {
      for (let key in franchiseEmission) {
        Monthprogress.find((elem) => {
          if (elem.month == key) {
            franchiseEmission[key] = 1;
            count++;
          }
        });
      }
      var percentage = ((count / 12) * 100).toFixed(2);
      scopeObject.scope3 += Number(percentage);
      DataProgress.push({
        category: "Franchises",
        data: franchiseEmission,
        percentage: percentage,
        scope: "scope_3"
      });
    } else {
      DataProgress.push({
        category: "Franchises",
        data: [],
        percentage: 0,
        scope: "scope_3"
      });
    }

    var investmentEmission = { ...expectedOutput };
    count = 0;
    var Monthprogress = await getDataProgressInvestmentEmission(
      currentYear,
      facilities
    );
    if (Monthprogress.length > 0) {
      for (let key in investmentEmission) {
        Monthprogress.find((elem) => {
          if (elem.month == key) {
            investmentEmission[key] = 1;
            count++;
          }
        });
      }
      var percentage = ((count / 12) * 100).toFixed(2);
      scopeObject.scope3 += Number(percentage);
      DataProgress.push({
        category: "Investment Emissions",
        data: investmentEmission,
        percentage: percentage,
        scope: "scope_3"
      });
    } else {
      DataProgress.push({
        category: "Investment Emissions",
        data: [],
        percentage: 0,
        scope: "scope_3"
      });
    }

    var upStreamLeaseEmission = { ...expectedOutput };
    count = 0;
    var Monthprogress = await getDataProgressUpstreamLeaseEmission(
      currentYear,
      facilities
    );
    if (Monthprogress.length > 0) {
      for (let key in upStreamLeaseEmission) {
        Monthprogress.find((elem) => {
          if (elem.month == key) {
            upStreamLeaseEmission[key] = 1;
            count++;
          }
        });
      }
      var percentage = ((count / 12) * 100).toFixed(2);
      scopeObject.scope3 += Number(percentage);
      DataProgress.push({
        category: "Upstream Leased Assets",
        data: upStreamLeaseEmission,
        percentage: percentage,
        scope: "scope_3"
      });
    } else {
      DataProgress.push({
        category: "Upstream Leased Assets",
        data: [],
        percentage: 0,
        scope: "scope_3"
      });
    }

    var downStreamLeaseEmission = { ...expectedOutput };
    count = 0;
    var Monthprogress = await getDataProgressDownstreamLeaseEmission(
      currentYear,
      facilities
    );
    if (Monthprogress.length > 0) {
      for (let key in downStreamLeaseEmission) {
        Monthprogress.find((elem) => {
          if (elem.month == key) {
            downStreamLeaseEmission[key] = 1;
            count++;
          }
        });
      }
      var percentage = ((count / 12) * 100).toFixed(2);
      scopeObject.scope3 += Number(percentage);
      DataProgress.push({
        category: "Downstream Leased Assets",
        data: downStreamLeaseEmission,
        percentage: percentage,
        scope: "scope_3"
      });
    } else {
      DataProgress.push({
        category: "Downstream Leased Assets",
        data: [],
        percentage: 0,
        scope: "scope_3"
      });
    }

    var wasteGenerated = { ...expectedOutput };
    count = 0;
    var Monthprogress = await getDataProgressWasteGenerated(
      currentYear,
      facilities
    );
    if (Monthprogress.length > 0) {
      for (let key in wasteGenerated) {
        Monthprogress.find((elem) => {
          if (elem.month == key) {
            wasteGenerated[key] = 1;
            count++;
          }
        });
      }
      var percentage = ((count / 12) * 100).toFixed(2);
      scopeObject.scope3 += Number(percentage);
      DataProgress.push({
        category: "Waste generated in operations",
        data: wasteGenerated,
        percentage: percentage,
        scope: "scope_3"
      });
    } else {
      DataProgress.push({
        category: "Waste generated in operations",
        data: [],
        percentage: 0,
        scope: "scope_3"
      });
    }

    var flightTravel = { ...expectedOutput };
    count = 0;
    var Monthprogress = await getDataProgressFlightTravel(
      currentYear,
      facilities
    );
    if (Monthprogress.length > 0) {
      for (let key in flightTravel) {
        Monthprogress.find((elem) => {
          if (elem.month == key) {
            flightTravel[key] = 1;
            count++;
          }
        });
      }
      var percentage = ((count / 12) * 100).toFixed(2);
      scopeObject.scope3 += Number(percentage);
      DataProgress.push({
        category: "Business Travel",
        data: flightTravel,
        percentage: percentage,
        scope: "scope_3"
      });
    } else {
      DataProgress.push({
        category: "Business Travel",
        data: [],
        percentage: 0,
        scope: "scope_3"
      });
    }

    var otherTransport = { ...expectedOutput };
    count = 0;
    var Monthprogress = await getDataProgressOtherTransport(
      currentYear,
      facilities
    );
    if (Monthprogress.length > 0) {
      for (let key in otherTransport) {
        Monthprogress.find((elem) => {
          if (elem.month == key) {
            otherTransport[key] = 1;
            count++;
          }
        });
      }
      var percentage = ((count / 12) * 100).toFixed(2);
      scopeObject.scope3 += Number(percentage);
      DataProgress.push({
        category: "Other Transport",
        data: otherTransport,
        percentage: percentage,
        scope: "scope_3"
      });
    } else {
      DataProgress.push({
        category: "Other Transport",
        data: [],
        percentage: 0,
        scope: "scope_3"
      });
    }

    var hotelStay = { ...expectedOutput };
    count = 0;
    var Monthprogress = await getDataProgressHotelStay(currentYear, facilities);
    if (Monthprogress.length > 0) {
      for (let key in hotelStay) {
        Monthprogress.find((elem) => {
          if (elem.month == key) {
            hotelStay[key] = 1;
            count++;
          }
        });
      }
      var percentage = ((count / 12) * 100).toFixed(2);
      scopeObject.scope3 += Number(percentage);
      DataProgress.push({
        category: "Hotel Stay",
        data: hotelStay,
        percentage: percentage,
        scope: "scope_3"
      });
    } else {
      DataProgress.push({ category: "Hotel Stay", data: [], percentage: 0, scope: "scope_3" });
    }


    var homeOffice = { ...expectedOutput };
    count = 0;
    var Monthprogress = await getDataProgressHomeOffice(currentYear, facilities);

    if (Monthprogress.length > 0) {
      let hasAnyMonth = false;

      for (let key in homeOffice) {
        const match = Monthprogress.find((elem) => elem.month == key);
        if (match) {
          hasAnyMonth = true;
          break;
        }
      }

      if (hasAnyMonth) {
        for (let key in homeOffice) {
          homeOffice[key] = 1;
        }
        var percentage = 100;
        scopeObject.scope3 += Number(percentage);
      } else {
        var percentage = 0;
      }

      DataProgress.push({
        category: "Home Office",
        data: homeOffice,
        percentage: percentage,
        scope: "scope_3"
      });
    } else {
      DataProgress.push({ category: "Home Office", data: [], percentage: 0, scope: "scope_3" });
    }

    var employeeCommuting = { ...expectedOutput };
    count = 0;
    var Monthprogress = await getDataProgressEmployeeCommuting(currentYear, facilities);

    if (Monthprogress.length > 0) {
      let hasAnyMonth = false;

      for (let key in employeeCommuting) {
        const match = Monthprogress.find((elem) => elem.month == key);
        if (match) {
          hasAnyMonth = true;
          break;
        }
      }

      let percentage = 0;
      if (hasAnyMonth) {
        for (let key in employeeCommuting) {
          employeeCommuting[key] = 1;
        }
        percentage = 100;
        scopeObject.scope3 += percentage;
      }

      DataProgress.push({
        category: "Employee Commuting",
        data: employeeCommuting,
        percentage: percentage,
        scope: "scope_3"
      });
    } else {
      DataProgress.push({ category: "Employee Commuting", data: [], percentage: 0, scope: "scope_3" });
    }

    var soldProducts = { ...expectedOutput };
    count = 0;
    var Monthprogress = await getDataProgressSoldProduct(
      currentYear,
      facilities
    );
    if (Monthprogress.length > 0) {
      for (let key in soldProducts) {
        Monthprogress.find((elem) => {
          if (elem.month == key) {
            soldProducts[key] = 1;
            count++;
          }
        });
      }
      var percentage = ((count / 12) * 100).toFixed(2);
      scopeObject.scope3 += Number(percentage);
      DataProgress.push({
        category: "Use of Sold Products",
        data: soldProducts,
        percentage: percentage,
        scope: "scope_3"
      });
    } else {
      DataProgress.push({ category: "Use of Sold Products", data: [], percentage: 0, scope: "scope_3" });
    }

    var endOfLifeTreatment = { ...expectedOutput };
    count = 0;
    var Monthprogress = await getDataProgressEndOfLifeTreatment(
      currentYear,
      facilities
    );
    if (Monthprogress.length > 0) {
      for (let key in endOfLifeTreatment) {
        Monthprogress.find((elem) => {
          if (elem.month == key) {
            endOfLifeTreatment[key] = 1;
            count++;
          }
        });
      }
      var percentage = ((count / 12) * 100).toFixed(2);
      scopeObject.scope3 += Number(percentage);
      DataProgress.push({
        category: "End-of-Life Treatment of Sold Products",
        data: endOfLifeTreatment,
        percentage: percentage,
        scope: "scope_3"
      });
    } else {
      DataProgress.push({
        category: "End-of-Life Treatment of Sold Products",
        data: [],
        percentage: 0,
        scope: "scope_3"
      });
    }

    var soldGoods = { ...expectedOutput };
    count = 0;
    var Monthprogress = await getDataProgressProOfSoldGoods(
      currentYear,
      facilities
    );
    if (Monthprogress.length > 0) {
      for (let key in soldGoods) {
        Monthprogress.find((elem) => {
          if (elem.month == key) {
            soldGoods[key] = 1;
            count++;
          }
        });
      }
      var percentage = ((count / 12) * 100).toFixed(2);
      scopeObject.scope3 += Number(percentage);
      DataProgress.push({
        category: "Processing of Sold Products",
        data: soldGoods,
        percentage: percentage,
        scope: "scope_3"
      });
    } else {
      DataProgress.push({
        category: "Processing of Sold Products",
        data: [],
        percentage: 0,
        scope: "scope_3"
      });
    }

    var refrigeRant = { ...expectedOutput };
    count = 0;
    var Monthprogress = await getDataProgressRefrigerant(
      currentYear,
      facilities
    );
    if (Monthprogress.length > 0) {
      for (let key in refrigeRant) {
        Monthprogress.find((elem) => {
          if (elem.month == key) {
            refrigeRant[key] = 1;
            count++;
          }
        });
      }
      var percentage = ((count / 12) * 100).toFixed(2);
      scopeObject.scope1 += Number(percentage);
      DataProgress.push({
        category: "Refrigerants",
        data: refrigeRant,
        percentage: percentage,
        scope: "scope_1"
      });
    } else {
      DataProgress.push({ category: "Refrigerants", data: [], percentage: 0, scope: "scope_1" });
    }

    var fireExtinguisher = { ...expectedOutput };
    count = 0;
    var Monthprogress = await getDataProgressFireExtinguisher(
      currentYear,
      facilities
    );
    if (Monthprogress.length > 0) {
      for (let key in fireExtinguisher) {
        Monthprogress.find((elem) => {
          if (elem.month == key) {
            fireExtinguisher[key] = 1;
            count++;
          }
        });
      }
      var percentage = ((count / 12) * 100).toFixed(2);
      scopeObject.scope1 += Number(percentage);
      DataProgress.push({
        category: "Fire Extinguisher",
        data: fireExtinguisher,
        percentage: percentage,
        scope: "scope_1"
      });
    } else {
      DataProgress.push({
        category: "Fire Extinguisher",
        data: [],
        percentage: 0,
        scope: "scope_1"
      });
    }

    var electricity = { ...expectedOutput };
    count = 0;
    var Monthprogress = await getDataProgressElecricity(
      currentYear,
      facilities
    );

    if (Monthprogress.length > 0) {
      for (let key in electricity) {
        Monthprogress.find((elem) => {
          if (elem.months == key) {
            electricity[key] = 1;
            count++;
          }
        });
      }
      var percentage = ((count / 12) * 100).toFixed(2);
      scopeObject.scope2 += Number(percentage);
      DataProgress.push({
        category: "Electricity",
        data: electricity,
        percentage: percentage,
        scope: "scope_2"
      });
    } else {
      DataProgress.push({
        category: "Electricity",
        data: [],
        percentage: 0,
        scope: "scope_2"
      });
    }

    var heatAndSteam = { ...expectedOutput };
    count = 0;
    var Monthprogress = await getDataProgressHeatandSteam(
      currentYear,
      facilities
    );

    if (Monthprogress.length > 0) {
      for (let key in heatAndSteam) {
        Monthprogress.find((elem) => {
          if (elem.months == key) {
            heatAndSteam[key] = 1;
            count++;
          }
        });
      }
      var percentage = ((count / 12) * 100).toFixed(2);
      scopeObject.scope2 += percentage;
      DataProgress.push({
        category: "Heat and Steam",
        data: heatAndSteam,
        percentage: percentage,
        scope: "scope_2"
      });
    } else {
      DataProgress.push({
        category: "Heat and Steam",
        data: [],
        percentage: 0,
        scope: "scope_2"
      });
    }

    var waterDischarge = { ...expectedOutput };
    count = 0;
    var Monthprogress = await getDataProgressWaterDischarge(
      currentYear,
      facilities
    );
    if (Monthprogress.length > 0) {
      for (let key in waterDischarge) {
        Monthprogress.find((elem) => {
          if (elem.month == key) {
            waterDischarge[key] = 1;
            count++;
          }
        });
      }
      var percentage = ((count / 12) * 100).toFixed(2);
      scopeObject.scope3 += Number(percentage);
      DataProgress.push({
        category: "Water Supply and Treatment",
        data: waterDischarge,
        percentage: percentage,
        scope: "scope_3"
      });
    } else {
      DataProgress.push({
        category: "Water Supply and Treatment",
        data: [],
        percentage: 0,
        scope: "scope_3"
      });
    }

    var waterWithdrawal = { ...expectedOutput };
    count = 0;
    var Monthprogress = await getDataProgressWaterWithdrawal(
      currentYear,
      facilities
    );
    if (Monthprogress.length > 0) {
      for (let key in waterWithdrawal) {
        Monthprogress.find((elem) => {
          if (elem.month == key) {
            waterWithdrawal[key] = 1;
            count++;
          }
        });
      }
      var percentage = ((count / 12) * 100).toFixed(2);
      scopeObject.scope3 += Number(percentage);
      DataProgress.push({
        category: "Water Withdrawal",
        data: waterWithdrawal,
        percentage: percentage,
        scope: "scope_3"
      });
    } else {
      DataProgress.push({
        category: "Water Withdrawal",
        data: [],
        percentage: 0,
        scope: "scope_3"
      });
    }

    return DataProgress;
  } catch (err) {
    console.log(err);
    return err;
  }
};

exports.getDataProgress = async (req, res) => {
  try {
    const { facilities } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facilities: [Joi.string().required().empty()],
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

    var scopeObject = {}
    scopeObject.scope1 = 0;
    scopeObject.scope2 = 0;
    scopeObject.scope3 = 0;
    var DataProgress = await dataProgress(facilities, scopeObject);
    if (DataProgress.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully generated Waste Generated Emissions",
        DataProgress: DataProgress,
        scopeObject: scopeObject,
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

exports.getDataProgressForFacilities = async (req, res) => {
  try {
    const { facilities } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facilities: [Joi.string().required().empty()],
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

    let facilityArray = facilities.split(",");
    var FinalProgress = [];

    for (const element of facilityArray) {
      let scopeObject = { scope1: 0, scope2: 0, scope3: 0 };
      const DataProgress = await dataProgress(element, scopeObject);
      let array = [];

      let where = ` LEFT JOIN \`dbo.scopeseed\` S ON S.ID = MD.ScopeID WHERE MD.facilityId = '${element}' ORDER BY MD.ScopeID ASC`;
      const facilities = await getSelectedColumn(
        "`dbo.managedatapoint` MD",
        where,
        "MD.*, S.scopeName"
      );

      await Promise.all(
        facilities.map(async (item) => {
          let where = ` JOIN \`dbo.categoryseeddata\` C ON MD.ManageDataPointCategorySeedID = C.Id WHERE MD.ManageDataPointId = '${item.ID}'`;
          const managePointCategories = await getSelectedColumn(
            "\`dbo.managedatapointcategory`\ MD",
            where,
            "C.CatName as catName, MD.*, MD.ManageDataPointCategorySeedID as manageDataPointCategorySeedID"
          );

          item.manageDataPointCategories = managePointCategories;
          let subcategory = [];

          await Promise.all(
            managePointCategories.map(async (item1) => {
              let where1 = ` LEFT JOIN subcategoryseeddata C ON MD.ManageDataPointSubCategorySeedID = C.Id WHERE MD.ManageDataPointCategoriesId = '${item1.ID}' GROUP BY MD.ManageDataPointSubCategorySeedID, C.Item`;
              let manageDataPointSubCategories = await getSelectedColumn(
                "\`dbo.managedatapointsubcategory\` MD",
                where1,
                "C.Item as subCatName, MD.*, MD.ManageDataPointSubCategorySeedID as manageDataPointSubCategorySeedID"
              );

              item1.manageDataPointSubCategories = manageDataPointSubCategories;
              if (manageDataPointSubCategories.length > 0) {
                subcategory.push(item1.manageDataPointSubCategories);
              }
            })
          );

          if (subcategory.length > 0) {
            array.push(item);
          }
        })
      );

      let selectedScope1 = [];
      let selectedScope2 = [];
      let selectedScope3 = [];

      const scope1 = array.filter((items) => items.ScopeID == 1);
      if (scope1.length > 0) {
        selectedScope1 = scope1[0].manageDataPointCategories.map((item) => item.catName);
      }

      const scope2 = array.filter((items) => items.ScopeID == 2);
      if (scope2.length > 0) {
        selectedScope2 = scope2[0].manageDataPointCategories.map((item) => item.catName);
      }

      const scope3 = array.filter((items) => items.ScopeID == 3);
      if (scope3.length > 0) {
        selectedScope3 = scope3[0].manageDataPointCategories.map((item) => item.catName);
      }

      if (DataProgress.length > 0) {
        let scope1Sum = 0;
        let scope1Count = 0;
        let scope2Sum = 0;
        let scope2Count = 0;
        let scope3Sum = 0;
        let scope3Count = 0;
        const matchedDataProgress = DataProgress.filter((val) => {
          const catName = val.category;
          const scope = val.scope;

          if (scope === 'scope_1' && selectedScope1.includes(catName)) {
            scope1Sum += Number(val.percentage);
            scope1Count += 1;
            return true;
          }
          if (scope === 'scope_2' && selectedScope2.includes(catName)) {
            scope2Sum += Number(val.percentage);
            scope2Count += 1;
            return true;
          }
          if (scope === 'scope_3' && selectedScope3.includes(catName)) {
            scope3Sum += Number(val.percentage);
            scope3Count += 1;
            return true;
          }

          return false;
        });

        scopeObject.scope1 = scope1Count > 0 ? parseFloat(scope1Sum / scope1Count).toFixed(2) : '0.00';
        scopeObject.scope2 = scope2Count > 0 ? parseFloat(scope2Sum / scope2Count).toFixed(2) : '0.00';
        scopeObject.scope3 = scope3Count > 0 ? parseFloat(scope3Sum / scope3Count).toFixed(2) : '0.00';
        FinalProgress.push({ [element]: matchedDataProgress, ...scopeObject, scope3Sum, scope3Count });
      }
    }

    if (FinalProgress.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully generated Final Data Progress...",
        FinalProgress: FinalProgress,
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
