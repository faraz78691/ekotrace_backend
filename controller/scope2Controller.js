const Joi = require("joi");
const moment = require("moment");
const config = require("../config");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const { getelectricityef, Addelectricityde, getheatandsteam, Addheatandsteam, getelectricityefScop3, checkCategoryInTemplate } = require("../models/scope2")
const { getSelectedColumn, getData, country_check } = require("../models/common");
const baseurl = config.base_url;

exports.Addelectricity = async (req, res) => {
  try {
    let allinsertedID = [];
    const { RegionID, unit, note, year, months, SubCategorySeedID,
      readingValue, facilities } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        RegionID: [Joi.optional().allow("")],
        readingValue: [Joi.string().empty().required()],
        unit: [Joi.string().empty().required()],
        note: [Joi.optional().allow("")],
        year: [Joi.string().empty().required()],
        months: [Joi.string().empty().required()],
        SubCategorySeedID: [Joi.string().empty().required()],
        facilities: [Joi.string().empty().required()],
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
    } else {
      let user_id = req.user.user_id;

      let countrydata = await country_check(facilities);
      //  console.log(countrydata[0].CountryId);
      if (countrydata.length == 0) {
        return res.json({
          success: false,
          message: "EF not Found while electricity",
          status: 400,
        });
      }

      const refunit = await getelectricityef(SubCategorySeedID, RegionID, countrydata[0].CountryId, year);

      const refunit1 = await getelectricityefScop3(SubCategorySeedID, countrydata[0].CountryId ,year);

      let GHGEmission = ""
      let GHGEmission1 = ""
      if (refunit.length > 0) {

        let yearRange = refunit[0]?.Fiscal_Year; // The string representing the year range
        let [startYear, endYear] = yearRange.split('-').map(Number);

        if (year >= startYear && year <= endYear) {

          GHGEmission = parseFloat(refunit[0]?.kgCO2e_kwh) * readingValue;
          GHGEmission1 = parseFloat(refunit1[0]?.kgCO2e_kwh) * readingValue;
        } else if (year == startYear) {
          GHGEmission = parseFloat(refunit[0]?.kgCO2e_kwh) * readingValue;
          GHGEmission1 = parseFloat(refunit1[0]?.kgCO2e_kwh) * readingValue;
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
          message: "EF not Found while electricity",
          status: 400,
        });
        //GHGEmission = 0;
      }
      console.log(refunit);

      const checkRes = await checkCategoryInTemplate(facilities);
      if (checkRes[0]?.count !== 1) {
        GHGEmission1 = 0;
      }
      let category = {
        RegionID: RegionID ? RegionID : "",
        Unit: unit ? unit : "",
        note: note ? note : "",
        GHGEmission: GHGEmission,
        SubCategorySeedID: SubCategorySeedID ? SubCategorySeedID : "",
        readingValue: readingValue ? readingValue : "",
        year: year ? year : "",
        facilities: facilities ? facilities : "",
        user_id: user_id,
        CreatedDate: moment().format('YYYY-MM-DD'),
        TenantID: 4,
        Active: 1,
        SendForApproval: 'yes',
        scop3_GHGEmission: GHGEmission1 ? GHGEmission1 : 0.00,
        FileName: req.file != undefined ? req.file.filename : null,
        emission_factor: refunit[0]?.kgCO2e_kwh

      }


      let month = JSON.parse(months);
      for (let monthdata of month) {
        category.months = monthdata;
        const electricityde = await Addelectricityde(category);
        if (electricityde.affectedRows > 0) {
          let insertId = electricityde.insertId
          allinsertedID.push(insertId);
        }
      }


      if (allinsertedID.length > 0) {

        let where = ` where user_id ='${user_id}' and facilities = '${facilities}'`;
        const refrigents = await getSelectedColumn("`dbo.renewableelectricityde`", where, "*");
        return res.json({
          success: true,
          message: "Succesfully Added electricity",
          categories: refrigents,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while Adding electricity",
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

exports.Addrenewableelectricity = async (req, res) => {
  try {
    let allinsertedID = [];
    const { sourceName, unit, note, year, months, SubCategorySeedID, typeID,
      readingValue, facilities, emission_factor } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        sourceName: [Joi.optional().allow("")],
        readingValue: [Joi.string().empty().required()],
        unit: [Joi.string().empty().required()],
        note: [Joi.optional().allow("")],
        year: [Joi.string().empty().required()],
        months: [Joi.string().empty().required()],
        SubCategorySeedID: [Joi.string().empty().required()],
        facilities: [Joi.string().empty().required()],
        typeID: [Joi.string().empty().required()],
        emission_factor: [Joi.optional().allow("")],
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
    } else {
      let user_id = req.user.user_id;
      let countrydata = await country_check(facilities);
      if (countrydata.length == 0) {
        return res.json({
          success: false,
          message: "EF not found",
          status: 400,
        });
      }

      let category = "";

      if (SubCategorySeedID == '9') {
        const refunit = await getelectricityef(SubCategorySeedID, '', countrydata[0].CountryId, year);
        let yearRange = refunit[0]?.Fiscal_Year;
        let [startYear, endYear] = yearRange.split('-').map(Number);
        if (year >= startYear && year <= endYear) {
          category = {
            sourceName: sourceName ? sourceName : "",
            Unit: unit ? unit : "",
            note: note ? note : "",
            GHGEmission: parseFloat(refunit[0].kgCO2e_kwh) * readingValue,
            SubCategorySeedID: SubCategorySeedID ? SubCategorySeedID : "",
            typeID: typeID ? typeID : "",
            readingValue: readingValue ? readingValue : "",
            year: year ? year : "",
            facilities: facilities ? facilities : "",
            user_id: user_id,
            CreatedDate: moment().format('YYYY-MM-DD'),
            TenantID: user_id,
            Active: 1,
            SendForApproval: 'yes',
            FileName: req.file != undefined ? req.file.filename : null
          }
        } else {
          return res.json({
            success: false,
            message: "EF not Found for this year",
            status: 400,
          });
        }
      } else {
        let where = `where country_code = ${countrydata[0].CountryId}`;
        const ef_factor = await getData("renewable_energy_cert_ef", where);
        const factor_column_name = sourceName == 'Solar' ? ef_factor[0].solar : sourceName == 'Wind' ? ef_factor[0].wind : ef_factor[0].hydro;
        let Emission = parseFloat(readingValue * factor_column_name)
        category = {
          sourceName: sourceName ? sourceName : "",
          Unit: unit ? unit : "",
          note: note ? note : "",
          GHGEmission: Emission,
          SubCategorySeedID: SubCategorySeedID ? SubCategorySeedID : "",
          typeID: typeID ? typeID : "",
          readingValue: readingValue ? readingValue : "",
          year: year ? year : "",
          facilities: facilities ? facilities : "",
          user_id: user_id,
          CreatedDate: moment().format('YYYY-MM-DD'),
          TenantID: user_id,
          Active: 1,
          SendForApproval: 'yes',
          emission_factor: factor_column_name,
          FileName: req.file != undefined ? req.file.filename : null
        }
      }

      let month = JSON.parse(months);
      for (let monthdata of month) {
        category.months = monthdata;
        const electricityde = await Addelectricityde(category);
        if (electricityde.affectedRows > 0) {
          let insertId = electricityde.insertId
          allinsertedID.push(insertId);
        }
      }

      if (allinsertedID.length > 0) {

        return res.json({
          success: true,
          message: "Succesfully Added renewable electricity",
          categories: '',
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while Adding renewable electricity",
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

exports.Addheatandsteam = async (req, res) => {
  try {
    let allinsertedID = [];
    const { unit, note, year, months, SubCategorySeedID, typeID,
      readingValue, facilities } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        readingValue: [Joi.string().empty().required()],
        unit: [Joi.string().empty().required()],
        note: [Joi.optional().allow("")],
        year: [Joi.string().empty().required()],
        months: [Joi.string().empty().required()],
        SubCategorySeedID: [Joi.string().empty().required()],
        facilities: [Joi.string().empty().required()],
        typeID: [Joi.string().empty().required()],
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
    } else {
      let user_id = req.user.user_id;

      let countrydata = await country_check(facilities);
      //console.log(countrydata[0].CountryId);
      if (countrydata.length == 0) {
        return res.json({
          success: false,
          message: "EF not Found while Adding heat and steam",
          status: 400,
        });
      }
      const refunit = await getheatandsteam(SubCategorySeedID, countrydata[0].CountryId, year);

      let GHGEmission = ""
      let GHGEmissionFactor = "";
      let GHGEmission1 = ""
      if (refunit.length > 0) {

        let yearRange = refunit[0]?.Fiscal_Year; // The string representing the year range
        let [startYear, endYear] = yearRange.split('-').map(Number);

        if (year >= startYear && year <= endYear) {
          //    console.log(yearRange,"-----------",startYear, endYear,year)
          GHGEmission = parseFloat(refunit[0].kgCO2e_kwh) * readingValue;
          GHGEmissionFactor = parseFloat(refunit[0].kgCO2e_kwh)
          GHGEmission1 = parseFloat(refunit[0].scop3_kgCO2e_kwh) * readingValue;

        } else if (year == startYear) {
          GHGEmission = parseFloat(refunit[0].kgCO2e_kwh) * readingValue;
          GHGEmissionFactor = parseFloat(refunit[0].kgCO2e_kwh);
          GHGEmission1 = parseFloat(refunit[0].scop3_kgCO2e_kwh) * readingValue;
        } else {
          return res.json({
            success: false,
            message: "EF not Found for this year",
            status: 400,
          });
        }

      } else {
        // GHGEmission = 0;

        return res.json({
          success: false,
          message: "EF not found while adding heat and steam",
          status: 400,
        });
      }
      // console.log(GHGEmission,refunit);

      const checkRes = await checkCategoryInTemplate(facilities);
      if (checkRes[0]?.count !== 1) {
        GHGEmission1 = 0;
      }
      let category = {

        Unit: unit ? unit : "",
        note: note ? note : "",
        GHGEmission: GHGEmission,
        GHGEmissionFactor: GHGEmissionFactor ? GHGEmissionFactor : "",
        SubCategorySeedID: SubCategorySeedID ? SubCategorySeedID : "",
        typeID: typeID ? typeID : "",
        readingValue: readingValue ? readingValue : "",
        year: year ? year : "",
        facilities: facilities ? facilities : "",
        user_id: user_id,
        CreatedDate: moment().format('YYYY-MM-DD'),
        TenantID: 4,
        Active: 1,
        SendForApproval: 'yes',
        scop3GHGEmission: GHGEmission1 ? GHGEmission1 : 0.00,
        FileName: req.file != undefined ? req.file.filename : null
      }


      let month = JSON.parse(months);
      for (let monthdata of month) {
        category.months = monthdata;
        const electricityde = await Addheatandsteam(category);
        if (electricityde.affectedRows > 0) {
          let insertId = electricityde.insertId
          allinsertedID.push(insertId);
        }
      }


      if (allinsertedID.length > 0) {

        let where = ` where user_id ='${user_id}' and facilities = '${facilities}' and SubCategorySeedID = '${SubCategorySeedID}'`;
        const refrigents = await getSelectedColumn("`dbo.heatandsteamde`", where, "*");
        return res.json({
          success: true,
          message: "Succesfully Added heat and steam",
          categories: refrigents,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while Adding heat and steam",
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

exports.getAllelectricity = async (req, res) => {
  try {

    const { SubCategorySeedID } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        SubCategorySeedID: [Joi.string().empty().required()],
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
      let user_id = req.user.user_id;

      let where = ` LEFT JOIN  \`dbo\.\electricity\` B ON B.RegionID = A.RegionID where  A.SubCategorySeedID ='${SubCategorySeedID}' and A.user_id ='${user_id}' `;
      const renewableelectricity = await getSelectedColumn("`dbo.renewableelectricityde` A ", where, "A.*,B.RegionName");

      if (renewableelectricity.length > 0) {

        return res.json({
          success: true,
          message: "Succesfully fetched electricity",
          categories: renewableelectricity,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while fetching electricity",
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

exports.getrenewableelectricity = async (req, res) => {
  try {

    const { SubCategorySeedID } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        SubCategorySeedID: [Joi.string().empty().required()],
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
      let user_id = req.user.user_id;

      let where = ` where  A.SubCategorySeedID ='${SubCategorySeedID}' and A.user_id ='${user_id}' `;
      const renewableelectricity = await getSelectedColumn("`dbo.renewableelectricityde` A ", where, "A.*");

      if (renewableelectricity.length > 0) {

        return res.json({
          success: true,
          message: "Succesfully fetched electricity",
          categories: renewableelectricity,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while fetching electricity",
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

exports.getAllheatandsteam = async (req, res) => {
  try {
    const { SubCategorySeedID } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        SubCategorySeedID: [Joi.string().empty().required()],
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
      let user_id = req.user.user_id;

      let where = ` where  A.SubCategorySeedID ='${SubCategorySeedID}' and A.user_id ='${user_id}' `;
      const renewableelectricity = await getSelectedColumn("`dbo.heatandsteamde` A ", where, "A.*");

      if (renewableelectricity.length > 0) {

        return res.json({
          success: true,
          message: "Succesfully fetched electricity",
          categories: renewableelectricity,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while fetching electricity",
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

exports.getAllRegions = async (req, res) => {
  try {

    const electricityGrids = await getData("electricitygrids", "");

    if (electricityGrids.length > 0) {

      return res.json({
        success: true,
        message: "Succesfully fetched electricity",
        categories: electricityGrids,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Some problem occured while fetching electricity",
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