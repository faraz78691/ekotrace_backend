const Joi = require("joi");
const config = require("../config");
const jwt = require("jsonwebtoken");
const {
  getSelectedData, getSelectedColumn,
  getData, country_check
} = require("../models/common");

const {
  fetchCombustionEmission,
  getStationaryComissionFactorByItemType,
  insertCombustionEmission,
  getCombustionEmission,
  checkCategoryInTemplate
} = require("../models/stationaryCombustion")

const { checkNUllUnD, checkNUllUnDString } = require("../services/helper");


exports.getSubCatSeedData = async (req, res) => {
  try {
    let where = " where id between 1 and 3";
    const seedDataDetails = await getData("subcategoryseeddata", where);
    if (seedDataDetails.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched the batch ids",
        categories: seedDataDetails,
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

exports.getSubCategoryTypes = async (req, res) => {
  try {
    const { id } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        id: [Joi.number().optional().empty()],
      })
    );
    let where = `where SubCatId = ${id}`;
    const categoryDetails = await getData("subcategorytypes", where);
    if (categoryDetails.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched the categories",
        categories: categoryDetails,
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

exports.stationaryCombustionEmission = async (req, res) => {
  try {
    const { months, year, subCategoryTypeId, SubCategorySeedID, blendType, blendPercent, unit, readingValue, facility_id, calorificValue } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        months: [Joi.string().required().empty()],
        year: [Joi.string().required().empty()],
        subCategoryTypeId: [Joi.number().required().empty()],
        SubCategorySeedID: [Joi.number().required().empty()],
        blendType: [Joi.string().optional().empty()],
        blendPercent: [Joi.number().optional().empty()],
        unit: [Joi.string().required().empty()],
        readingValue: [Joi.number().required().empty()],
        calorificValue: [Joi.optional().allow("")],
        facility_id: [Joi.number().required().empty()],
        file: [Joi.string().optional()]
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

    var monthsArr = JSON.parse(months);
    var litreUnit = "litres";
    var kgUnit = "kg";
    var kwhUnit = "kwh";
    var tonnesUnit = "tonnes";
    var emissionFactor = 0;
    var emissionFactor1 = 0;
    let resultInserted = [];
    let calorificValue2 = "";
    if (calorificValue == "null") {
      calorificValue2 = "";
    } else {
      calorificValue2 = calorificValue
    }

    stationaryCombustionData = {
      user_id: user_id,
      readingValue: readingValue,
      readingValueByKL: unit == 'KL' ? readingValue * 1000 : readingValue,
      BlendType: blendType,
      BlendPercent: blendPercent,
      emission: 0,
      month: "",
      year: year,
      Unit: unit,
      ghgEmissions: 0,
      calorificValue: calorificValue2 ? calorificValue2 : "",
      facility_id: facility_id,
      Scope3GHGEmission: 0,
      FileName: req.file != undefined ? req.file.filename : null
    };

    let countrydata = await country_check(facility_id);
    if (countrydata.length == 0) {
      return res.json({
        success: false,
        message: "EF not Found while Adding heat and steam",
        status: 400,
      });
    }
    const emissionDetails = await fetchCombustionEmission(
      SubCategorySeedID,
      subCategoryTypeId,
      countrydata[0].CountryId,
      calorificValue,
      unit.toLowerCase(),
      year
    );
  

    if (emissionDetails.length > 0) {
      let yearRange = emissionDetails[0]?.Fiscal_Year;
      let [startYear, endYear] = yearRange.split('-').map(Number);
      if (year >= startYear && year <= endYear) {
        stationaryCombustionData.TypeName = emissionDetails[0].Item;
        stationaryCombustionData.TypeId = subCategoryTypeId;
        stationaryCombustionData.SubCategoriesID = SubCategorySeedID;
      } else if (year == startYear) {
        stationaryCombustionData.TypeName = emissionDetails[0].Item;
        stationaryCombustionData.TypeId = subCategoryTypeId;
        stationaryCombustionData.SubCategoriesID = SubCategorySeedID;
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
        message: "EF not found while adding Stationary Combustion",
        status: 400,
      });
    }

    if (calorificValue) {
      emissionFactor = emissionDetails[0]?.kgCO2e_kwh
      emissionFactor1 = emissionDetails[0]?.scope3_kgCO2e_kwh
    }
    else if (unit.toLowerCase() === kgUnit) {
      emissionFactor = emissionDetails[0]?.kgCO2e_kg
      emissionFactor1 = emissionDetails[0]?.scope3_kgCO2e_kg
    }
    else if (unit.toLowerCase() === litreUnit) {            
      emissionFactor = emissionDetails[0]?.kgCO2e_litre
      emissionFactor1 = emissionDetails[0]?.scope3_kg_CO2e_litres
    }
    else if (unit.toLowerCase() === kwhUnit) {
      emissionFactor = emissionDetails[0]?.kgCO2e_kwh
      emissionFactor1 = emissionDetails[0]?.scope3_kgCO2e_kwh
    }
    else if (unit.toLowerCase() === tonnesUnit) {
      emissionFactor = emissionDetails[0]?.kgCO2e_tonnes
      emissionFactor1 = emissionDetails[0]?.scope3_kgCO2e_tonnes
    }
    else if (unit.toLowerCase() === 'kl') {
      emissionFactor = emissionDetails[0]?.kgCO2e_litre
      emissionFactor1 = emissionDetails[0]?.scope3_kg_CO2e_litres
    }
    let finalEFScope1 = 0;
    let finalEFScope3 = 0;

    if (stationaryCombustionData.calorificValue) {
      emissionFactor = parseFloat(stationaryCombustionData.calorificValue) * parseFloat(emissionFactor);
      emissionFactor1 = parseFloat(stationaryCombustionData.calorificValue) * parseFloat(emissionFactor1);
    }

    if (emissionDetails[0].Item == "Petrol" && blendType != "No Blend") {
      let ethanolEF;
      let ethanolEF1;
      const getStationaryComissionFactor = await getStationaryComissionFactorByItemType('Bioethanol', countrydata[0].CountryId);
      if (unit.toLowerCase() === kgUnit) {
        ethanolEF = getStationaryComissionFactor[0]?.kgCO2e_kg;
        ethanolEF1 = getStationaryComissionFactor[0]?.scope3_kgCO2e_kg;
      }
      else if (unit.toLowerCase() === litreUnit) {
        ethanolEF = getStationaryComissionFactor[0]?.kgCO2e_litre;
        ethanolEF1 = getStationaryComissionFactor[0]?.scope3_kg_CO2e_litres;
      }
      else if (unit.toLowerCase() === kwhUnit) {
        ethanolEF = getStationaryComissionFactor[0]?.kgCO2e_kwh;
        ethanolEF1 = getStationaryComissionFactor[0]?.scope3_kgCO2e_kwh;
      }
      else if (unit.toLowerCase() === tonnesUnit) {
        ethanolEF = getStationaryComissionFactor[0]?.kgCO2e_tonnes;
        ethanolEF1 = getStationaryComissionFactor[0]?.scope3_kgCO2e_tonnes;
      }
      else if (unit.toLowerCase() === 'kl') {
        ethanolEF = getStationaryComissionFactor[0]?.kgCO2e_litre;
        ethanolEF1 = getStationaryComissionFactor[0]?.scope3_kg_CO2e_litres;
      }
      if (blendType === "Perc. Blend" && !calorificValue) {
        let percent = parseFloat(blendPercent / 100);
        finalEFScope1 = parseFloat(percent * ethanolEF + (1 - percent) * emissionFactor);
        finalEFScope3 = parseFloat(percent * ethanolEF1 + (1 - percent) * emissionFactor1);
      } else if (blendType === "Perc. Blend" && calorificValue) {
        let percent = parseFloat(blendPercent / 100);
        finalEFScope1 = parseFloat(emissionFactor * (1 - percent) + ethanolEF * percent);
        finalEFScope3 = parseFloat(emissionFactor1 * (1 - percent) + ethanolEF1 * percent);
      } else if (blendType === "Average Blend" && !calorificValue) {
        finalEFScope1 = parseFloat(0.07 * ethanolEF + (1 - 0.07) * emissionFactor);
        finalEFScope3 = parseFloat(0.07 * ethanolEF1 + (1 - 0.07) * emissionFactor1);
      } else if (blendType === "Average Blend" && calorificValue) {
        finalEFScope1 = parseFloat(emissionFactor * (1 - 0.07) + ethanolEF * 0.07);
        finalEFScope3 = parseFloat(emissionFactor1 * (1 - 0.07) + ethanolEF1 * 0.07);
      }
    } else if (emissionDetails[0].Item == "Diesel" && blendType != "No Blend") {
      let BiodieselEF;
      let BiodieselEF1;
      const getStationaryComissionFactor = await getStationaryComissionFactorByItemType('Biodiesel ME', countrydata[0].CountryId);
      if (unit.toLowerCase() === kgUnit) {
        BiodieselEF = getStationaryComissionFactor[0]?.kgCO2e_kg;
        BiodieselEF1 = getStationaryComissionFactor[0]?.scope3_kgCO2e_kg;
      }
      else if (unit.toLowerCase() === litreUnit) {
        BiodieselEF = getStationaryComissionFactor[0]?.kgCO2e_litre;
        BiodieselEF1 = getStationaryComissionFactor[0]?.scope3_kg_CO2e_litres;
      }
      else if (unit.toLowerCase() === kwhUnit) {
        BiodieselEF = getStationaryComissionFactor[0]?.kgCO2e_kwh;
        BiodieselEF1 = getStationaryComissionFactor[0]?.scope3_kgCO2e_kwh;
      }
      else if (unit.toLowerCase() === tonnesUnit) {
        BiodieselEF = getStationaryComissionFactor[0]?.kgCO2e_tonnes;
        BiodieselEF1 = getStationaryComissionFactor[0]?.scope3_kgCO2e_tonnes;
      }
      else if (unit.toLowerCase() === 'kl') {
        BiodieselEF = getStationaryComissionFactor[0]?.kgCO2e_litre;
        BiodieselEF1 = getStationaryComissionFactor[0]?.scope3_kg_CO2e_litres;
      }
      console.log("emissionFactor =>", emissionFactor);
      console.log("BiodieselEF =>", BiodieselEF);

      if (blendType === "Perc. Blend" && !calorificValue) {
        let percent = parseFloat(blendPercent / 100);
        finalEFScope1 = parseFloat(percent * BiodieselEF + (1 - percent) * emissionFactor);
        finalEFScope3 = parseFloat(percent * BiodieselEF1 + (1 - percent) * emissionFactor1);
      } else if (blendType === "Perc. Blend" && calorificValue) {
        let percent = parseFloat(blendPercent / 100);
        finalEFScope1 = parseFloat(emissionFactor * (1 - percent) + BiodieselEF * percent);
        finalEFScope3 = parseFloat(emissionFactor1 * (1 - percent) + BiodieselEF1 * percent);
      } else if (blendType === "Average Blend" && !calorificValue) {
        finalEFScope1 = parseFloat(0.07 * BiodieselEF + (1 - 0.07) * emissionFactor);
        finalEFScope3 = parseFloat(0.07 * BiodieselEF1 + (1 - 0.07) * emissionFactor1);
      } else if (blendType === "Average Blend" && calorificValue) {
        finalEFScope1 = parseFloat(emissionFactor * (1 - 0.07) + BiodieselEF * 0.07);
        finalEFScope3 = parseFloat(emissionFactor1 * (1 - 0.07) + BiodieselEF1 * 0.07);
      }
    } else {
      finalEFScope1 = emissionFactor;
      finalEFScope3 = emissionFactor1;
    }
    
    stationaryCombustionData.ghgEmissionFactor = finalEFScope1
    stationaryCombustionData.Scope3GHGEmissionFactor = finalEFScope3
    stationaryCombustionData.ghgEmissions = parseFloat(readingValue * finalEFScope1);
    stationaryCombustionData.Scope3GHGEmission = parseFloat(readingValue * finalEFScope3);

    // stationaryCombustionData.ghgEmissions = (Math.round(stationaryCombustionData.ghgEmissions) / 10000)
    const checkRes = await checkCategoryInTemplate(facility_id);
    if ((checkRes[0]?.count !== 1)) {
      stationaryCombustionData.Scope3GHGEmission = 0;
    }

    for (let month of monthsArr) {
      stationaryCombustionData.month = month;
      var tempInserted = await insertCombustionEmission(stationaryCombustionData);
      resultInserted.push(tempInserted.insertId);
    }

    //Check Vehicle Data as well
    if (resultInserted.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully generated Waste  stationaryCombustion Emissions",
        stationaryCombustionData: stationaryCombustionData,
        insertIds: resultInserted,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Node data found for this user's  stationaryCombustion Emissions",
        status: 500,
      });
    }
  }
  catch (err) {
    console.log(err);
    return res.json({
      success: false,
      message: "Internal server error",
      error: err,
      status: 500,
    });
  }
};

exports.getStationaryCombEmission = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const staCombEmissionDetails = await getCombustionEmission(user_id);
    if (staCombEmissionDetails.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched the Stationary combustion Emissions",
        categories: staCombEmissionDetails,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "No data found for this user",
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

exports.getStationaryCombEmissionByTypeId = async (req, res) => {
  try {
    const { TypeID } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        TypeID: [Joi.string().required().empty()],
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

    let where = ` where  A.user_id ='` + user_id + `' and  A.TypeID = '${TypeID}'`;
    const staCombEmissionDetails = await getSelectedColumn("stationarycombustionde A ", where, "A.*");

    if (staCombEmissionDetails.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched the Stationary combustion Emissions",
        categories: staCombEmissionDetails,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "No data found for this user",
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
