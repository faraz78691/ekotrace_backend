const Joi = require("joi");
const moment = require("moment");
const config = require("../config");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");

const { Addassignedmanagedatapoint, AddstationarycombustionLiquid,
  Addrefrigerant, getrefrigerant, Allrefrigerants, Allfireextinguisher,
  Addfireextinguisher, getfireextinguisher, getelectricity, getRenewableelectricity, getheatandsteam,
  getpassengervehicletypes, getdeliveryvehicletypesWithCountryId, getdeliveryvehicletypes, Addcompanyownedvehicles, getvehicletypesByName, getvehicletypes, getAllcompanyownedvehicles, Addmanagedatapointsubcategory, Addmanagedatapointcategory, fetchStationaryCombustiondeByFacilityId, fetchRefrigerantsByFacilityId, fetchFireExtinguisherByFacilityId, fetchCompanyOwnedVehichleByFacilityId, fetchElectricityByFacilityId, fetchHeatAndSteamByFacilityId, fetchPurchasedGoodsAndServicesByFacilityId, fetchBussinessTravelByFacilityId } = require("../models/scope1")

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

exports.electricitygridType = async (req, res) => {
  try {

    const { facilities,year } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facilities: [Joi.string().empty().required()],
        year: [Joi.string().empty().required()]
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
      let countrydata = await country_check(facilities);

      // console.log(countrydata[0].CountryId);
      if (countrydata.length == 0) {
        return res.json({
          success: false,
          message: "EF not Found",
          status: 400,
        });
      }

      let where = ` where SubCategorySeedID = '9' and country_id = '${countrydata[0].CountryId}' and is_scope3 != 1 and Right(Fiscal_Year,4) = '${year}'`;
      let electricity = await getSelectedColumn("`dbo.electricity`", where, "*,SubCategorySeedID as subCatTypeID");


      if (electricity.length > 0) {
        return res.json({
          success: true,
          message: "Succesfully fetched all Subcategory Type",
          categories: electricity,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Grid not Found",
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

exports.GetSubCategoryTypes = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const facilityId = Number(req.query.facilityId);
    const year = Number(req.query.year);

    const schema = Joi.object({
      id: Joi.number().strict().required().messages({
        "number.base": "id must be a number",
        "any.required": "id is required",
      }),
      facilityId: Joi.number().strict().required().messages({
        "number.base": "facilityId must be a number",
        "any.required": "facilityId is required",
      }),
    });

    const result = schema.validate({ id, facilityId }, { abortEarly: false });

    if (result.error) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.details.map((i) => i.message),
        status: 400,
        success: false,
      });
    } else {
      const user_id = req.user.user_id;
      let countrydata = await country_check(facilityId);
      let stationarycombustion = [];
      if (id == '7') {
        let where = ` where SubCategorySeedID = '${id}' AND country_id = '${countrydata[0].CountryId}' and Right(Fiscal_Year, 4) = ${year}`;
        stationarycombustion = await getSelectedColumn("`dbo.refrigents`", where, "*");
      } else if (id == '10') {
        stationarycombustion = await getpassengervehicletypes(user_id);
      } else if (id == '11') {
        stationarycombustion = await getdeliveryvehicletypesWithCountryId(countrydata[0].CountryId);
      } else if (id == '9') {
        stationarycombustion = await getelectricity(id, countrydata[0].CountryId);
      } else if (id == '1002') {
        stationarycombustion = await getRenewableelectricity(id, countrydata[0].CountryId);
      } else if (id == '12') {
        stationarycombustion = await getheatandsteam(id, countrydata[0].CountryId);
      } else {
        let where = ` where SubCategorySeedID ='${id}' AND country_id = '${countrydata[0].CountryId}'ORDER BY item ASC`;
        stationarycombustion = await getSelectedColumn("`stationarycombustion`", where, "*,SubCatTypeID as subCatTypeID ");
      }

      stationarycombustion.forEach((item) => {
        if (item.SubCategorySeedID === 4 || item.SubCategorySeedID === 5) {
          item.Item = item.ItemType;
        }
      });

      if (stationarycombustion.length > 0) {
        return res.json({
          success: true,
          message: "Succesfully fetched all Subcategory Type",
          categories: stationarycombustion,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Type not found for this country or year",
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

exports.GetUnits = async (req, res) => {
  try {
    const { id } = req.params;

    const schema = Joi.object({
      id: Joi.number().required().messages({
        "number.base": "id must be a number",
        "any.required": "id is required",
      }),
    });

    const result = schema.validate({ id });

    if (result.error) {
      return res.status(400).json({
        message: "Validation error",
        errors: result.error.details.map((i) => i.message),
        status: 400,
        success: false,
      })
    }

    let where = `WHERE seedsubcatID = '${id}'`;
    const units = await getSelectedColumn("`dbo.units`", where, "*");
    if (units.length > 0) {
      const removeIDs = [1, 2, 3, 4, 5, 6];
      let data = [];

      if (removeIDs.includes(Number(id))) {
        data = units.filter(val =>
          ['Litres', 'Tonnes', 'KG'].includes(val.UnitName)
        ).map(val => ({
          ID: val.ID,
          UnitName: val.UnitName,
          seedsubcatID: val.seedsubcatID,
        }));
      } else {
        data = units.map(val => ({
          ID: val.ID,
          UnitName: val.UnitName,
          seedsubcatID: val.seedsubcatID,
        }));
      }

      return res.json({
        success: true,
        message: "Successfully fetched units",
        categories: data,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "No units found for the given id",
        status: 404,
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
      status: 500,
    });
  }
};

exports.getBlendType = async (req, res) => {
  try {
    // Fetch blend types
    const blendtype = await getSelectedColumn("`dbo.blendtype`", "", "*");

    if (blendtype.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Successfully fetched blend types",
        categories: blendtype,
        status: 200,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "No blend types found",
        status: 404,
      });
    }
  } catch (err) {
    console.error("Error fetching blend types:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
      status: 500,
    });
  }
};

exports.Getfacilities = async (req, res) => {
  try {
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
    const user_id = req.user.user_id; // Authentication like GetSubCategoryTypes

    const category = await getSelectedColumn(
      "`dbo.categoryseeddata`",
      ` `,
      "Id as id,CatName as catName,ManageScopeId as managescopeid,ScopeId as scopeid,ScopeSeedId as scopeseedid"
    );

    // await Promise.all(
    //   category.map(async (item) => {
    //     let where = ` where CategorySeedDataId ='${item.Id}'`;
    //     const category1 = await getSelectedColumn("`subcategoryseeddata`", where, "*" );
    //     item.subCategory = category1;
    //   }));

    if (category.length > 0) {
      return res.json(category);
    } else {
      return res.json({
        success: false,
        message: "Some problem occurred while selecting category",
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

exports.getAssignedDataPointbyfacility = async (req, res) => {
  try {
    const { facilityId } = req.params;

    const schema = Joi.object({
      facilityId: Joi.number().required().messages({
        "number.base": "facilityId must be a number",
        "any.required": "facilityId is required",
      }),
    });

    const result = schema.validate({ facilityId });

    if (result.error) {
      return res.status(400).json({
        message: "Validation error",
        errors: result.error.details.map((i) => i.message),
        status: 400,
        success: false,
      })
    }

    const user_id = req.user.user_id;

    let array = [];
    let where = ` LEFT JOIN \`dbo.scopeseed\` S ON S.ID = MD.ScopeID WHERE MD.facilityId = '${facilityId}' ORDER BY MD.ScopeID ASC`;
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

    if (array.length > 0) {
      return res.json({
        success: true,
        message: "Successfully fetched facilities",
        categories: array,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Some problem occurred while selecting facilities",
        status: 400,
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
      status: 500,
    });
  }
};

exports.getmanageDataPointbyfacility = async (req, res) => {
  try {
    const { facilityId, ScopeID } = req.params;

    const schema = Joi.object({
      facilityId: Joi.string().required().messages({
        "string.base": "facilityId must be a string",
        "any.required": "facilityId is required",
      }),
      ScopeID: Joi.string().required().messages({
        "string.base": "ScopeID must be a string",
        "any.required": "ScopeID is required",
      }),
    });

    const { error } = schema.validate({ facilityId, ScopeID });
    if (error) {
      const message = error.details.map((i) => i.message).join(", ");
      return res.status(400).json({
        message: "Validation error",
        errors: error.details.map((i) => i.message),
        status: 400,
        success: false,
      });
    }

    let where = ` LEFT JOIN dbo.scopeseed S ON S.ID = MD.ScopeID WHERE MD.facilityId = '${facilityId}' AND MD.ScopeID = '${ScopeID}'`;
    const facilities = await getSelectedColumn("dbo.managedatapoint MD", where, "MD.*, S.scopeName");

    await Promise.all(
      facilities.map(async (item) => {
        let catWhere = ` JOIN dbo.categoryseeddata C ON MD.ManageDataPointCategorySeedID = C.Id WHERE MD.ManageDataPointId = '${item.ID}'`;
        const managePointCategories = await getSelectedColumn(
          "dbo.managedatapointcategory MD",
          catWhere,
          "C.CatName as catName, MD.*, MD.ManageDataPointCategorySeedID as manageDataPointCategorySeedID"
        );

        item.manageDataPointCategories = managePointCategories;

        await Promise.all(
          managePointCategories.map(async (item1) => {
            let subCatWhere = ` LEFT JOIN subcategoryseeddata C ON MD.ManageDataPointSubCategorySeedID = C.Id WHERE MD.ManageDataPointCategoriesId = '${item1.ID}'`;
            item1.manageDataPointSubCategories = await getSelectedColumn(
              "dbo.managedatapointsubcategory MD",
              subCatWhere,
              "C.Item as subCatName, MD.*, MD.ManageDataPointSubCategorySeedID as manageDataPointSubCategorySeedID"
            );
          })
        );
      })
    );

    if (facilities.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Successfully fetched facilities",
        categories: facilities,
        status: 200,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "No facilities found",
        status: 404,
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
      status: 500,
    });
  }
};

exports.AddassignedDataPointbyfacility = async (req, res) => {
  try {

    const { Scope1, Scope2, Scope3, FacilityId, TenantID } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        Scope1: [Joi.optional().allow("")],
        Scope2: [Joi.optional().allow("")],
        Scope3: [Joi.optional().allow("")],
        FacilityId: [Joi.string().empty().required()],
        TenantID: [Joi.string().empty().required()],

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

      const array1 = FacilityId.split(",").map(item => item.trim());
      let facilities = "";
      for (let i = 0; i < array1.length; i++) {

        facilities = array1[i];

        if (Scope1 == undefined) {
          let where = " where MD.facilityId = '" + facilities + "' and MD.ScopeID = '1'";
          const assignedmanagedfacilities = await getSelectedColumn("`dbo.managedatapoint` MD  ", where, "MD.*");


          if (assignedmanagedfacilities.length > 0) {
            let insertedscope1 = assignedmanagedfacilities[0].ID;
            let where = " where MD.ManageDataPointId = '" + insertedscope1 + "' and TenantID = '" + TenantID + "' and  user_id = '" + user_id + "' ";
            const assignedmanagedfacilities1 = await getSelectedColumn("`dbo.managedatapointcategory` MD  ", where, "MD.*");

            if (assignedmanagedfacilities1.length > 0) {


              await Promise.all(
                assignedmanagedfacilities1?.map(async (sub) => {

                  let where2 = ` where ManageDataPointCategoriesId = '${sub.ID}' and TenantID = '${TenantID}' and  user_id = '${user_id}'`;
                  const deleted1 = await deleteData('`dbo.managedatapointsubcategory`', where2)
                  console.log('1111')
                  let where = ` where ManageDataPointId = '${insertedscope1}' and TenantID = '${TenantID}' and  user_id = '${user_id}'`;
                  const deleted = await deleteData('`dbo.managedatapointcategory`', where)
                  console.log('22222')
                }));


              let where1 = " where MD.facilityId = '" + facilities + "' and MD.ScopeID = '1'";
              const deleted1 = await deleteData('`dbo.managedatapoint` MD', where1)
              console.log('333333')
            }

          }
        }

        if (Scope2 == undefined) {
          let where = " where MD.facilityId = '" + facilities + "' and MD.ScopeID = '2'";
          const assignedmanagedfacilities = await getSelectedColumn("`dbo.managedatapoint` MD  ", where, "MD.*");


          if (assignedmanagedfacilities.length > 0) {


            let insertedscope1 = assignedmanagedfacilities[0].ID;

            let where = " where MD.ManageDataPointId = '" + insertedscope1 + "' and TenantID = '" + TenantID + "' and  user_id = '" + user_id + "' ";
            const assignedmanagedfacilities1 = await getSelectedColumn("`dbo.managedatapointcategory` MD  ", where, "MD.*");

            if (assignedmanagedfacilities1.length > 0) {


              await Promise.all(
                assignedmanagedfacilities1?.map(async (sub) => {

                  let where2 = ` where ManageDataPointCategoriesId = '${sub.ID}' and TenantID = '${TenantID}' and  user_id = '${user_id}'`;
                  const deleted1 = await deleteData('`dbo.managedatapointsubcategory`', where2)
                  console.log('1111')
                  let where = ` where ManageDataPointId = '${insertedscope1}' and TenantID = '${TenantID}' and  user_id = '${user_id}'`;
                  const deleted = await deleteData('`dbo.managedatapointcategory`', where)
                  console.log('22222')
                }));


              let where1 = " where MD.facilityId = '" + facilities + "' and MD.ScopeID = '2'";
              const deleted1 = await deleteData('`dbo.managedatapoint` MD', where1)
              console.log('333333')
            }

          }
        }

        if (Scope3 == undefined) {
          let where = " where MD.facilityId = '" + facilities + "' and MD.ScopeID = '3'";
          const assignedmanagedfacilities = await getSelectedColumn("`dbo.managedatapoint` MD  ", where, "MD.*");


          if (assignedmanagedfacilities.length > 0) {


            let insertedscope1 = assignedmanagedfacilities[0].ID;

            let where = " where MD.ManageDataPointId = '" + insertedscope1 + "' and TenantID = '" + TenantID + "' and  user_id = '" + user_id + "' ";
            const assignedmanagedfacilities1 = await getSelectedColumn("`dbo.managedatapointcategory` MD  ", where, "MD.*");

            if (assignedmanagedfacilities1.length > 0) {


              await Promise.all(
                assignedmanagedfacilities1?.map(async (sub) => {

                  let where2 = ` where ManageDataPointCategoriesId = '${sub.ID}' and TenantID = '${TenantID}' and  user_id = '${user_id}'`;
                  const deleted1 = await deleteData('`dbo.managedatapointsubcategory`', where2)
                  console.log('1111')
                  let where = ` where ManageDataPointId = '${insertedscope1}' and TenantID = '${TenantID}' and  user_id = '${user_id}'`;
                  const deleted = await deleteData('`dbo.managedatapointcategory`', where)
                  console.log('22222')
                }));


              let where1 = " where MD.facilityId = '" + facilities + "' and MD.ScopeID = '3'";
              const deleted1 = await deleteData('`dbo.managedatapoint` MD', where1)
              console.log('333333')
            }

          }
        }

        if (Scope1) {
          let insertedscope1 = "";

          let category = {
            ScopeID: 1,
            FacilityId: facilities ? facilities : "",
            user_id: user_id
          }

          let where = " where MD.facilityId = '" + facilities + "' and MD.ScopeID = '1'";
          const assignedmanagedfacilities1 = await getSelectedColumn("`dbo.managedatapoint` MD  ", where, "MD.*");

          if (assignedmanagedfacilities1.length == 0) {
            const assignedmanaged = await Addassignedmanagedatapoint(category);
            insertedscope1 = assignedmanaged.insertId;
          } else {
            insertedscope1 = assignedmanagedfacilities1[0].ID;
          }

          let scope1data = JSON.parse(Scope1);
          if (scope1data.length > 0) {
            await Promise.all(
              scope1data.map(async (item) => {

                let category = {
                  ManageDataPointCategorySeedID: item.category_id,
                  ManageDataPointId: insertedscope1,
                  TenantID: TenantID,
                  user_id: user_id
                };

                let where = " where MD.ManageDataPointId = '" + insertedscope1 + "' and TenantID = '" + TenantID + "' and  user_id = '" + user_id + "' ";
                const assignedmanagedfacilities = await getSelectedColumn("`dbo.managedatapointcategory` MD  ", where, "MD.*");
                if (assignedmanagedfacilities.length > 0) {
                  await Promise.all(
                    assignedmanagedfacilities?.map(async (sub) => {
                      let where3 = ` where ManageDataPointCategoriesId = '${sub.ID}'  and TenantID = '${TenantID}' and  user_id = '${user_id}'`;
                      const deleted1 = await deleteData('`dbo.managedatapointsubcategory`', where3)

                      let where4 = ` where ManageDataPointId = '${insertedscope1}' and TenantID = '${TenantID}' and  user_id = '${user_id}'`;
                      const deleted = await deleteData('`dbo.managedatapointcategory`', where4)
                    }));
                }
                const addcategory = await Addmanagedatapointcategory(category);

                if (addcategory.affectedRows > 0) {
                  let subcategory_id = item.subcategory_id
                  await Promise.all(
                    subcategory_id?.map(async (sub) => {
                      let category = {
                        ManageDataPointSubCategorySeedID: sub,
                        ManageDataPointCategoriesId: addcategory.insertId,
                        TenantID: TenantID,
                        user_id: user_id
                      };

                      //  let where6 = " where MD.ManageDataPointSubCategorySeedID = '"+sub+"' and TenantID = '"+TenantID+"' and  user_id = '"+user_id+"' ";
                      //  const assignedfacilities = await getSelectedColumn("`dbo.managedatapointsubcategory` MD  ",where6,"MD.*" );
                      //  if(assignedfacilities.length > 0){
                      //   console.log('testtttttttttttttttttt')
                      //      let where5 = ` where ManageDataPointSubCategorySeedID = '${sub}' and TenantID = '${TenantID}' and  user_id = '${user_id}'`;
                      //      const deleted = await deleteData('`dbo.managedatapointsubcategory`',where5)
                      //  }

                      const addsubcategory = await Addmanagedatapointsubcategory(category);
                      array.push(addsubcategory.insertId)



                    }));
                }


              }));
          }

        }

        if (Scope2) {
          let insertedscope1 = "";
          let category = {
            ScopeID: 2,
            FacilityId: facilities ? facilities : "",
            user_id: user_id
          }

          let where = " where MD.facilityId = '" + facilities + "' and MD.ScopeID = '2'";
          const assignedmanagedfacilities1 = await getSelectedColumn("`dbo.managedatapoint` MD  ", where, "MD.*");

          if (assignedmanagedfacilities1.length == 0) {

            const assignedmanaged = await Addassignedmanagedatapoint(category);
            insertedscope1 = assignedmanaged.insertId;
          } else {
            insertedscope1 = assignedmanagedfacilities1[0].ID;
          }
          let scope1data = JSON.parse(Scope2);

          if (scope1data.length > 0) {
            await Promise.all(
              scope1data.map(async (item) => {

                let category = {
                  ManageDataPointCategorySeedID: item.category_id,
                  ManageDataPointId: insertedscope1,
                  TenantID: TenantID,
                  user_id: user_id
                };


                let where = " where MD.ManageDataPointId = '" + insertedscope1 + "' and TenantID = '" + TenantID + "' and  user_id = '" + user_id + "' ";
                const assignedmanagedfacilities = await getSelectedColumn("`dbo.managedatapointcategory` MD  ", where, "MD.*");
                if (assignedmanagedfacilities.length > 0) {
                  await Promise.all(
                    assignedmanagedfacilities?.map(async (sub) => {
                      let where3 = ` where ManageDataPointCategoriesId = '${sub.ID}'  and TenantID = '${TenantID}' and  user_id = '${user_id}'`;
                      const deleted1 = await deleteData('`dbo.managedatapointsubcategory`', where3)

                      let where4 = ` where ManageDataPointId = '${insertedscope1}' and TenantID = '${TenantID}' and  user_id = '${user_id}'`;
                      const deleted = await deleteData('`dbo.managedatapointcategory`', where4)
                    }));
                }
                const addcategory = await Addmanagedatapointcategory(category);
                if (addcategory.affectedRows > 0) {

                  let subcategory_id = item.subcategory_id
                  await Promise.all(
                    subcategory_id?.map(async (sub) => {
                      let category = {
                        ManageDataPointSubCategorySeedID: sub,
                        ManageDataPointCategoriesId: addcategory.insertId,
                        TenantID: TenantID,
                        user_id: user_id
                      };

                      // let where = " where MD.ManageDataPointSubCategorySeedID = '"+sub+"' and TenantID = '"+TenantID+"' and  user_id = '"+user_id+"' ";
                      // const assignedfacilities = await getSelectedColumn("`dbo.managedatapointsubcategory` MD  ",where,"MD.*" );
                      // if(assignedfacilities.length > 0){

                      //     where = ` where ManageDataPointSubCategorySeedID = '${sub}' and TenantID = '${TenantID}' and  user_id = '${user_id}'`;
                      //     const deleted = await deleteData('`dbo.managedatapointsubcategory`',where)

                      // }

                      const addsubcategory = await Addmanagedatapointsubcategory(category);
                      array.push(addsubcategory.insertId)
                    }));

                }

              }));
          }
        }

        if (Scope3) {
          let insertedscope1 = "";
          let category = {
            ScopeID: 3,
            FacilityId: facilities ? facilities : "",
            user_id: user_id
          }

          let where = " where MD.facilityId = '" + facilities + "' and MD.ScopeID = '3'";
          const assignedmanagedfacilities1 = await getSelectedColumn("`dbo.managedatapoint` MD  ", where, "MD.*");

          if (assignedmanagedfacilities1.length == 0) {
            const assignedmanaged = await Addassignedmanagedatapoint(category);
            insertedscope1 = assignedmanaged.insertId;
          } else {
            insertedscope1 = assignedmanagedfacilities1[0].ID;
          }
          let scope1data = JSON.parse(Scope3);
          if (scope1data.length > 0) {
            await Promise.all(
              scope1data.map(async (item) => {
                let category = {
                  ManageDataPointCategorySeedID: item.category_id,
                  ManageDataPointId: insertedscope1,
                  TenantID: TenantID,
                  user_id: user_id
                };

                let where = " where MD.ManageDataPointId = '" + insertedscope1 + "' and TenantID = '" + TenantID + "' and  user_id = '" + user_id + "' ";
                const assignedmanagedfacilities = await getSelectedColumn("`dbo.managedatapointcategory` MD  ", where, "MD.*");
                if (assignedmanagedfacilities.length > 0) {
                  await Promise.all(
                    assignedmanagedfacilities?.map(async (sub) => {
                      let where3 = ` where ManageDataPointCategoriesId = '${sub.ID}'  and TenantID = '${TenantID}' and  user_id = '${user_id}'`;
                      const deleted1 = await deleteData('`dbo.managedatapointsubcategory`', where3)

                      let where4 = ` where ManageDataPointId = '${insertedscope1}' and TenantID = '${TenantID}' and  user_id = '${user_id}'`;
                      const deleted = await deleteData('`dbo.managedatapointcategory`', where4)
                    }));
                }
                const addcategory = await Addmanagedatapointcategory(category);

                let subcategory_id = item.subcategory_id
                await Promise.all(
                  subcategory_id?.map(async (sub) => {
                    let category = {
                      ManageDataPointSubCategorySeedID: sub,
                      ManageDataPointCategoriesId: addcategory.insertId,
                      TenantID: TenantID,
                      user_id: user_id
                    };
                    // let where = " where MD.ManageDataPointSubCategorySeedID = '"+sub+"' and TenantID = '"+TenantID+"' and  user_id = '"+user_id+"' ";
                    // const assignedfacilities = await getSelectedColumn("`dbo.managedatapointsubcategory` MD  ",where,"MD.*" );
                    // if(assignedfacilities.length > 0){

                    //     where = ` where ManageDataPointSubCategorySeedID = '${sub}' and TenantID = '${TenantID}' and  user_id = '${user_id}'`;
                    //     const deleted = await deleteData('`dbo.managedatapointsubcategory`',where)

                    // }

                    const addsubcategory = await Addmanagedatapointsubcategory(category);
                    array.push(addsubcategory.insertId)
                  }));

              }));
          }
        }
      }
      if (array.length > 0) {
        return res.json({
          success: true,
          message: "Succesfully Added category",
          array: array,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while Adding category",
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

// exports.AddassignedDataPointbyfacility = async (req, res) => {
//   try {

//       const { Scope1,Scope2,Scope3,FacilityId,TenantID} = req.body;
//       const schema = Joi.alternatives(
//       Joi.object({
//         Scope1:[Joi.optional().allow("")],
//         Scope2:[Joi.optional().allow("")],
//         Scope3:[Joi.optional().allow("")],
//         FacilityId:[Joi.string().empty().required()],
//         TenantID:[Joi.string().empty().required()],
//        })
//       );
//       const result = schema.validate(req.body);
//       if (result.error) {
//       const message = result.error.details.map((i) => i.message).join(",");
//       return res.json({
//           message: result.error.details[0].message,
//           error: message,
//           missingParams: result.error.details[0].message,
//           status: 200,
//           success: false,
//       });
//       }else{
//       const authHeader = req.headers.auth;
//       const jwtToken = authHeader.replace("Bearer ", "");
//       const decoded = jwt.decode(jwtToken);
//       const user_id = decoded.user_id;
//       let array  = [];  


//       if(Scope1 == undefined){
//         let where = " where MD.facilityId = '"+FacilityId+"' and MD.ScopeID = '1'";
//         const assignedmanagedfacilities = await getSelectedColumn("`dbo.managedatapoint` MD  ",where,"MD.*" );


//         if(assignedmanagedfacilities.length > 0){


//           let insertedscope1 = assignedmanagedfacilities[0].ID;

//           let where = " where MD.ManageDataPointId = '"+insertedscope1+"' and TenantID = '"+TenantID+"' and  user_id = '"+user_id+"' ";
//           const assignedmanagedfacilities1 = await getSelectedColumn("`dbo.managedatapointcategory` MD  ",where,"MD.*" );

//           if(assignedmanagedfacilities1.length > 0){


//             await Promise.all(
//               assignedmanagedfacilities1?.map(async (sub) => {

//                 let where2 = ` where ManageDataPointCategoriesId = '${sub.ID}' and TenantID = '${TenantID}' and  user_id = '${user_id}'`;
//                 const deleted1 = await deleteData('`dbo.managedatapointsubcategory`',where2)
//                 console.log('1111')
//                 let where = ` where ManageDataPointId = '${insertedscope1}' and TenantID = '${TenantID}' and  user_id = '${user_id}'`;
//                 const deleted = await deleteData('`dbo.managedatapointcategory`',where)
//                 console.log('22222')
//               }));


//               let where1 = " where MD.facilityId = '"+FacilityId+"' and MD.ScopeID = '1'";
//               const deleted1 = await deleteData('`dbo.managedatapoint` MD',where1)
//               console.log('333333')
//           }

//         }
//       }

//       if(Scope2 == undefined){
//         let where = " where MD.facilityId = '"+FacilityId+"' and MD.ScopeID = '2'";
//         const assignedmanagedfacilities = await getSelectedColumn("`dbo.managedatapoint` MD  ",where,"MD.*" );


//         if(assignedmanagedfacilities.length > 0){


//           let insertedscope1 = assignedmanagedfacilities[0].ID;

//           let where = " where MD.ManageDataPointId = '"+insertedscope1+"' and TenantID = '"+TenantID+"' and  user_id = '"+user_id+"' ";
//           const assignedmanagedfacilities1 = await getSelectedColumn("`dbo.managedatapointcategory` MD  ",where,"MD.*" );

//           if(assignedmanagedfacilities1.length > 0){


//             await Promise.all(
//               assignedmanagedfacilities1?.map(async (sub) => {

//                 let where2 = ` where ManageDataPointCategoriesId = '${sub.ID}' and TenantID = '${TenantID}' and  user_id = '${user_id}'`;
//                 const deleted1 = await deleteData('`dbo.managedatapointsubcategory`',where2)
//                 console.log('1111')
//                 let where = ` where ManageDataPointId = '${insertedscope1}' and TenantID = '${TenantID}' and  user_id = '${user_id}'`;
//                 const deleted = await deleteData('`dbo.managedatapointcategory`',where)
//                 console.log('22222')
//               }));


//               let where1 = " where MD.facilityId = '"+FacilityId+"' and MD.ScopeID = '2'";
//               const deleted1 = await deleteData('`dbo.managedatapoint` MD',where1)
//               console.log('333333')
//           }

//         }
//       }

//       if(Scope3 == undefined){
//         let where = " where MD.facilityId = '"+FacilityId+"' and MD.ScopeID = '3'";
//         const assignedmanagedfacilities = await getSelectedColumn("`dbo.managedatapoint` MD  ",where,"MD.*" );


//         if(assignedmanagedfacilities.length > 0){


//           let insertedscope1 = assignedmanagedfacilities[0].ID;

//           let where = " where MD.ManageDataPointId = '"+insertedscope1+"' and TenantID = '"+TenantID+"' and  user_id = '"+user_id+"' ";
//           const assignedmanagedfacilities1 = await getSelectedColumn("`dbo.managedatapointcategory` MD  ",where,"MD.*" );

//           if(assignedmanagedfacilities1.length > 0){


//             await Promise.all(
//               assignedmanagedfacilities1?.map(async (sub) => {

//                 let where2 = ` where ManageDataPointCategoriesId = '${sub.ID}' and TenantID = '${TenantID}' and  user_id = '${user_id}'`;
//                 const deleted1 = await deleteData('`dbo.managedatapointsubcategory`',where2)
//                 console.log('1111')
//                 let where = ` where ManageDataPointId = '${insertedscope1}' and TenantID = '${TenantID}' and  user_id = '${user_id}'`;
//                 const deleted = await deleteData('`dbo.managedatapointcategory`',where)
//                 console.log('22222')
//               }));


//               let where1 = " where MD.facilityId = '"+FacilityId+"' and MD.ScopeID = '3'";
//               const deleted1 = await deleteData('`dbo.managedatapoint` MD',where1)
//               console.log('333333')
//           }

//         }
//       }


//       if(Scope1){
//         let insertedscope1 = "";

//         let category = {
//           ScopeID:1,
//           FacilityId:FacilityId?FacilityId:"",
//           user_id:user_id
//         }

//       let where = " where MD.facilityId = '"+FacilityId+"' and MD.ScopeID = '1'";
//       const assignedmanagedfacilities1 = await getSelectedColumn("`dbo.managedatapoint` MD  ",where,"MD.*" );

//         if(assignedmanagedfacilities1.length == 0){
//           const  assignedmanaged = await Addassignedmanagedatapoint(category);
//           insertedscope1 = assignedmanaged.insertId;
//         }else{
//           insertedscope1 = assignedmanagedfacilities1[0].ID;
//         }

//         let scope1data  = JSON.parse(Scope1);
//         if(scope1data.length > 0){
//           await Promise.all(
//             scope1data.map(async (item) => {

//              let category = {
//               ManageDataPointCategorySeedID:	item.category_id,
//             	ManageDataPointId	:	insertedscope1,
//               TenantID:TenantID,
//               user_id:user_id};

//               let where = " where MD.ManageDataPointId = '"+insertedscope1+"' and TenantID = '"+TenantID+"' and  user_id = '"+user_id+"' ";
//               const assignedmanagedfacilities = await getSelectedColumn("`dbo.managedatapointcategory` MD  ",where,"MD.*" );
//               if(assignedmanagedfacilities.length > 0){
//                      await Promise.all(
//                     assignedmanagedfacilities?.map(async (sub) => {
//                       let where3 = ` where ManageDataPointCategoriesId = '${sub.ID}'  and TenantID = '${TenantID}' and  user_id = '${user_id}'`;
//                        const deleted1 = await deleteData('`dbo.managedatapointsubcategory`',where3)

//                       let where4 = ` where ManageDataPointId = '${insertedscope1}' and TenantID = '${TenantID}' and  user_id = '${user_id}'`;
//                       const deleted = await deleteData('`dbo.managedatapointcategory`',where4)
//                     }));
//                 }
//                 const addcategory = await Addmanagedatapointcategory(category);

//                 if(addcategory.affectedRows > 0){
//                  let subcategory_id =  item.subcategory_id
//                  await Promise.all(
//                    subcategory_id?.map(async (sub) => {
//                      let category = {
//                        ManageDataPointSubCategorySeedID:sub,
//                        ManageDataPointCategoriesId	: addcategory.insertId	,
//                        TenantID:TenantID,
//                        user_id:user_id
//                      };

//                     //  let where6 = " where MD.ManageDataPointSubCategorySeedID = '"+sub+"' and TenantID = '"+TenantID+"' and  user_id = '"+user_id+"' ";
//                     //  const assignedfacilities = await getSelectedColumn("`dbo.managedatapointsubcategory` MD  ",where6,"MD.*" );
//                     //  if(assignedfacilities.length > 0){
//                     //   console.log('testtttttttttttttttttt')
//                     //      let where5 = ` where ManageDataPointSubCategorySeedID = '${sub}' and TenantID = '${TenantID}' and  user_id = '${user_id}'`;
//                     //      const deleted = await deleteData('`dbo.managedatapointsubcategory`',where5)
//                     //  }

//                       const addsubcategory = await Addmanagedatapointsubcategory(category);
//                       array.push(addsubcategory.insertId)



//                  }));
//                 }


//             }));
//         }

//       } 

//       if(Scope2){
//         let insertedscope1 = "";
//         let category = {
//           ScopeID:2,
//           FacilityId:FacilityId?FacilityId:"",
//           user_id:user_id
//         }

//       let where = " where MD.facilityId = '"+FacilityId+"' and MD.ScopeID = '2'";
//       const assignedmanagedfacilities1 = await getSelectedColumn("`dbo.managedatapoint` MD  ",where,"MD.*" );

//         if(assignedmanagedfacilities1.length == 0){

//           const  assignedmanaged = await Addassignedmanagedatapoint(category);
//           insertedscope1 = assignedmanaged.insertId;
//         }else{
//           insertedscope1 = assignedmanagedfacilities1[0].ID;
//         }
//         let scope1data  = JSON.parse(Scope2);

//         if(scope1data.length > 0){
//           await Promise.all(
//             scope1data.map(async (item) => {

//              let category = {
//               ManageDataPointCategorySeedID:	item.category_id,
//             	ManageDataPointId	:	insertedscope1,
//               TenantID:TenantID,
//               user_id:user_id};


//               let where = " where MD.ManageDataPointId = '"+insertedscope1+"' and TenantID = '"+TenantID+"' and  user_id = '"+user_id+"' ";
//               const assignedmanagedfacilities = await getSelectedColumn("`dbo.managedatapointcategory` MD  ",where,"MD.*" );
//               if(assignedmanagedfacilities.length > 0){
//                 await Promise.all(
//                assignedmanagedfacilities?.map(async (sub) => {
//                  let where3 = ` where ManageDataPointCategoriesId = '${sub.ID}'  and TenantID = '${TenantID}' and  user_id = '${user_id}'`;
//                   const deleted1 = await deleteData('`dbo.managedatapointsubcategory`',where3)

//                  let where4 = ` where ManageDataPointId = '${insertedscope1}' and TenantID = '${TenantID}' and  user_id = '${user_id}'`;
//                  const deleted = await deleteData('`dbo.managedatapointcategory`',where4)
//                }));
//               }
//                const addcategory = await Addmanagedatapointcategory(category);
//                if(addcategory.affectedRows > 0){

//                 let subcategory_id =  item.subcategory_id
//                 await Promise.all(
//                   subcategory_id?.map(async (sub) => {
//                     let category = {
//                       ManageDataPointSubCategorySeedID:sub,
//                       ManageDataPointCategoriesId	:addcategory.insertId	,
//                       TenantID:TenantID,
//                       user_id:user_id
//                     };

//                     // let where = " where MD.ManageDataPointSubCategorySeedID = '"+sub+"' and TenantID = '"+TenantID+"' and  user_id = '"+user_id+"' ";
//                     // const assignedfacilities = await getSelectedColumn("`dbo.managedatapointsubcategory` MD  ",where,"MD.*" );
//                     // if(assignedfacilities.length > 0){

//                     //     where = ` where ManageDataPointSubCategorySeedID = '${sub}' and TenantID = '${TenantID}' and  user_id = '${user_id}'`;
//                     //     const deleted = await deleteData('`dbo.managedatapointsubcategory`',where)

//                     // }

//                     const addsubcategory = await Addmanagedatapointsubcategory(category);
//                     array.push(addsubcategory.insertId)
//                 }));

//                }

//             }));
//         }
//       } 

//       if(Scope3){
//         let insertedscope1 = "";
//         let category = {
//           ScopeID:3,
//           FacilityId:FacilityId?FacilityId:"",
//           user_id:user_id
//         }

//       let where = " where MD.facilityId = '"+FacilityId+"' and MD.ScopeID = '3'";
//       const assignedmanagedfacilities1 = await getSelectedColumn("`dbo.managedatapoint` MD  ",where,"MD.*" );

//         if(assignedmanagedfacilities1.length == 0){
//           const  assignedmanaged = await Addassignedmanagedatapoint(category);
//           insertedscope1 = assignedmanaged.insertId;
//         }else{
//           insertedscope1 = assignedmanagedfacilities1[0].ID;
//         }
//         let scope1data  = JSON.parse(Scope3);
//         if(scope1data.length > 0){
//           await Promise.all(
//             scope1data.map(async (item) => {
//              let category = {
//               ManageDataPointCategorySeedID:	item.category_id,
//             	ManageDataPointId	:	insertedscope1,
//               TenantID:TenantID,
//               user_id:user_id};

//               let where = " where MD.ManageDataPointId = '"+insertedscope1+"' and TenantID = '"+TenantID+"' and  user_id = '"+user_id+"' ";
//               const assignedmanagedfacilities = await getSelectedColumn("`dbo.managedatapointcategory` MD  ",where,"MD.*" );
//               if(assignedmanagedfacilities.length > 0){
//                 await Promise.all(
//                   assignedmanagedfacilities?.map(async (sub) => {
//                     let where3 = ` where ManageDataPointCategoriesId = '${sub.ID}'  and TenantID = '${TenantID}' and  user_id = '${user_id}'`;
//                     const deleted1 = await deleteData('`dbo.managedatapointsubcategory`',where3)

//                     let where4 = ` where ManageDataPointId = '${insertedscope1}' and TenantID = '${TenantID}' and  user_id = '${user_id}'`;
//                     const deleted = await deleteData('`dbo.managedatapointcategory`',where4)
//                   }));
//                }
//                const addcategory = await Addmanagedatapointcategory(category);

//                let subcategory_id =  item.subcategory_id
//                 await Promise.all(
//                   subcategory_id?.map(async (sub) => {
//                     let category = {
//                       ManageDataPointSubCategorySeedID:sub,
//                       ManageDataPointCategoriesId	:addcategory.insertId	,
//                       TenantID:TenantID,
//                       user_id:user_id
//                     };
//                     // let where = " where MD.ManageDataPointSubCategorySeedID = '"+sub+"' and TenantID = '"+TenantID+"' and  user_id = '"+user_id+"' ";
//                     // const assignedfacilities = await getSelectedColumn("`dbo.managedatapointsubcategory` MD  ",where,"MD.*" );
//                     // if(assignedfacilities.length > 0){

//                     //     where = ` where ManageDataPointSubCategorySeedID = '${sub}' and TenantID = '${TenantID}' and  user_id = '${user_id}'`;
//                     //     const deleted = await deleteData('`dbo.managedatapointsubcategory`',where)

//                     // }

//                     const addsubcategory = await Addmanagedatapointsubcategory(category);
//                     array.push(addsubcategory.insertId)
//                 }));

//             }));
//         }
//       } 

//       if (array.length  >0) {
//           return res.json({
//           success: true,
//           message: "Succesfully Added category",
//           array:array,
//           status: 200,
//           });
//       } else {
//           return res.json({
//           success: false,
//           message: "Some problem occured while Adding category",
//           status: 500,
//           });
//       }
//     }
//   } catch (err) {
//       console.log(err);
//       return res.json({
//       success: false,
//       message: "Internal server error",
//       error: err,
//       status: 500,
//       });
//   }
// };

exports.AddstationarycombustionLiquid = async (req, res) => {
  try {
    const { ReadingValue, Unit, Note, Year, Month, BlendType, BlendID, TypeID, TypeName } = req.body;
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

      let category = {
        ReadingValue: ReadingValue ? ReadingValue : "",
        Unit: Unit ? Unit : "",
        Note: Note ? Note : "",
        TypeID: TypeID ? TypeID : "",
        BlendID: BlendID ? BlendID : "",
        BlendType: BlendType ? BlendType : "",
        Year: Year ? Year : "",
        TypeName: TypeName ? TypeName : "",
        facilities: facilities ? facilities : "",
        user_id: user_id,
        batch: batch,
      }

      let months = JSON.parse(Month);
      for (let monthdata of months) {
        category.Month = monthdata;
        const processing_of_sold = await AddstationarycombustionLiquid(category);
        if (processing_of_sold.affectedRows > 0) {
          insertId = processing_of_sold.insertId
          allinsertedID.push(insertId);
        }
      }
    }

    if (allinsertedID.length > 0) {

      let where = ` where user_id =  '${user_id}' and facilities = '${facilities}'`;
      const water_supplytreatmentcategory1 = await getSelectedColumn("stationarycombustionde", where, "*");
      return res.json({
        success: true,
        message: "Succesfully Added stationary combustion Liquid Fuels",
        categories: water_supplytreatmentcategory1,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Some problem occured while Adding stationary combustion Liquid Fuels",
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

exports.Addrefrigerant = async (req, res) => {
  try {
    let user_id = req.user.user_id;

    let allinsertedID = [];
    const { refAmount, unit, note, year, months, SubCategorySeedID, subCategoryTypeId, facilities } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        refAmount: [Joi.string().empty().required()],
        unit: [Joi.string().empty().required()],
        note: [Joi.optional().allow("")],
        year: [Joi.string().empty().required()],
        months: [Joi.string().empty().required()],
        SubCategorySeedID: [Joi.string().empty().required()],
        facilities: [Joi.string().empty().required()],
        subCategoryTypeId: [Joi.string().empty().required()],
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

      let countrydata = await country_check(facilities);

      if (countrydata.length == 0) {
        return res.json({
          success: false,
          message: "EF not Found while Adding refrigents",
          status: 400,
        });
      }
      const refunit = await getrefrigerant(subCategoryTypeId, countrydata[0].CountryId);
      let GHGEmission = "";
      if (refunit.length > 0) {
        let yearRange = refunit[0]?.Fiscal_Year; // The string representing the year range
        let [startYear, endYear] = yearRange.split('-').map(Number);

        if (year >= startYear && year <= endYear) {
          GHGEmission = parseFloat(refunit[0].kgCO2e_kg * refAmount);
        } else if (year == startYear) {
          GHGEmission = parseFloat(refunit[0].kgCO2e_kg * refAmount);
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
          message: "EF not Found while Adding refrigents",
          status: 400,
        });
      }

      let category = {
        refAmount: refAmount ? refAmount : "",
        Unit: unit ? unit : "",
        note: note ? note : "",
        subCategoryTypeId: subCategoryTypeId ? subCategoryTypeId : "",
        GHGEmission: GHGEmission,
        SubCategorySeedID: SubCategorySeedID ? SubCategorySeedID : "",
        year: year ? year : "",
        facilities: facilities ? facilities : "",
        user_id: user_id,
        CreatedDate: moment().format("YYYY-MM-DD"),
        TenantID: 4,
        Active: 1,
        SendForApproval: "yes",
        FileName: req.file != undefined ? req.file.filename : null
      };

      let month = JSON.parse(months);
      for (let monthdata of month) {
        category.months = monthdata;
        const refrigerant = await Addrefrigerant(category);
        if (refrigerant.affectedRows > 0) {
          let insertId = refrigerant.insertId;
          allinsertedID.push(insertId);
        }
      }

      if (allinsertedID.length > 0) {
        let where = ` where user_id ='${user_id}' and facilities = '${facilities}'`;
        const refrigents = await getSelectedColumn("`dbo.refrigerantde`", where, "*");
        return res.json({
          success: true,
          message: "Successfully Added refrigents",
          categories: refrigents,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occurred while Adding refrigents",
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

exports.Allrefrigerant = async (req, res) => {
  try {
    let user_id = req.user.user_id;

    // Fetch all refrigerants for the user
    const Allrefrigerant = await Allrefrigerants(user_id);

    if (Allrefrigerant.length > 0) {
      return res.json({
        success: true,
        message: "Successfully fetched refrigerants",
        categories: Allrefrigerant,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "No refrigerants found",
        status: 404,
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
      status: 500,
    });
  }
};

exports.getrefrigents = async (req, res) => {
  try {
    let where = `WHERE SubCategorySeedID = '${SubCategorySeedID}'`;
    const getSoldproduct = await getSelectedColumn("`dbo.refrigents`", where, "*");

    if (getSoldproduct.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Successfully fetched refrigerants",
        categories: getSoldproduct,
        status: 200,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "No refrigerants found for the given SubCategorySeedID",
        status: 404,
      });
    }
  } catch (err) {
    console.error("Error fetching refrigerants:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
      status: 500,
    });
  }
};

exports.Addfireextinguisher = async (req, res) => {
  try {
    let allinsertedID = [];
    const { NumberOfExtinguisher, unit, note, year, months, SubCategorySeedID, quantityOfCO2makeup, facilities } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        fireExtinguisherID: [Joi.optional().allow("")],
        NumberOfExtinguisher: [Joi.string().empty().required()],
        unit: [Joi.string().empty().required()],
        note: [Joi.optional().allow("")],
        year: [Joi.string().empty().required()],
        months: [Joi.string().empty().required()],
        SubCategorySeedID: [Joi.string().empty().required()],
        facilities: [Joi.string().empty().required()],
        quantityOfCO2makeup: [Joi.string().empty().required()],
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

      // console.log(countrydata[0].CountryId);
      if (countrydata.length == 0) {
        return res.json({
          success: false,
          message: "EF not Found while Adding refrigents",
          status: 400,
        });
      }
      const refunit = await getfireextinguisher(SubCategorySeedID, countrydata[0].CountryId);
      let GHGEmission = ""
      if (refunit.length > 0) {

        let yearRange = refunit[0]?.Fiscal_Year; // The string representing the year range
        let [startYear, endYear] = yearRange.split('-').map(Number);

        if (year >= startYear && year <= endYear) {
          GHGEmission = parseFloat(refunit[0].kgCO2e_kg * NumberOfExtinguisher) * quantityOfCO2makeup;
        } else if (year == startYear) {
          GHGEmission = parseFloat(refunit[0].kgCO2e_kg * NumberOfExtinguisher) * quantityOfCO2makeup;
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
          message: "EF not Found while Adding refrigents",
          status: 400,
        });
      }

      let category = {
        NumberOfExtinguisher: NumberOfExtinguisher ? NumberOfExtinguisher : "",
        Unit: unit ? unit : "",
        note: note ? note : "",
        GHGEmission: GHGEmission,
        SubCategorySeedID: SubCategorySeedID ? SubCategorySeedID : "",
        quantityOfCO2makeup: quantityOfCO2makeup ? quantityOfCO2makeup : "",
        year: year ? year : "",
        facilities: facilities ? facilities : "",
        user_id: user_id,
        CreatedDate: moment().format('YYYY-MM-DD'),
        TenantID: 4,
        Active: 1,
        SendForApproval: 'yes',
        FileName: req.file != undefined ? req.file.filename : null
      }



      let month = JSON.parse(months);
      for (let monthdata of month) {
        category.months = monthdata;
        const fireextinguisher = await Addfireextinguisher(category);
        if (fireextinguisher.affectedRows > 0) {
          let insertId = fireextinguisher.insertId
          allinsertedID.push(insertId);
        }
      }


      if (allinsertedID.length > 0) {

        let where = ` where user_id ='${user_id}' and facilities = '${facilities}'`;
        const refrigents = await getSelectedColumn("`dbo.fireextinguisherde`", where, "*");
        return res.json({
          success: true,
          message: "Succesfully Added fireextinguisher",
          categories: refrigents,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while Adding fireextinguisher",
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

exports.Getfireextinguisher = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const Allfireexting = await Allfireextinguisher(user_id);

    if (Allfireexting && Allfireexting.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Successfully fetched fire extinguishers",
        categories: Allfireexting,
        status: 200,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "No fire extinguishers found",
        status: 404,
      });
    }
  } catch (err) {
    console.error("Error fetching fire extinguishers:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
      status: 500,
    });
  }
};

exports.Getpassengervehicletypes = async (req, res) => {
  try {
    const { facilityId , year } = req.query;
    const schema = Joi.object({
      facilityId: Joi.string().required().not(null, '').messages({
        "string.base": "facilityId must be a string",
        "any.required": "facilityId is required",
        "string.empty": "facilityId cannot be empty",
      })
    ,
      year: Joi.string().required().not(null, '').messages({
        "string.base": "year must be a string",
        "any.required": "year is required",
        "string.empty": "year cannot be empty",
      })
    });

    const result = schema.validate(req.query, { abortEarly: false });

    if (result.error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: result.error.details.map((i) => i.message),
        status: 400,
      });
    } else {
      const countryReponse = await country_check(facilityId);
      const passengervehicletypes = await getpassengervehicletypes(countryReponse[0].CountryId , year);
      if (passengervehicletypes.length > 0) {
        return res.status(200).json({
          success: true,
          message: "Successfully fetched passenger vehicle types",
          categories: passengervehicletypes,
          status: 200,
        });
      } else {
        return res.status(200).json({
          success: false,
          message: "No passenger vehicle types found",
          status: 404,
        });
      }
    }
  } catch (err) {
    console.error("Error fetching passenger vehicle types:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
      status: 500,
    });
  }
};

exports.Getdeliveryvehicletypes = async (req, res) => {
  try {
    const { facilityId , year } = req.query;
    const schema = Joi.object({
      facilityId: Joi.string().required().not(null, '').messages({
        "string.base": "facilityId must be a string",
        "any.required": "facilityId is required",
        "string.empty": "facilityId cannot be empty",
      }),
      year: Joi.string().required().not(null, '').messages({
        "string.base": "year must be a string",
        "any.required": "year is required",
        "string.empty": "year cannot be empty",
      })
    });

    const result = schema.validate(req.query, { abortEarly: false });

    if (result.error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: result.error.details.map((i) => i.message),
        status: 400,
      });
    } else {
      const countryReponse = await country_check(facilityId);
      const deliveryvehicletypes = await getdeliveryvehicletypes(countryReponse[0].CountryId ,year );
      if (deliveryvehicletypes.length > 0) {
        return res.status(200).json({
          success: true,
          message: "Successfully fetched delivery vehicle types",
          categories: deliveryvehicletypes,
          status: 200,
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "No delivery vehicle types found",
          status: 404,
        });
      }
    }
  } catch (err) {
    console.error("Error fetching delivery vehicle types:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
      status: 500,
    });
  }
};

exports.Addcompanyownedvehicles = async (req, res) => {
  try {
    let allInsertedIDs = [];
    const {
      NoOfVehicles, unit, note, year, months, SubCategorySeedID,
      TotalnoOftripsPerVehicle, vehicleTypeID, Value, facilities, ModeofDEID, charging_outside
    } = req.body;

    // Joi Validation Schema
    const schema = Joi.object({
      NoOfVehicles: Joi.string().required(),
      TotalnoOftripsPerVehicle: Joi.string().required(),
      unit: Joi.string().required(),
      note: Joi.string().optional().allow(""),
      year: Joi.string().required(),
      months: Joi.string().required(),
      SubCategorySeedID: Joi.string().required(),
      facilities: Joi.string().required(),
      vehicleTypeID: Joi.string().required(),
      Value: Joi.string().required(),
      ModeofDEID: Joi.string().required(),
      charging_outside: Joi.string().optional().allow("")
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        status: 400,
      });
    }

    const user_id = req.user.user_id;

    if (!user_id) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    // Fetch Country Data
    const countryData = await country_check(facilities);
    if (countryData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "EF not found while adding company-owned vehicles",
      });
    }

    const countryId = countryData[0].CountryId;
    const refUnit = await getvehicletypes(vehicleTypeID, SubCategorySeedID, countryId);

    if (refUnit.length === 0) {
      return res.status(400).json({
        success: false,
        message: "EF not found for this vehicle type and category",
      });
    }

    // GHG Emission Calculation
    const calculateGHGEmission = (refUnit, unit, noOfVehicles, totalTrips, value, chargingOutside) => {
      let efs = unit === 'Km' ? parseFloat(refUnit.kgCO2e_km) : unit === 'Litre' ? parseFloat(refUnit.kgCO2e_litre) : parseFloat(refUnit.kgCO2e_ccy);
      if (chargingOutside) {
        let emissionFactor = efs * parseFloat(refUnit.kgCO2e_kg);
        return parseFloat(noOfVehicles) * parseFloat(totalTrips) * parseFloat(value) * emissionFactor;
      }
      return parseFloat(noOfVehicles) * parseFloat(totalTrips) * parseFloat(value) * efs;
    };

    const { Fiscal_Year } = refUnit[0];
    const [startYear, endYear] = Fiscal_Year.split('-').map(Number);

    if (year < startYear || year > endYear) {
      return res.status(400).json({
        success: false,
        message: "EF not found for this year",
      });
    }

    let GHGEmission = calculateGHGEmission(refUnit[0], unit, NoOfVehicles, TotalnoOftripsPerVehicle, Value, charging_outside);

    // Insert Data
    let category = {
      NoOfVehicles, Unit: unit, note, GHGEmission, SubCategorySeedID,
      TotalnoOftripsPerVehicle, Value, vehicleTypeID, year, facilities,
      user_id, CreatedDate: moment().format('YYYY-MM-DD'), TenantID: 4,
      Active: 1, SendForApproval: 'yes', ModeofDEID
    };

    let parsedMonths = JSON.parse(months);
    for (let month of parsedMonths) {
      category.months = month;
      const result = await Addcompanyownedvehicles(category);
      if (result.affectedRows > 0) {
        allInsertedIDs.push(result.insertId);
      }
    }

    if (allInsertedIDs.length > 0) {
      const whereClause = ` WHERE user_id ='${user_id}' AND facilities = '${facilities}'`;
      const refrigents = await getSelectedColumn("`dbo.vehiclede`", whereClause, "*");

      return res.status(200).json({
        success: true,
        message: "Successfully added company-owned vehicles",
        categories: refrigents,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Error occurred while adding company-owned vehicles",
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err,
    });
  }
};

exports.addMultipleCompanyOwnedVehicles = async (req, res) => {
  try {
    const { facilityId, year, month, jsonData } = req.body;

    const schema = Joi.object({
      facilityId: Joi.string().required().not(null, '').messages({
        "string.base": "facilityId must be a string",
        "any.required": "facilityId is required",
        "string.empty": "facilityId cannot be empty",
      }),
      year: Joi.string().required().not(null, '').messages({
        "string.base": "year must be a string",
        "any.required": "year is required",
        "string.empty": "year cannot be empty",
      }),
      month: Joi.string().required().not(null, '').messages({
        "string.base": "month must be a string",
        "any.required": "month is required",
        "string.empty": "month cannot be empty",
      }),
      jsonData: Joi.string().required().messages({
        "string.base": "jsonData must be a string",
        "any.required": "jsonData is required",
        "string.empty": "jsonData cannot be empty",
      }),
      file: Joi.string().optional()
    });

    const result = schema.validate(req.body, { abortEarly: false });

    if (result.error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: result.error.details.map((i) => i.message),
        status: 400,
      });
    } else {
      const vehicles = JSON.parse(jsonData);
      let allinsertedID = [];
      let user_id = req.user.user_id;

      let countrydata = await country_check(facilityId);

      if (!countrydata.length) {
        return res.status(400).json({ error: true, message: "EF not found while adding company owned vehicles", success: false });
      }

      let charging_outside = 'undefined';
      let note = '';
      let refunit;
      for (let val of vehicles) {
        if (val.is_excel == 1) {
          refunit = await getvehicletypesByName(val.vehicle_type, val.sub_category, facilityId);
        } else {
          refunit = await getvehicletypes(val.vehicle_type, val.sub_category, countrydata[0].CountryId);
        }
        let GHGEmission = ""
        let no_of_vehicles;
        let trip_per_vehicle;
        if (refunit.length > 0) {
          let yearRange = refunit[0]?.Fiscal_Year;
          let [startYear, endYear] = yearRange.split('-').map(Number);
          no_of_vehicles = val.no_of_vehicles ? parseFloat(val.no_of_vehicles) : 1;
          trip_per_vehicle = val.trip_per_vehicle ? parseFloat(val.trip_per_vehicle) : 1;
          let value = val.value ? parseFloat(val.value) : 0;
          if (year >= startYear && year <= endYear) {
            if (charging_outside != "undefined") {
              let efs = 0;
              if (val.unit == 'Km') {
                efs = parseFloat(refunit[0].kgCO2e_km);
              }
              if (val.unit == 'Litre') {
                efs = parseFloat(refunit[0].kgCO2e_litre);
              }
              let emissionef = efs + parseFloat(charging_outside) / 100 * parseFloat(refunit[0].kgCO2e_kg);
              GHGEmission = val.is_excel == 1 ? parseFloat(val.value) * parseFloat(emissionef) : no_of_vehicles * trip_per_vehicle * parseFloat(val.value) * parseFloat(emissionef);
            } else {
              if (val.unit == 'Km') {
                GHGEmission = val.is_excel == 1 ? (parseFloat(refunit[0].kgCO2e_km) * parseFloat(val.value)) : (parseFloat(refunit[0].kgCO2e_km) * no_of_vehicles * trip_per_vehicle * parseFloat(val.value));
              }
              if (val.unit == 'Litre') {
                GHGEmission = val.is_excel == 1 ? (parseFloat(refunit[0].kgCO2e_litre) * parseFloat(val.value)) : (parseFloat(refunit[0].kgCO2e_litre) * no_of_vehicles * trip_per_vehicle * parseFloat(val.value));
              }
              if (val.unit != 'Km' && val.unit != 'Litre') {
                GHGEmission = val.is_excel == 1 ? (parseFloat(refunit[0].kgCO2e_ccy) * parseFloat(val.value)) : (parseFloat(refunit[0].kgCO2e_ccy) * no_of_vehicles * trip_per_vehicle * parseFloat(val.value));
              }
            }
          } else if (year == startYear) {
            if (charging_outside != "undefined") {
              let efs = 0;
              if (val.unit == 'Km') {
                efs = parseFloat(refunit[0].kgCO2e_km);
              }
              if (val.unit == 'Litre') {
                efs = parseFloat(refunit[0].kgCO2e_litre);
              }
              let emissionef = efs + parseFloat(charging_outside) / 100 * parseFloat(refunit[0].kgCO2e_kg);
              GHGEmission = val.is_excel == 1 ? parseFloat(val.value) * parseFloat(emissionef) : no_of_vehicles * trip_per_vehicle * parseFloat(val.value) * parseFloat(emissionef);
            } else {
              if (val.unit == 'Km') {
                GHGEmission = val.is_excel == 1 ? (parseFloat(refunit[0].kgCO2e_km) * parseFloat(val.value)) : (parseFloat(refunit[0].kgCO2e_km) * no_of_vehicles * trip_per_vehicle * parseFloat(val.value));
              }
              if (val.unit == 'Litre') {
                GHGEmission = val.is_excel == 1 ? (parseFloat(refunit[0].kgCO2e_litre) * parseFloat(val.value)) : (parseFloat(refunit[0].kgCO2e_litre) * no_of_vehicles * trip_per_vehicle * parseFloat(val.value));
              }
              if (val.unit != 'Km' && val.unit != 'Litre') {
                GHGEmission = val.is_excel == 1 ? (parseFloat(refunit[0].kgCO2e_ccy) * parseFloat(val.value)) : (parseFloat(refunit[0].kgCO2e_ccy) * no_of_vehicles * trip_per_vehicle * parseFloat(val.value));
              }
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
            message: "EF not found while adding company owned vehicles",
            status: 400,
          });
        }
        const months = JSON.parse(month)

        let category = {
          NoOfVehicles: no_of_vehicles ? no_of_vehicles : "",
          Unit: val.unit ? val.unit : "",
          note: note ? note : "",
          GHGEmission: GHGEmission,
          SubCategorySeedID: val.sub_category ? val.sub_category : "",
          TotalnoOftripsPerVehicle: trip_per_vehicle ? trip_per_vehicle : "",
          Value: val.value ? val.value : 0,
          vehicleTypeID: val.is_excel == 1 && refunit.length > 0 ? refunit[0].ID : val.vehicle_type || 0,
          year: year ? year : "",
          months: months[0] ? months[0] : "",
          facilities: facilityId ? facilityId : "",
          user_id: user_id,
          CreatedDate: moment().format('YYYY-MM-DD'),
          TenantID: user_id,
          Active: 1,
          SendForApproval: 'yes',
          ModeofDEID: val.mode_of_data_entry ? val.mode_of_data_entry : "",
          vehicle_model: val.is_excel == 1 ? val.vehicle_type : null,
          FileName: req.file != undefined ? req.file.filename : null
        }

        const fireextinguisher = await Addcompanyownedvehicles(category);
        if (fireextinguisher.affectedRows > 0) {
          let insertId = fireextinguisher.insertId
          allinsertedID.push(insertId);
        }
      }

      if (allinsertedID.length > 0) {
      
        return res.json({
          success: true,
          message: "Succesfully Added company owned vehicles",
          categories: '',
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while Adding company owned vehicles",
          status: 500,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: true, message: "Internal Server Error " + error.message, success: false });
  }
};

exports.getAllcompanyownedvehicles = async (req, res) => {
  try {
    const { ModeofDEID } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        ModeofDEID: [Joi.string().empty().required()],
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

      const deliveryvehicletypes = await getAllcompanyownedvehicles(user_id, ModeofDEID);
      if (deliveryvehicletypes.length > 0) {
        return res.json({
          success: true,
          message: "Succesfully fetched company owned vehicles",
          categories: deliveryvehicletypes,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while selecting company owned vehicles",
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

exports.getAllcategoryByfacility = async (req, res) => {
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
      let subcategory = [];
      let array = [];
      let where = " LEFT JOIN `dbo.scopeseed` S ON S.ID = MD.ScopeID where MD.facilityId = '" + id + "' ORDER BY MD.ScopeID ASC";
      const facilities = await getSelectedColumn("`dbo.managedatapoint` MD  ", where, "MD.*,S.scopeName");



      await Promise.all(
        facilities.map(async (item) => {
          //item.FacilityId = facilityId 
          let where = "  where  MD.ScopeId = '" + item.ScopeID + "'";
          const managePointCategories = await getSelectedColumn("`dbo.categoryseeddata` MD ", where, "MD.* ");
          if (managePointCategories.length > 0) {
            array = array.concat(managePointCategories);
            // array = [...managePointCategories];
          }

        })
      );


      if (array.length > 0) {
        return res.json({
          success: true,
          message: "Succesfully fetched facilities",
          categories: array,
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

exports.getAttahcmentsbyFacilityID = async (req, res) => {
  try {
    const { facilityId } = req.query;
    const schema = Joi.alternatives(
      Joi.object({
        facilityId: [Joi.number().empty().required()],
      })
    );
    const result = schema.validate(req.query);
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
      const fileUrl = `${config.live_base_url}/uploads/`
      const [stationaryCombustionde, refrigerants, fireExtinguisher, companyOwnedVehichle, electricity, heatAndSteam, purchasedGoodsAndServices, bussinessTravel] = await Promise.all([
        fetchStationaryCombustiondeByFacilityId(facilityId, fileUrl),
        fetchRefrigerantsByFacilityId(facilityId, fileUrl),
        fetchFireExtinguisherByFacilityId(facilityId, fileUrl),
        fetchCompanyOwnedVehichleByFacilityId(facilityId, fileUrl),
        fetchElectricityByFacilityId(facilityId, fileUrl),
        fetchHeatAndSteamByFacilityId(facilityId, fileUrl),
        fetchPurchasedGoodsAndServicesByFacilityId(facilityId, fileUrl),
        fetchBussinessTravelByFacilityId(facilityId, fileUrl),
      ])

      return res.status(200).json({
        error: false, message: "Attachments retrieved successfully", success: true, data: {
          stationaryCombustionde,
          refrigerants,
          fireExtinguisher,
          companyOwnedVehichle,
          electricity,
          heatAndSteam,
          purchasedGoodsAndServices,
          bussinessTravel
        }
      })
    }
  } catch (error) {
    return res.status(500).json({ error: true, message: "Internal server error " + error.message, success: false })
  }
};