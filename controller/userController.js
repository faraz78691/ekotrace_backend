const Joi = require("joi");
const moment = require("moment");
const config = require("../config");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
var GeoPoint = require("geopoint");
const ExcelJS = require("exceljs");
const nodemailer = require('nodemailer');
const path = require('node:path');
const fs = require("fs");
const ejs = require('ejs');

const {
  fetchUserByEmail,
  fetchUserByEmailOrUsername,
  fetchEmail,
  fetchEmailUser,
  fetchUserByUserName,
  fetchfacilitiesBytenants,
  user_offseting,
  Allfireextinguisher,
  fetchUserBySuperAdmin,
  getCombustionEmission,
  Allrefrigerants,
  getAllcompanyownedvehicles,
  getAllelectricity,
  getAllheatandsteam,
  purchaseGoodsDetails,
  flight_travelDetails,
  water_supply_treatment_categoryDetails,
  endoflife_waste_typeDetails,
  sold_product_categoryDetails,
  other_modes_of_transportDetails,
  hotel_stayDetails,
  processing_of_sold_products_categoryDetails,
  employee_commuting_categoryDetails,
  waste_generated_emissionsDetails,
  homeoffice_categoryDetails,
  upstreamLease_emissionDetails,
  downstreamLease_emissionDetails,
  investment_emissionsDetails,
  upstream_vehicle_storage_emissions,
  downstream_vehicle_storage_emissions,
  franchise_categories_emissionDetails,
  updateAllData,
  updateAllDataeject,
  Updategroup,
  Addtenants,
  Addpackages_user,
  fetchAllusers,
  getRoles,
  getcountries,
  registerUser,
  registeruserRoles,
  Addgroup,
  Addfacilities,
  getGroups,
  Addgroupmapping,
  addVendor,
  update_user_offseting,
  updatehazadrous_nonhazadrous,
  addhazadrous_nonhazadrous,
  addcost_center,
  addfinancial_year,
  registerPackage,
  fetchDatabyId,
  updatePackages,
  updateUserTenant,
  getCombustionEmissionFuel,

  //  new models forgotpassword
  updateToken,
  fetchByForgotToken,
  updatePassword,
  getflightEF,
  findFacilityWithCountryCode,
  findVendorByTenantId,
  getPurchaseCategoriesEf,
  getAllPurchaseCategoriesEf,
  findCompanyOwnedVehicleByItemType,
  addVechileFeet,
  updateVechileFeet,
  deleteVehicleFleetByFacilityId,
  getVehicleFleetByFacilityId,
  getVehicleFleetByFacilityCategoryId,
  insertPurchaseGoodsPayloads,
  insertPurchaseGoodsMatched,
  insertPurchaseGoodsUnmatched,
  getPurchaseGoodsPayloadsByUserAndFacilityId,
  purchase_goods_matched_items_ai_by_payload_id, rejectEntries,
  purchase_goods_categories_ef_by_match_productCategory_Id, deleteById, findCountryNamebyCode, deleteEntries,purchase_goods_matched_items_ai_by_payload_id_and_status_paginated
} = require("../models/user");

const {
  getSelectedColumn,
  updateData,
  deleteData,
  getSelectedData,
  country_check
} = require("../models/common");

const {
  getLatLongByCode,
  getFlightParams,
} = require("../models/businesstravel");

const {
  fetchVehicleId,
  fetchVehicleByVehicleTypeId,
  fetchVehicleEmission,
} = require("../models/downstream_trans");

const {
  soldproductsemission_factors,
  homeoffice_emission_factors,
  endof_lifeSubCatmission_factors,
  water_supply_treatment_type,
  endoflife_waste_type,
} = require("../models/businesstravel");

const baseurl = config.base_url;
const bcrypt = require('bcryptjs');
const JWT_SECRET = 'my-32-character-ultra-secure-and-ultra-long-secret'

function generateRandomString(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Create a Nodemailer transporter
const sendEmail = async (mailOptions) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'ekobons@gmail.com',
      pass: 'okkbtvsicbhgcaaz',
    },
  });

  // Send the email
  return transporter.sendMail(mailOptions);
};

async function calculateflight(distance, from, to) {
  if (from && to) {
    const fromAPoint = await getLatLongByCode(from);
    const toBPoint = await getLatLongByCode(to);
    //  console.log(fromAPoint,'---------',toBPoint)
    if (fromAPoint.length <= 0 || toBPoint.length <= 0) {
      return 0;
    }
    const from_latitude = fromAPoint[0]?.latitude;
    const from_longitude = fromAPoint[0]?.longitude;
    const to_latitude = toBPoint[0]?.latitude;
    const to_longitude = toBPoint[0]?.longitude;

    const toPoint = new GeoPoint(Number(to_latitude), Number(to_longitude));
    const fromPoint = new GeoPoint(
      Number(from_latitude),
      Number(from_longitude)
    );
    result = fromPoint?.distanceTo(toPoint, true);
  } else {
    result = distance;
  }

  if (result != undefined && result.length != 0) {
    var search_str;
    if (result > 0 && result < 900) {
      search_str = "0-900";
    } else if (result > 900 && result < 1400) {
      search_str = "900-1400";
    } else if (result > 1400 && result < 3000) {
      search_str = "1400-3000";
    } else if (result > 3000 && result < 9000) {
      search_str = "3000-9000";
    } else if (result > 9000 && result < 13000) {
      search_str = "9000-13000";
    } else {
      search_str = "13000";
    }
    const flightParams = await getFlightParams(search_str, 101);
    // console.log( flightParams[0].ef,'flightParams----------------');
    if (flightParams.length <= 0) {
      return 0.0;
    } else {
      return parseFloat(flightParams[0].ef);
    }
  } else {
    return 0.0;
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const schema = Joi.alternatives(
      Joi.object({
        email: [Joi.string().empty().required()],
        password: Joi.string().min(8).max(15).required().messages({
          "any.required": "{{#label}} is required!!",
          "string.empty": "can't be empty!!",
          "string.min": "minimum 8 value required",
          "string.max": "maximum 15 values allowed",
        }),
      })
    );
    const result = schema.validate(req.body);


    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const data = await fetchUserByEmailOrUsername(email);

      let array = "";
      let where2 = ` where  A.is_super_admin ='1'`;
      const super_admin = await getSelectedColumn(
        "`dbo.tenants` A ",
        where2,
        "A.Id as super_admin_id"
      );

      if (super_admin.length > 0) {
        array = super_admin;
      }

      if (data.length !== 0) {
        if (email == data[0].Email || email == data[0].userName) {
          const getPass = await getSelectedColumn('`dbo.aspnetusers`', `where user_id = '${data[0].user_id}'`, 'passwordHash');

          if (await bcrypt.compare(password, getPass[0]?.passwordHash)) {
            const toke = jwt.sign({ user_id: data[0].Id }, JWT_SECRET, { expiresIn: '24h' });
            let data1 = await fetchUserByEmail(email);
            await Promise.all(
              data1.map(async (item) => {
                let where =
                  ` LEFT JOIN  \`dbo\.\aspnetroles\` B ON B.Id = A.roleId where  A.tenant_id ='` +
                  data[0].Id +
                  `'`;
                const roles = await getSelectedColumn(
                  "`dbo.aspnetuserroles` A ",
                  where,
                  "A.facilityID,A.roleId,A.userId,B.Name"
                );
                item.token = toke;

                //let where1 = `  LEFT JOIN  packages B ON B.id = A.package_id  where  A.facility_id IN('` + roles[0]?.facilityID + `') and A.tenantID  ='` + data[0].Id + `'`;
                //const packagesusers = await getSelectedColumn("packages_users A ", where1, "B.*,B.package_name,B.id as package_id,A.facility_id,A.expired_at");
                // console.log(packagesusers,"packagesuserspackagesusers");
                let where1 =
                  `  LEFT JOIN  packages B ON B.id = A.package_id  where  A.tenantID  ='` +
                  data1[0].tenantID +
                  `'`;
                const packagesusers = await getSelectedColumn(
                  "packages_users A ",
                  where1,
                  "B.*,B.package_name,B.id as package_id,A.facility_id,A.expired_at"
                );

                item.licenseExpired = packagesusers[0]?.expired_at;
                item.package_id = packagesusers[0]?.package_id;
                item.package_name = packagesusers[0]?.package_name;
                item.package_info = packagesusers[0];

                if (array) {
                  const exists = array.some(
                    (item1) => item1.super_admin_id === item.tenantID
                  );
                  console.log(exists, "--------", array);
                  console.log("roles[0]?.Name =>", roles[0]?.Name);

                  if (exists == true && roles[0]?.Name == "Super Admin") {
                    item.super_admin_id = item.Id;
                    item.role = roles[0]?.Name;
                  } else if (
                    exists == true &&
                    roles[0]?.Name != "Super Admin"
                  ) {
                    item.super_admin_id = item.tenantID;
                    item.role = roles[0]?.Name;
                  } else {
                    item.super_admin_id = 0;
                  }
                } else {
                  item.super_admin_id = 0;
                }
                await Promise.all(
                  roles.map(async (item1) => {
                    if (item1.facilityID == "0") {
                      item.role = item1.Name;
                    } else {
                      item.role = roles[0]?.Name;
                    }
                  })
                );

                item.tenantID = item.Id;
              })
            );

            return res.json({
              success: true,
              message: "login Successfully!",
              userinfo: data1,
              status: 200,
            });
          } else {
            return res.json({
              success: false,
              message: "Invalid password.",
              status: 400,
            });
          }
        } else {
          return res.json({
            message: "Account not found. Please check your details",
            status: 400,
            success: false,
          });
        }
      } else {
        return res.json({
          success: false,
          message: "Account not found. Please check your details.",
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

exports.packageById = async (req, res) => {
  try {
    const { tenant_id } = req.body;

    const schema = Joi.alternatives(
      Joi.object({
        tenant_id: [Joi.string().empty().required()],
      })
    );
    const result = schema.validate(req.body);

    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      let where = `  where  A.Id ='` + tenant_id + `'`;
      const data = await getSelectedColumn("`dbo.tenants` A ", where, "A.*");

      if (data.length !== 0) {
        console.log(">>>>>>>>>", data[0].Email);

        let data1 = await fetchUserByEmail(data[0].Email);
        await Promise.all(
          data1.map(async (item) => {
            let where =
              ` LEFT JOIN  \`dbo\.\aspnetroles\` B ON B.Id = A.roleId where  A.tenant_id ='` +
              data[0].Id +
              `'`;
            const roles = await getSelectedColumn(
              "`dbo.aspnetuserroles` A ",
              where,
              "A.facilityID,A.roleId,A.userId,B.Name"
            );

            let where1 =
              `  LEFT JOIN  packages B ON B.id = A.package_id  where  A.tenantID ='` +
              item.tenantID +
              `'`;
            const packagesusers = await getSelectedColumn(
              "packages_users A ",
              where1,
              "B.*,B.package_name,B.id as package_id,A.facility_id,A.expired_at,A.created_at "
            );
            item.tenantID = item.Id;
            item.package_id = packagesusers[0]?.package_id;
            item.package_name = packagesusers[0]?.package_name;
            item.package_info = packagesusers[0];
            await Promise.all(
              roles.map(async (item1) => {
                if (item1.facilityID == "0") {
                  item.role = item1.Name;
                } else {
                  item.role = roles[0]?.Name;
                }
              })
            );
          })
        );

        return res.json({
          success: true,
          message: "package Detail Fetch Successfully!",
          userinfo: data1,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Account not found. Please check your details.",
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

exports.GetFacilityGroups = async (req, res) => {
  try {
    const { tenantID } = req.params;
    const schema = Joi.alternatives(
      Joi.object({
        tenantID: [Joi.string().empty().required()],
      })
    );
    const result = schema.validate(req.params);

    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      let facilities = "";
      //
      let where = "where tenant_id =  '" + tenantID + "'  GROUP BY facilityID,group_id";

      facilities = await getSelectedColumn("`dbo.aspnetuserroles`", where, "facilityID,group_id");

      //facilities =  await fetchfacilitiesBytenants(tenantID);

      // if (facilities[0].facilityID == 0) {
      //   let where = "  where  F.TenantID = '" + tenantID + "'";
      //   facilities = await getSelectedColumn("`dbo.facilities` F ", where, "F.sub_group_id,F.ID as facilityID ,F.AssestName as name");
      // }
      if (facilities.length == 0) {
        let where = "  where  F.TenantID = '" + tenantID + "'";
        facilities = await getSelectedColumn(
          "`dbo.facilities` F ",
          where,
          "F.sub_group_id,F.ID as facilityID ,F.AssestName as name,F.CountryId as country_code"
        );
      } else if (facilities[0].facilityID == 0) {
        let where = "  where  F.TenantID = '" + tenantID + "'";
        facilities = await getSelectedColumn(
          "`dbo.facilities` F ",
          where,
          "F.sub_group_id,F.ID as facilityID ,F.AssestName as name,F.CountryId as country_code"
        );
      }

      let array = [];
      await Promise.all(
        facilities.map(async (item) => {
          let facilities1 = "";
          let where1 = "";

          if (item?.group_id != 0 && item?.group_id != undefined) {
            let where2 = ` where  G.id  = '${item?.group_id}'`;
            const groupmap = await getSelectedColumn("`dbo.group` G", where2, " G.groupname as AssestName,G.tenantID,G.id,G.is_subgroup");
            if (groupmap?.length > 0) {
              if (groupmap[0]?.is_subgroup == 0) {
                where1 =
                  " JOIN  `dbo.facilities` F ON G.facilityId = F.ID where G.groupId = '" + item.group_id + "'";
                facilities1 = await getSelectedColumn("`dbo.groupmapping` G", where1, "G.facilityId,F.ID as id ,F.AssestName as AssestType,F.AssestType as name,F.CountryId as country_code");
              } else {
                let where = "  where  F.sub_group_id = '" + item.group_id + "'";
                facilities1 = await getSelectedColumn(
                  "`dbo.facilities` F ",
                  where,
                  "F.ID as id ,F.AssestName as AssestType,F.AssestType as name,F.CountryId as country_code"
                );
              }
            }
          } else {
            let where = `  where F.ID IN(${item.facilityID})`;
            facilities1 = await getSelectedColumn(
              "`dbo.facilities` F ",
              where,
              "F.ID as id ,F.AssestName as AssestType,F.AssestType as name,F.CountryId as country_code"
            );
          }

          await Promise.all(
            facilities1.map(async (item1) => {
              array.push(item1);
            })
          );
        })
      );

      if (array.length > 0) {
        for (const item of array) {
          if (item.country_code) {
            const country = await findCountryNamebyCode(item.country_code);
            item.country_name = country[0]?.Name || "";
          } else {
            item.country_name = "Unknown Country";
          }
        }

        return res.json(array);
      } else {
        return res.json({
          success: false,
          message: "Some problem occurred while selecting facilities",
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

exports.GetpendingDataEnteries = async (req, res) => {
  try {
    const { year, facilities, categoryID } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        year: [Joi.number().empty().required()],
        facilities: [Joi.string().empty().required()],
        categoryID: [Joi.string().empty().required()],
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
      })
    } else {
      let array = [];

      let categorydata;
      let categorydata2;

      if (categoryID == "1") {
        categorydata = await getCombustionEmission(facilities, year);
        array = [...categorydata];
      }

      if (categoryID == "2") {
        categorydata = await Allrefrigerants(facilities, year);
        array = [...categorydata];
      }

      if (categoryID == "3") {
        categorydata = await Allfireextinguisher(facilities, year);
        array = [...categorydata];
      }

      if (categoryID == "5") {
        categorydata = await getAllelectricity(facilities, year);
        console.log(categorydata);
        array = [...categorydata];
      }

      if (categoryID == "6") {
        categorydata = await getAllcompanyownedvehicles(facilities, year);
        array = [...categorydata];
      }

      if (categoryID == "7") {
        categorydata2 = await getAllheatandsteam(facilities, year);
        array = [...categorydata2];
      }

      if (categoryID == "8") {
        categorydata2 = await purchaseGoodsDetails(facilities, year);
        array = [...categorydata2];
      }

      if (categoryID == "13") {
        categorydata2 = await flight_travelDetails(facilities, year);
        /* if(categorydata2.length > 0)
         {
           for(element of categorydata2)
           {
            let emissionFactor  = await getflightEF(year)
            if(emissionFactor.length > 0)
            {
             element.emissionFactorUsed = emissionFactor[0]?.ef; 
            }
           }
         }*/
        let hotelstayDetails = await hotel_stayDetails(facilities, year);
        let othermodes_of_transportDetails = await other_modes_of_transportDetails(facilities, year);
        array = [
          ...categorydata2,
          ...hotelstayDetails,
          ...othermodes_of_transportDetails,
        ];
      }

      if (categoryID == "18") {
        categorydata = await processing_of_sold_products_categoryDetails(
          facilities,
          year
        );
        array = [...categorydata];
      }

      if (categoryID == "19") {
        categorydata = await sold_product_categoryDetails(facilities, year);
        array = [...categorydata];
      }

      if (categoryID == "20") {
        categorydata = await endoflife_waste_typeDetails(facilities, year);
        array = [...categorydata];
      }

      if (categoryID == "11") {
        categorydata = await water_supply_treatment_categoryDetails(
          facilities,
          year
        );
        array = [...categorydata];
      }

      if (categoryID == "14") {
        categorydata = await employee_commuting_categoryDetails(
          facilities,
          year
        );
        array = [...categorydata];
      }

      if (categoryID == "15") {
        categorydata = await homeoffice_categoryDetails(facilities, year);
        array = [...categorydata];
      }

      if (categoryID == "12") {
        categorydata = await waste_generated_emissionsDetails(facilities, year);
        array = [...categorydata];
      }

      if (categoryID == "16") {
        categorydata = await upstreamLease_emissionDetails(facilities, year);
        array = [...categorydata];
      }

      if (categoryID == "21") {
        categorydata = await downstreamLease_emissionDetails(facilities, year);
        array = [...categorydata];
      }

      if (categoryID == "22") {
        categorydata = await franchise_categories_emissionDetails(
          facilities,
          year
        );
        array = [...categorydata];
      }

      if (categoryID == "23") {
        categorydata = await investment_emissionsDetails(facilities, "");
        array = [...categorydata];
      }

      if (categoryID == "10") {
        categorydata = await upstream_vehicle_storage_emissions(
          facilities,
          year
        );
        console.log("categorydata =>", categorydata);

        array = [...categorydata];
      }

      if (categoryID == "17") {
        categorydata = await downstream_vehicle_storage_emissions(
          facilities,
          year
        );
        array = [...categorydata];
      }

      await Promise.all(
        array.map(async (item) => {
          const category = await getSelectedColumn(
            "`dbo.categoryseeddata`",
            ` where Id  = '${categoryID}'`,
            "Id as categoryID,CatName as catName"
          );
          item.catName = category[0]?.catName;
          item.categoryID = category[0]?.categoryID;

          let unit = item.unit;
          let emissionFactor = 0.0;
          let finalproductEF = "";
          if (item.status == "S") {
            item.status = "Approved";
          }
          if (item.status == "R") {
            item.status = "Rejected";
          }
          if (item.status == "P") {
            item.status = "Pending";
          }
          let userid = "";
          if (item.user_id == "uuidd12432") {
            userid = 4;
          } else {
            userid = item.user_id;
          }
          const tenants = await getSelectedColumn(
            "`dbo.tenants`",
            ` where Id  = '${userid}'`,
            "*"
          );
          if (tenants.length > 0) {
            item.user_name = tenants[0].userName;
          } else {
            item.user_name = "";
          }

          if (categoryID == "1") {
            // if (item.CalorificValue) {
            //   emissionFactor = parseFloat(item.calorificValue);
            //   if (unit.toLowerCase() === "liters") {
            //   } else if (unit.toLowerCase() === "kg") {
            //     emissionFactor = parseFloat(item.calorificValue);
            //   }
            // } else if (unit.toLowerCase() === "kg") {
            //   emissionFactor = item.kgCO2e_kg;
            // } else if (unit.toLowerCase() === "litres") {
            //   emissionFactor = item.kgCO2e_litre;
            // } else if (unit.toLowerCase() === "kwh") {
            //   emissionFactor = item.kgCO2e_litre;
            // } else if (unit.toLowerCase() === "tonnes") {
            //   emissionFactor = item.kgCO2e_tonnes;
            // }
            emissionFactor = parseFloat(item.GHGEmissionFactor);
          }

          if (categoryID == "2" || categoryID == "3") {
            if (unit.toLowerCase() === "kg") {
              emissionFactor = item.kgCO2e_kg;
            }
          }

          if (categoryID == "5") {
            if (item.SubCategorySeedID == "1002") {
              let where = ` where SubCategorySeedID ='${item.SubCategorySeedID}'`;
              const Renewable = await getSelectedColumn(
                "`dbo.electricity`",
                where,
                "*"
              );

              if (item.typeID == "1") {
                item.TypeName = "Renewable Energy Cert (REC)";
              } else if (item.typeID == "2") {
                item.TypeName = "Supplier Specific";
              } else {
                item.TypeName = "";
              }

              if (((unit.toLowerCase() === "kwh") != item.typeID) == "2") {
                emissionFactor = Renewable[0]["kgCO2e_kwh"]
                  ? Renewable[0]["kgCO2e_kwh"]
                  : "0.000";
              } else {
                emissionFactor = item.emission_factor;
              }
            } else {
              //B.kgCO2e_kwh
              if (unit.toLowerCase() === "kwh") {
                emissionFactor = item.kgCO2e_kwh;
              }
            }
          }

          if (categoryID == "11") {
            let water_supply_ef = "";
            let water_treatment_ef = "";
            let where = ` where user_id ='${item.user_id}' and  water_supply_treatment_id ='${item.id}' `;
            const water_withdrawl = await getSelectedColumn(
              "water_withdrawl_by_source",
              where,
              "*"
            );
            item.water_withdrawl_by_source = water_withdrawl
              ? water_withdrawl.map((result) => ({
                ...result,
                totalwaterwithdrawl: parseFloat(result.totalwaterwithdrawl),
              }))
              : [];

            const water_treatment = await getSelectedColumn(
              "water_discharge_by_destination",
              where,
              "*"
            );
            item.water_treatment = water_treatment
              ? water_treatment.map((result) => ({
                ...result,
                totalwaterdischarge: parseFloat(result.totalwaterdischarge),
              }))
              : [];
            const water_discharge = await getSelectedColumn(
              "water_discharge_by_destination_only",
              where,
              "*"
            );
            item.water_discharge = water_discharge
              ? water_discharge.map((result) => ({
                ...result,
                totaldischarge: parseFloat(result.totaldischarge),
              }))
              : [];

            const watersupply = await water_supply_treatment_type(
              1,
              item.country_id
            );

            const watertreatment = await water_supply_treatment_type(
              2,
              item.country_id
            );

            if (item.water_supply_unit == "1") {
              water_supply_ef = parseFloat(watersupply[0]?.kgCO2e_cubic_metres);
            } else if (item.water_supply_unit == "2") {
              water_supply_ef = parseFloat(
                watersupply[0]?.kgCO2e_million_litres
              );
            }

            if (item.water_supply_unit == "1") {
              water_treatment_ef = parseFloat(
                watertreatment[0]?.kgCO2e_cubic_metres
              );
            } else if (item.water_supply_unit == "2") {
              water_treatment_ef = parseFloat(
                watertreatment[0]?.kgCO2e_million_litres
              );
            }
            item.water_withdrawn_emission = water_supply_ef
              ? water_supply_ef
              : 0.0;
            item.water_treatment_emission = water_treatment_ef
              ? water_treatment_ef
              : 0.0;

            item.water_withdrawn_value = item.water_supply
              ? item.water_supply
              : 0.0;

            item.water_withdrawn_unit_value = "kg CO2e";
            item.water_discharged_unit_value = "kg CO2e";

            emissionFactor = parseFloat(water_treatment_ef + water_supply_ef);
          }

          if (categoryID == "18") {
            let getSoldproduct = "";
            let unitef = "";
            if (item.processing_acitivity && item.intermediate_category) {
              where = ` where sector = '${item.processing_acitivity}'`;
              getSoldproduct = await getSelectedColumn(
                "processing_of_sold_products_ef",
                where,
                "*"
              );
            } else if (
              item.processing_acitivity &&
              item.intermediate_category &&
              item.sub_activity
            ) {
              where = ` where sub_sector = '${sub_activity}' `;
              getSoldproduct = await getSelectedColumn(
                "processing_of_sold_products_ef",
                where,
                "*"
              );
            }

            if (item.calculation_method == "Site Specific method") {
              unitef =
                parseFloat(item.scope1emissions) +
                parseFloat(item.scope2emissions);

              emissionFactor = unitef ? unitef : "0.000";
            } else {
              if (getSoldproduct.length > 0) {
                if (unit == "INR") {
                  unitef = getSoldproduct[0]["efkgco2_inr"];
                } else if (unit == "kg") {
                  unitef = getSoldproduct[0]["efkgco2_kg"];
                } else if (unit == "lites") {
                  unitef = getSoldproduct[0]["efkgco2_litres"];
                } else {
                  unitef = getSoldproduct[0]["efkgco2_tonnes"];
                }
                emissionFactor = unitef ? unitef : "0.000";
              }
            }
          }

          if (categoryID == "19") {
            let noofunit = "";
            let prductef = "";
            //const chekefproduct = await soldproductsemission_factors(item.productcategory);

            let where1 = ` where item ='${item.productcategory}'`;
            const chekefproduct = await getSelectedColumn(
              "sold_product_category_ef",
              where1,
              "*"
            );

            let finalproductEF = "";
            let fuelconsumedEF = "";
            let finalfrigentsEF = "";

            if (item.type == "1") {
              item.type_name = "Direct use-phase emissions";
            }

            if (item.type == "2") {
              item.type_name = "Indirect use-phase emissions";
            }

            let where = ` where type ='${item.type}'`;
            const getSoldproduct = await getSelectedColumn(
              "sold_product_category_ef",
              where,
              "*"
            );

            if (getSoldproduct.length > 0) {
              item.productcategory_name = getSoldproduct[0]?.item
                ? getSoldproduct[0]?.item
                : "";
            } else {
              item.productcategory_name = "";
            }

            if (item.no_of_Items_unit == "2") {
              noofunit = "Tonnes";
            }
            if (item.no_of_Items_unit == "3") {
              noofunit = "kg";
            }
            if (item.no_of_Items_unit == "4") {
              noofunit = "litres";
            }

            if (item.no_of_Items_unit == "1") {
              noofunit = "No. of Item";
            }

            if (chekefproduct.length > 0) {
              if (item.no_of_Items_unit == "2") {
                prductef = chekefproduct[0]["tonnes"];
              }
              if (item.no_of_Items_unit == "3") {
                prductef = chekefproduct[0]["kg"];
              }
              if (item.no_of_Items_unit == "4") {
                prductef = chekefproduct[0]["litres"];
              }

              if (item.no_of_Items_unit == "1") {
                prductef = 1;
              }
              // item.no_of_Items_unit = noofunit;
              finalproductEF = parseFloat(prductef * item.no_of_Items);
            } else {
              // item.no_of_Items_unit = noofunit;
              finalproductEF = parseFloat(item.no_of_Items);
            }

            item.no_of_Items_unit = noofunit;
            emissionFactor = finalproductEF ? finalproductEF : "0.000";

            if (item.fuel_consumed_usage) {
              let where = ` where SubCategorySeedID = 1 and Item = '${item.fuel_type}'`;
              const fuelconsumed = await getSelectedColumn(
                "stationarycombustion",
                where,
                "*"
              );

              if (fuelconsumed.length > 0) {
                fuelconsumedEF = parseFloat(fuelconsumed[0]["kgCO2e_kg"]);
              }
              item.fuel_consumed_emission = fuelconsumedEF
                ? fuelconsumedEF
                : "0.000";
            }

            if (item.referigerant_usage) {
              let where = ` where Item = '${item.referigentused}'`;
              const refrigents = await getSelectedColumn(
                "`dbo.refrigents`",
                where,
                "*"
              );

              if (refrigents.length > 0) {
                finalfrigentsEF = parseFloat(refrigents[0]["kgCO2e_kg"]);
              }
              item.referigent_emission = finalfrigentsEF
                ? finalfrigentsEF
                : "0.000";
            }
          }

          if (categoryID == "13") {
            item.distance = '';
            item.avg_distance = Number(parseFloat(item.avg_distance).toFixed(4));
            if (item.type_of_hotel) {
              let where1 = ` where  country ='${item.country_of_stay}' `;
              const hotelstay = await getSelectedColumn(
                "hotel_booking",
                where1,
                `${item.type_of_hotel}`
              );
              emissionFactor = hotelstay[0][item.type_of_hotel]
                ? hotelstay[0][item.type_of_hotel]
                : "0.000";
            }

            if (item.tablename == "flight_travel") {
              item.unit = "km";
              emissionFactor = item.emission_factor;
            }
            if (item.tablename == "other_modes_of_transport") {
              // if(item.mode_of_trasport == 'Car' || item.mode_of_trasport == 'Ferry' ){
              //   mode= "Car"
              // }

              // if(item.mode_of_trasport == 'Auto'){
              //   mode= "Auto"
              // }
              // if(item.mode_of_trasport == 'Rail'){
              //   mode= "Rail"
              // }

              // if(item.mode_of_trasport == 'Bus'){
              //   mode= "Bus"
              // }
              let where = ``;

              where += ` where mode_type = '${item.type}' and type_name = '${item.mode_of_trasport}' `;
              const efs = await getSelectedColumn(
                "other_modes_of_transport_ef",
                where,
                "*"
              );
              // let where1 = ` where  sub_category ='${mode}' `;
              // const efs = await getSelectedColumn("emission_factors",where1,'*' );
              emissionFactor = efs[0]?.ef ? efs[0].ef : "0.000";
            }
          }

          if (categoryID == "7") {
            console.log(item);

            let where = ` where ID = '${item.typeID}'  `;
            const heatandsteam = await getSelectedColumn(
              "`dbo.heatandsteam`",
              where,
              "*"
            );
            if (heatandsteam.length > 0) {
              item.TypeName = heatandsteam[0]["Item"]
                ? heatandsteam[0]["Item"]
                : "";

              if (unit.toLowerCase() === "kwh") {
                emissionFactor = heatandsteam[0]["kgCO2e_kwh"];
              }
            }

          }

          if (categoryID == "8") {
            if (item.typeofpurchase) {
              let where = ` where  	id = '${item.typeofpurchase}'  `;
              const typename = await getSelectedColumn(
                "`dbo.typesofpurchase`",
                where,
                "*"
              );
              item.typeofpurchase = typename[0]?.typesofpurchasename;
            }

            if (item.product_category) {
              let where = ` LEFT JOIN  purchase_goods_product_code B  ON B.id  = A.product_code_id where  	A.id = '${item.product_category}'  `;
              const typename = await getSelectedColumn(
                "purchase_goods_categories_ef A",
                where,
                "A.*,B.code"
              );
              item.product_category_name = typename[0]?.product;
              item.code_name = typename[0]?.code;
            }

            emissionFactor = item.emission_factor_used;
          }

          if (categoryID == "6") {
            if (item.SubCategorySeedID == "10") {
              let where = `where ID = '${item.vehicleTypeID}' `;
              const passengervehicletypes = await getSelectedColumn(
                "companyownedvehicles",
                where,
                "*"
              );

              item.TypeName = passengervehicletypes[0]["ItemType"]
                ? passengervehicletypes[0]["ItemType"]
                : "";
            }

            if (item.SubCategorySeedID == "11") {
              let where = ` where ID = '${item.vehicleTypeID}' `;
              const deliveryvehicletypes = await getSelectedColumn(
                "companyownedvehicles",
                where,
                "*"
              );
              item.TypeName = deliveryvehicletypes[0]["ItemType"]
                ? deliveryvehicletypes[0]["ItemType"]
                : "";
            }

            if (unit.toLowerCase() === "km") {
              emissionFactor = item.kgCO2e_km;
            } else if (unit.toLowerCase() === "litre") {
              emissionFactor = item.kgCO2e_litre;
            } else if (unit.toLowerCase() !== "km" && unit.toLowerCase() !== "litre") {
              emissionFactor = item.kgCO2e_ccy;
            }
          }

          if (categoryID == "20") {
            if (item.waste_type) {
              const wastedata = await endoflife_waste_type(item.waste_type);
              if (wastedata.length > 0) {
                item.waste_type_name = wastedata[0].type
                  ? wastedata[0].type
                  : "";
              } else {
                item.waste_type_name = "";
              }
            }
            if (item.subcategory) {
              const subCategory = await endof_lifeSubCatmission_factors(
                item.subcategory
              );
              if (subCategory.length > 0) {
                if (item.waste_unit == "tonnes") {
                  prductef = subCategory[0]["tonnes"];
                }
                if (item.waste_unit == "kg") {
                  prductef = subCategory[0]["kg"];
                }
                if (item.waste_unit == "litres") {
                  prductef = subCategory[0]["litres"];
                }
                finalproductEF = parseFloat(prductef);
              }
            } else {
              const subCategory = await endoflife_waste_type(item.waste_type);
              if (subCategory.length > 0) {
                if (item.waste_unit == "tonnes") {
                  prductef = subCategory[0]["tonnes"];
                }
                if (item.waste_unit == "kg") {
                  prductef = subCategory[0]["kg"];
                }
                if (item.waste_unit == "litres") {
                  prductef = subCategory[0]["litres"];
                }
                finalproductEF = parseFloat(prductef);
              }
            }
            emissionFactor = finalproductEF ? finalproductEF : "0.000";
          }

          if (categoryID == "14") {
            let where = ``;
            const employee_community = await getSelectedColumn(
              "employee_community_typeoftransport",
              where,
              "*"
            );
            emissionFactor = employee_community[0]["efskgCO2e"]
              ? employee_community[0]["efskgCO2e"]
              : "0.000";
          }

          if (categoryID == "15") {
            const assumptions = await homeoffice_emission_factors(
              item.typeofhomeoffice
            );
            let emission_kg = "";
            if (item.noofemployees && item.noofdays && item.noofmonths) {
              emission_kg = assumptions[0]?.finalEFkgco2;
            } else {
              emission_kg = 0.0;
            }
            emissionFactor = parseFloat(emission_kg);
            item.unit = "kgco2";
            console.log(assumptions[0]);
          }
          if (categoryID == "12") {
            let where = ` where  type = '${item.waste_type}' `;
            const emissionDetails = await getSelectedColumn(
              "endoflife_waste_type_subcategory",
              where,
              item.method + " as ef"
            );
            console.log("emissionDetails =>", emissionDetails);

            //select ${column} as ef from endoflife_waste_type_subcategory where  waste_type= ? and type= ?`,[id,waste_type]
            if (emissionDetails.length > 0) {
              emissionFactor = emissionDetails[0].ef
                ? emissionDetails[0].ef
                : "0.000";
            }
          }

          if (categoryID == "16") {
            if (item.calculation_method === "Average data method") {
              let where = `where categories = '${item.category}' and sub_categories = '${item.sub_category}';`;
              const emissionDetails = await getSelectedData(
                "franchise_categories_subcategories",
                where,
                "ef"
              );
              if (emissionDetails.length > 0) {
                const ef = emissionDetails[0].ef;
                emissionFactor = ef ? ef : "0.000";
              }
            } else if (item.calculation_method === "Facility Specific method") {
              emissionFactor =
                Number(item.scope1_emission) + Number(item.scope2_emission);
            }
          }
          if (categoryID == "21") {
            if (item.calculation_method === "Average data method") {
              let where = `where categories = '${item.category}' and sub_categories = '${item.sub_category}';`;
              const emissionDetails = await getSelectedData(
                "franchise_categories_subcategories",
                where,
                "ef"
              );
              if (emissionDetails.length > 0) {
                emissionFactor = emissionDetails[0].ef
                  ? emissionDetails[0].ef
                  : "0.000";
              }
            } else if (item.calculation_method === "Facility Specific method") {
              emissionFactor =
                Number(item.scope1_emission) + Number(item.scope2_emission);
            }
          }
          if (categoryID == "10") {
            if (item.vehicle_type) {
              const vehicleIdRes = await fetchVehicleByVehicleTypeId(item.vehicle_type);

              let vehicleId = vehicleIdRes[0]?.id;
              if (vehicleId) {
                const EFVRes = await fetchVehicleEmission(
                  vehicleId,
                  item.sub_category
                );
                console.log("EFVRes =>", EFVRes);
                emissionFactor = EFVRes[0]?.emission_factor
                  ? EFVRes[0]?.emission_factor
                  : "0.000";
              }
            }

            if (item.storage_facility_type) {
              const vehicleIdRes = await fetchVehicleId(
                item.storage_facility_type
              );
              const vehicleId = vehicleIdRes[0]?.id;
              if (vehicleId) {
                const EFSRes = await fetchVehicleEmission(
                  vehicleId,
                  item.storage_facility_type
                );
                emissionFactor = EFSRes[0]?.emission_factor
                  ? EFSRes[0]?.emission_factor
                  : "0.000";
              }
            }
          }

          if (categoryID == "17") {
            if (item.vehicle_type) {
              const vehicleIdRes = await fetchVehicleByVehicleTypeId(item.vehicle_type);
              let vehicleId = vehicleIdRes[0]?.id;
              const EFVRes = await fetchVehicleEmission(
                vehicleId,
                item.sub_category
              );
              emissionFactor = EFVRes[0]?.emission_factor
                ? EFVRes[0]?.emission_factor
                : "0.000";
            }

            if (item.storage_facility_type) {
              const vehicleIdRes = await fetchVehicleId(
                item.storage_facility_type
              );
              const vehicleId = vehicleIdRes[0]?.id;
              const EFSRes = await fetchVehicleEmission(
                vehicleId,
                item.storage_facility_type
              );
              emissionFactor = EFSRes[0]?.emission_factor
                ? EFSRes[0]?.emission_factor
                : "0.000";
            }
          }
          if (categoryID == "22") {
            if (
              item.calculation_method === "Average data method" ||
              item.calculation_method === "Franchise Specific method"
            ) {
              let where = `where categories = '${item.franchise_type}' and sub_categories = '${item.sub_category}'`;
              const franchiseDetails = await getSelectedData(
                "franchise_categories_subcategories",
                where,
                "ef"
              );
              if (franchiseDetails.length > 0) {
                emissionFactor = franchiseDetails[0].ef
                  ? franchiseDetails[0].ef
                  : "0.000";
              }
            } else if (
              item.calculation_method === "Investment Specific method"
            ) {
              emissionFactor =
                Number(item.scope1_emission) + Number(item.scope2_emission);
            }
          }

          if (categoryID == "23") {
            emissionFactor = item.emission_factor_used;
          }

          item.emissionFactorUsed = emissionFactor ? parseFloat(emissionFactor).toFixed(4) : "";
          let mainEmission = item.emission / 1000;
          item.emission = parseFloat(mainEmission).toFixed(4);
        })
      );

      if (array.length > 0) {
        return res.json({
          success: true,
          message: "Succesfully fetched category",
          categories: array,
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

exports.GetpendingDataEnteriesFuelType = async (req, res) => {
  try {
    const { year, facilities, categoryID } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        year: [Joi.number().empty().required()],
        facilities: [Joi.string().empty().required()],
        categoryID: [Joi.string().empty().required()],
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
      })
    } else {
      let array = [];

      if (categoryID == "9") {
        let categorydata = await getCombustionEmissionFuel(facilities, year);
        let categorydata1 = await getAllelectricity(facilities, year);
        let categorydata2 = await getAllheatandsteam(facilities, year);

        array = [...categorydata, ...categorydata1, ...categorydata2];
      }

      await Promise.all(
        array.map(async (item) => {
          const category = await getSelectedColumn(
            "`dbo.categoryseeddata`",
            ` where Id  = '${categoryID}'`,
            "Id as categoryID,CatName as catName"
          );
          item.catName = category[0]?.catName;
          item.categoryID = category[0]?.categoryID;

          let unit = item.unit;
          let emissionFactor = 0.0;
          let finalproductEF = "";
          if (item.status == "S") {
            item.status = "Approved";
          }
          if (item.status == "R") {
            item.status = "Rejected";
          }
          if (item.status == "P") {
            item.status = "Pending";
          }
          let userid = "";
          if (item.user_id == "uuidd12432") {
            userid = 4;
          } else {
            userid = item.user_id;
          }
          const tenants = await getSelectedColumn(
            "`dbo.tenants`",
            ` where Id  = '${userid}'`,
            "*"
          );
          if (tenants.length > 0) {
            item.user_name = tenants[0].tenantName;
          } else {
            item.user_name = "";
          }

          if (item.tablename == "stationarycombustionde") {
            // item.emission = item.Scope3GHGEmission
            // /
            // if(item.CalorificValue)
            // {

            //     if(unit.toLowerCase() === "litres")
            //     {

            //       emissionFactor =  Number(item.CalorificValue)
            //     }
            //     else if(unit.toLowerCase()==="kg")
            //     {
            //       emissionFactor =  Number(item.CalorificValue)
            //     }

            // }
            if (unit.toLowerCase() === "kg") {
              emissionFactor = item.scope3_kgCO2e_kg;
            } else if (unit.toLowerCase() === "litres") {
              emissionFactor = item.scope3_kg_CO2e_litres;
            } else if (unit.toLowerCase() === "kwh") {
              emissionFactor = item.scope3_kgCO2e_kwh;
            } else if (unit.toLowerCase() === "tonnes") {
              emissionFactor = item.scope3_kgCO2e_tonnes;
            }
          }

          if (item.tablename == "dbo.renewableelectricityde") {
            //   item.emission = item.scop3_GHGEmission
            if (item.SubCategorySeedID == "1002") {
              let where = ` where SubCategorySeedID ='${item.SubCategorySeedID}'`;
              const Renewable = await getSelectedColumn(
                "`dbo.electricity`",
                where,
                "*"
              );

              if (item.typeID == "1") {
                item.TypeName = "Renewable Energy Cert (REC)";
              } else if (item.typeID == "2") {
                item.TypeName = "Supplier Specific";
              } else {
                item.TypeName = "";
              }

              if (((unit.toLowerCase() === "kwh") != item.typeID) == "2") {
                emissionFactor = Renewable[0]["kgCO2e_kwh"]
                  ? Renewable[0]["kgCO2e_kwh"]
                  : "0.000";
              } else {
                emissionFactor = item.emission_factor;
              }
            } else {
              let where = ` where is_scope3 ='1'`;
              const Renewable = await getSelectedColumn(
                "`dbo.electricity`",
                where,
                "*"
              );

              // /T&D - Electricity
              //B.kgCO2e_kwh
              if (item.unit.toLowerCase() === "kwh") {
                emissionFactor = Renewable[0]["kgCO2e_kwh"]
                  ? Renewable[0]["kgCO2e_kwh"]
                  : "0.000";
              }
            }
          }

          if (item.tablename == "dbo.heatandsteamde") {
            // item.emission = item.scop3GHGEmission
            let where = ` where  	subCatTypeID = '${item.typeID}'  `;
            const heatandsteam = await getSelectedColumn(
              "`dbo.heatandsteam`",
              where,
              "*"
            );
            item.TypeName = heatandsteam[0]["Item"]
              ? heatandsteam[0]["Item"]
              : "";

            if (item.unit.toLowerCase() === "kwh") {
              emissionFactor = heatandsteam[0]["scop3_kgCO2e_kwh"];
            }
          }
          item.emission = parseFloat(item.emission / 1000).toFixed(3);
          item.emissionFactorUsed = parseFloat(emissionFactor).toFixed(3);
        })
      );

      if (array.length > 0) {
        return res.json({
          success: true,
          message: "Succesfully fetched category",
          categories: array,
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

exports.UpdateelecEntry = async (req, res) => {
  try {
    const { updateJson, categoryID } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        categoryID: [Joi.string().empty().required()],
        updateJson: [Joi.optional().allow("")],
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
      })
    } else {
      let array = [];

      let updatedata;
      array = JSON.parse(updateJson);
      await Promise.all(
        array.map(async (item) => {
          let id = item.id ? item.id : item.ID ? item.ID : "";
          if (item.id && item.tablename) {
            let id = ` id ='${item.id}' `;
            let status = ` status ='S' `;
            updatedata = await updateAllData(item.tablename, id, status);
          }

          if (item.ID && item.tablename) {
            let id = ` id ='${item.id}' `;
            let status = ` Status ='S' `;
            updatedata = await updateAllData(item.tablename, id, status);
          }

          // if(item.Id && item.tablename){
          //   let id  = ` Id ='${item.Id }' `;
          //   let status  = ` Status ='S' `;
          //     updatedata = await updateAllData(item.tablename,id,status)
          // }
          if (updatedata) {
            console.log("test to update");
          } else {
            console.log("fail to update");
          }
        })
      );

      if (array.length > 0) {
        return res.json({
          success: true,
          message: "Approved Successfully!",
          categories: array,
          status: 200,
        });
      } else {
        return res.json({
          success: true,
          message: "Approved Successfully!",
          categories: array,
          status: 200,
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
exports.rejectAllEntry = async (req, res) => {
  try {
    const { updateJson, categoryID } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        categoryID: [Joi.string().empty().required()],
        updateJson: [Joi.optional().allow("")],
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
      })
    } else {
      let array = [];
       array = JSON.parse(updateJson);
      let results = [];
      
      if (!Array.isArray(array) || array.length === 0) {
        return res.json({
          success: false,
          message: "Invalid or empty input array",
          status: 400,
        });
      }
      
      for (const item of array) {
        if (!item.tablename || !item.id) {
          results.push({ ...item, updateStatus: 'failed', reason: 'Missing tablename or id' });
          continue;
        }
      
        const whereClause = `id = '${item.id}'`;
        const statusClause = `Status = 'R'`;
      
        try {
          const updated = await updateAllData(item.tablename, whereClause, statusClause);
          if (updated) {
            results.push({ ...item, updateStatus: 'success' });
          } else {
            results.push({ ...item, updateStatus: 'failed', reason: 'Update returned false' });
          }
        } catch (error) {
          results.push({ ...item, updateStatus: 'failed', reason: error.message });
        }
      }
      
      const successCount = results.filter(r => r.updateStatus === 'success').length;
      
      return res.json({
        success: successCount > 0,
        message: successCount > 0 ? "Rejected Successfully!" : "No updates were successful.",
        categories: results,
        status: successCount > 0 ? 200 : 400,
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

exports.deleteAllEntry = async (req, res) => {
  try {
    const { updateJson, categoryID } = req.body;

    const schema = Joi.alternatives(
      Joi.object({
        categoryID: [Joi.string().empty().required()],
        updateJson: [Joi.optional().allow("")],
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
      const array = JSON.parse(updateJson);
      const successDeletes = [];
      const failedDeletes = [];

      for (const item of array) {
        const idValue = item.id || item.ID;
        const tableName = item.tablename;

        if (!idValue || !tableName) {
          console.log("Missing id or tablename for item:", item);
          failedDeletes.push(item);
          continue;
        }

        try {
          const deletionResult = await deleteEntries(tableName, idValue);
          if (deletionResult) {
            successDeletes.push({ tableName, idValue });
          } else {
            failedDeletes.push({ tableName, idValue });
          }
        } catch (err) {
          console.log(`Error deleting from ${tableName}`, err);
          failedDeletes.push({ tableName, idValue });
        }
      }

      return res.json({
        success: failedDeletes.length === 0,
        message:
          failedDeletes.length === 0
            ? "All entries deleted successfully!"
            : "Some entries could not be deleted.",
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



exports.UpdateelecEntryReject = async (req, res) => {
  try {
    const { updateJson, categoryID } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        categoryID: [Joi.number().empty().required()],
        updateJson: [Joi.optional().allow("")],
        //      reason:[Joi.string().empty().required()],
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
      })
    } else {
      let array = [];

      let updatedata;
      array = JSON.parse(updateJson);
      await Promise.all(
        array.map(async (item) => {
          if (item.id && item.tablename) {
            let id = ` id ='${item.id}' `;
            let status = ` status ='R' `;
            let reason = ` ,Reason='${item.Reason}' `;
            updatedata = await updateAllDataeject(
              item.tablename,
              id,
              status,
              reason
            );
          }

          // if(item.Id && item.tablename){
          //   let id  = ` Id ='${item.Id }' `;
          //   let status  = ` Status ='R' `;
          //   let reason  = ` ,Reason='${item.Reason }' `;
          //     updatedata = await updateAllDataeject(item.tablename,id,status,reason)
          // }

          if (item.id && item.tablename) {
            let id = ` id ='${item.id}' `;
            let status = ` Status ='R' `;
            let reason = ` ,Reason='${item.Reason}' `;
            updatedata = await updateAllDataeject(
              item.tablename,
              id,
              status,
              reason
            );
          }

          if (updatedata) {
            console.log("test to update");
          } else {
            console.log("fail to update");
          }
        })
      );

      if (array.length > 0) {
        return res.json({
          success: true,
          message: "Rejected Succesfully!",
          categories: array,
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

exports.Addgroup = async (req, res) => {
  try {
    const { groupname, tenantID, facility, group_by } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        groupname: [Joi.string().required()],
        tenantID: [Joi.string().empty().required()],
        facility: [Joi.optional().allow("")],
        group_by: [Joi.number().required()],
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
      })
    } else {
      let user = "";
      if (group_by == 1) {
        user = {
          groupname: groupname,
          tenantID: tenantID,
          groupBy: "Facility",
          group_by: "1",
        };
      } else {
        user = {
          groupname: groupname,
          tenantID: tenantID,
          groupBy: "Subgroup",
          group_by: "2",
        };
      }

      const addgroup = await Addgroup(user);
      if (addgroup.affectedRows > 0) {
        if (group_by == 1) {
          let updatedata;
          updatedata = facility.split(",");
          await Promise.all(
            updatedata.map(async (item) => {
              let user = {
                groupId: addgroup.insertId,
                facilityId: item,
              };
              const group = await Addgroupmapping(user);
            })
          );
        } else {
          let updatedata;
          updatedata = facility.split(",");
          await Promise.all(
            updatedata.map(async (item) => {
              let user = {
                groupId: addgroup.insertId,
                sub_group_id: item,
              };
              const group = await Addgroupmapping(user);
            })
          );
        }

        return res.json({
          success: true,
          message: "Succesfully Added Group!",
          categories: addgroup,
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

exports.Updategroupmapping = async (req, res) => {
  try {
    const { facility, groupId, groupname } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facility: [Joi.optional().allow("")],
        groupId: [Joi.string().empty().required()],
        groupname: [Joi.string().empty().required()],
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
      })
    } else {
      let array = [];

      const Upgroup1 = await Updategroup(groupname, groupId);
      let where = ` where groupId = '${groupId}'`;
      const Upgroup = await deleteData("`dbo.groupmapping`", where);
      if (Upgroup.affectedRows > 0) {
        let updatedata;
        updatedata = facility.split(",");

        await Promise.all(
          updatedata.map(async (item) => {
            let user = {
              groupId: groupId,
              facilityId: item,
            };
            const group = await Addgroupmapping(user);
          })
        );

        return res.json({
          success: true,
          message: "Updated Successfully",
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

exports.removeGroup = async (req, res) => {
  try {
    const { groupId } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        groupId: [Joi.string().empty().required()],
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
      })
    } else {
      let array = [];

      let where = ` where id = '${groupId}'`;
      const Upgroup = await deleteData("`dbo.group`", where);

      if (Upgroup.affectedRows > 0) {
        let where1 = ` where groupId = '${groupId}'`;
        const Upgroupmap = await deleteData("`dbo.groupmapping`", where1);

        return res.json({
          success: true,
          message: "deleted Successfully",
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

exports.getSubGroups = async (req, res) => {
  try {
    const { tenantID } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        tenantID: [Joi.string().empty().required()],
      })
    );
    const result = schema.validate(req.body);

    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      let facilities = "";
      let othersubGroups = "";

      let where =
        " LEFT JOIN `dbo.country` C ON  C.ID = F.country_id  where  F.is_subgroup = '1' and F.tenantID = '" +
        tenantID +
        "' ";
      facilities = await getSelectedColumn(
        "`dbo.group` F ",
        where,
        "F.id, F.country_id, F.groupname as name, F.tenantID, C.Name as country_name, C.CurrencyCode AS country_code, F.is_main_group"
      );

      if (facilities.length == 0) {
        let where1 = " where  A.tenant_id = '" + tenantID + "'";
        const rolesdata = await getSelectedColumn("`dbo.aspnetuserroles` A ", where1, "A.group_id, A.tenantID");

        if (rolesdata[0].group_id == 0) {
          return res.json({
            success: false,
            message: "No Sub Groups Found",
            status: 400,
          });
        }

        // let where =
        //   " LEFT JOIN `dbo.country` C ON  C.ID = F.country_id  where  F.is_subgroup = '1' and F.tenantID = '" +
        //   rolesdata[0].tenantID +
        //   "' ";
        // facilities = await getSelectedColumn("`dbo.group` F ", where, "F.id ,F.country_id,F.is_main_group,F.groupname as name,F.tenantID,C.Name as country_name, C.CurrencyCode AS country_code");

        // let where3 = " LEFT JOIN `dbo.country` C ON  C.ID = F.country_id  where  F.member_group_id = '" + rolesdata[0].group_id + "'  and F.tenantID = '" + tenantID + "'";
        // othersubGroups = await getSelectedColumn("`dbo.group` F ", where3, "F.id ,F.country_id,F.is_main_group,F.groupname as name,F.tenantID,C.Name as country_name");

        let where2 =
          " LEFT JOIN `dbo.country` C ON  C.ID = F.country_id  where  (F.is_main_group = '1' OR F.is_subgroup = '1') and F.tenantID = '" +
          rolesdata[0].tenantID +
          "' ";
        const mainGroup = await getSelectedColumn(
          "`dbo.group` F ",
          where2,
          "F.id, F.country_id, F.groupname as name, F.is_main_group, F.tenantID, C.Name as country_name, C.CurrencyCode AS country_code"
        );

        facilities.push(...mainGroup);
      } else {
        facilities = [];
        let where =
          " LEFT JOIN `dbo.country` C ON  C.ID = F.country_id  where  (F.is_main_group = '1' OR F.is_subgroup = '1') and F.tenantID = '" +
          tenantID +
          "' ";
        const mainGroup = await getSelectedColumn(
          "`dbo.group` F ",
          where,
          "F.id, F.country_id, F.groupname as name, F.is_main_group, F.tenantID, C.Name as country_name, C.CurrencyCode AS country_code"
        );

        facilities.push(...mainGroup);
      }

      if (facilities.length > 0) {
        await Promise.all(
          facilities.map(async (item) => {
            let where =
              " LEFT JOIN  `dbo.aspnetusers` F ON F.user_id   =  A.userId  LEFT JOIN `dbo.aspnetroles` R ON R.Id = A.roleId  where  A.group_id  = '" +
              item.id +
              "' and  A.tenantID = '" +
              item.tenantID +
              "'";
            const userInfoModels = await getSelectedColumn(
              "`dbo.aspnetuserroles` A ",
              where,
              "F.*,A.roleId,A.tenantID,A.group_id,R.Name as role"
            );
            item.userInfoModels = userInfoModels ? userInfoModels : [];
          })
        );

        return res.json({
          success: true,
          message: "Succesfully fetched groups",
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

exports.getGroups = async (req, res) => {
  try {
    const { tenantID } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        tenantID: [Joi.string().empty().required()],
      })
    );
    const result = schema.validate(req.body);

    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const getgroup = await getGroups(tenantID);

      await Promise.all(
        getgroup.map(async (item) => {
          if (item.groupBy == "Facility") {
            let where =
              " LEFT JOIN  `dbo.facilities` F ON F.id = A.facilityId where  A.groupId = '" +
              item.id +
              "'";
            const facilities = await getSelectedColumn(
              "`dbo.groupmapping` A ",
              where,
              "F.ID as id,F.AssestName as name"
            );
            item.facilities = facilities ? facilities : [];
          } else if (item.groupBy == "Subgroup") {
            let where = " where A.groupId = '" + item.id + "'"
            const facilities = await getSelectedColumn(
              "`dbo.groupmapping` A ",
              where,
              "A.sub_group_id as id"
            );
            item.groups = [];
            for (const items of facilities) {
              let where_next =
                ` where is_subgroup=1 and G.tenantID = ${tenantID} and id = (${items.id})`;
              const groups = await getSelectedColumn(
                "`dbo.group` G ",
                where_next,
                "G.id as ID, G.groupname  as name"
              );
              item.groups.push(groups[0])
            }
          }
        })
      );

      if (getgroup.length > 0) {
        return res.json({
          success: true,
          message: "Succesfully fetched groups",
          categories: getgroup,
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

exports.allfacilitiesbyRole = async (req, res) => {
  try {
    const { tenant_id } = req.params;
    const schema = Joi.alternatives(
      Joi.object({
        tenant_id: [Joi.number().required().empty()],
      })
    );
    const result = schema.validate(req.params);

    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    }
    const user_id = tenant_id;

    let facilities = "";
    let where =
      " LEFT JOIN  `dbo.aspnetusers` F ON F.Id  =  A.userId  LEFT JOIN `dbo.aspnetroles` R ON R.Id = A.roleId  where  A.tenant_id  = '" +
      user_id +
      "'";
    const userInfoModels = await getSelectedColumn(
      "`dbo.aspnetuserroles` A ",
      where,
      "F.*,A.roleId,A.tenantID,R.Name as role,A.facilityID"
    );

    if (userInfoModels[0].facilityID != 0) {
      let where = `LEFT JOIN  \`dbo.city\` C ON C.ID = F.CityId 
             LEFT JOIN  \`dbo.country\` CO ON CO.ID = F.CountryId  
             LEFT JOIN  \`dbo.state\` S ON S.ID = F.StateId 
             WHERE F.ID IN (${userInfoModels[0].facilityID})`;
      facilities = await getSelectedColumn(
        "`dbo.facilities` F ",
        where,
        " C.Name as city_name,CO.Name as country_name,S.Name as state_name,F.*"
      );
    } else {
      let where =
        " LEFT JOIN  `dbo.city` C ON C.ID = F.CityId LEFT JOIN  `dbo.country` CO ON CO.ID = F.CountryId  LEFT JOIN  `dbo.state` S ON S.ID = F.StateId where F.TenantID = '" +
        user_id +
        "'";
      facilities = await getSelectedColumn(
        "`dbo.facilities` F ",
        where,
        " C.Name as city_name,CO.Name as country_name,S.Name as state_name,F.*"
      );
    }

    if (facilities.length > 0) {
      await Promise.all(
        facilities.map(async (item) => {
          let where =
            " LEFT JOIN  `dbo.aspnetusers` F ON F.Id  =  A.userId  LEFT JOIN `dbo.aspnetroles` R ON R.Id = A.roleId  where  A.facilityID  = '" +
            item.ID +
            "'";
          const userInfoModels = await getSelectedColumn(
            "`dbo.aspnetuserroles` A ",
            where,
            "F.*,A.roleId,A.tenantID,R.Name as role"
          );
          item.userInfoModels = userInfoModels ? userInfoModels : [];
        })
      );

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

exports.allfacilitiesbyId = async (req, res) => {
  try {
    const { ID } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        ID: [Joi.string().empty().required()],
      })
    );
    const result = schema.validate(req.body);

    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {

      let where =
        " LEFT JOIN  `dbo.city` C ON C.ID = F.CityId LEFT JOIN  `dbo.country` CO ON CO.ID = F.CountryId  LEFT JOIN  `dbo.state` S ON S.ID = F.StateId where F.ID = '" +
        ID +
        "'";
      const facilities = await getSelectedColumn(
        "`dbo.facilities` F ",
        where,
        " C.Name as city_name,CO.Name as country_name,S.Name as state_name,F.*"
      );

      let array1 = [];
      let array2 = [];
      let array3 = [];
      if (facilities.length > 0) {
        await Promise.all(
          facilities.map(async (item) => {
            item.CityId = item.CityId ? Number(item.CityId) : 0;
            item.CountryId = item.CountryId ? Number(item.CountryId) : 0;
            item.StateId = item.StateId ? Number(item.StateId) : 0;
            let where =
              " LEFT JOIN  `dbo.aspnetusers` F ON F.user_id  =  A.userId  LEFT JOIN `dbo.aspnetroles` R ON R.Id = A.roleId  where  A.facilityID  = '" +
              item.ID +
              "'";
            const userInfoModels = await getSelectedColumn(
              "`dbo.aspnetuserroles` A ",
              where,
              "F.*,A.roleId,A.tenantID,R.Name as role"
            );
            item.userInfoModels = userInfoModels ? userInfoModels : [];
          })
        );

        let where1 = " where MD.facilityId = '" + ID + "'";
        const facilities2 = await getSelectedColumn(
          "`dbo.managedatapoint` MD  ",
          where1,
          "MD.*"
        );

        await Promise.all(
          facilities2.map(async (item) => {
            let where = " where  MD.ManageDataPointId = '" + item.ID + "'";
            const managePointCategories = await getSelectedColumn(
              "`dbo.managedatapointcategory` MD ",
              where,
              "MD.ID"
            );
            item.manageDataPointCategories = managePointCategories;

            await Promise.all(
              managePointCategories.map(async (item1) => {
                let where1 =
                  "  where  MD.ManageDataPointCategoriesId = '" +
                  item1.ID +
                  "'";
                item1.manageDataPointSubCategories = await getSelectedColumn(
                  "`dbo.managedatapointsubcategory` MD ",
                  where1,
                  "MD.ManageDataPointSubCategorySeedID"
                );
                if (item.ScopeID == "1") {
                  array1.push(item1.manageDataPointSubCategories);
                }

                if (item.ScopeID == "2") {
                  array2.push(item1.manageDataPointSubCategories);
                }

                if (item.ScopeID == "3") {
                  array3.push(item1.manageDataPointSubCategories);
                }
              })
            );
          })
        );

        let flattenedArray = array1.flatMap((subArray) =>
          subArray.map((item) => item.ManageDataPointSubCategorySeedID)
        );
        let flattenedArray2 = array2.flatMap((subArray) =>
          subArray.map((item) => item.ManageDataPointSubCategorySeedID)
        );
        let flattenedArray3 = array3.flatMap((subArray) =>
          subArray.map((item) => item.ManageDataPointSubCategorySeedID)
        );

        facilities[0].scope1 = flattenedArray;
        facilities[0].scope2 = flattenedArray2;
        facilities[0].scope3 = flattenedArray3;

        return res.json(facilities);
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

exports.Addfacilities = async (req, res) => {
  try {
    const {
      AssestName,
      tenantID,
      AssestType,
      EquityPercentage,
      Address,
      IsWaterStreenArea,
      CityId,
      CountryId,
      StateId,
    } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        AssestName: [Joi.string().empty().required()],
        tenantID: [Joi.string().empty().required()],
        AssestType: [Joi.string().empty().required()],
        EquityPercentage: [Joi.optional().allow("")],
        Address: [Joi.optional().allow("")],
        IsWaterStreenArea: [Joi.optional().allow("")],
        CityId: [Joi.optional().allow("")],
        CountryId: [Joi.optional().allow("")],
        StateId: [Joi.optional().allow("")],
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
      })
    } else {
      let user = {
        AssestName: AssestName,
        tenantID: tenantID,
        AssestType: AssestType,
        EquityPercentage: EquityPercentage ? EquityPercentage : 0,
        Address: Address ? Address : "",
        IsWaterStreenArea: IsWaterStreenArea ? IsWaterStreenArea : 0,
        CityId: CityId ? CityId : "",
        CountryId: CountryId ? CountryId : "",
        StateId: StateId ? StateId : "",
      };

      const addgroup = await Addfacilities(user);
      if (addgroup.affectedRows > 0) {
        return res.json({
          success: true,
          message: "Succesfully Added facilities!",
          categories: addgroup,
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

exports.Updatefacilities = async (req, res) => {
  try {
    const {
      AssestName,
      ID,
      tenantID,
      AssestType,
      EquityPercentage,
      Address,
      IsWaterStreenArea,
      CityId,
      CountryId,
      StateId,
      total_area,
      energy_ref_area,
      no_of_employee
    } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        ID: [Joi.string().empty().required()],
        AssestName: [Joi.optional().allow("")],
        tenantID: [Joi.optional().allow("")],
        AssestType: [Joi.optional().allow("")],
        EquityPercentage: [Joi.optional().allow("")],
        Address: [Joi.optional().allow("")],
        IsWaterStreenArea: [Joi.optional().allow("")],
        CityId: [Joi.optional().allow("")],
        CountryId: [Joi.optional().allow("")],
        StateId: [Joi.optional().allow("")],
        total_area: [Joi.optional().allow("")],
        energy_ref_area: [Joi.optional().allow("")],
        no_of_employee: [Joi.optional().allow("")]
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
      })
    } else {
      let where1 = ` where ID = '${ID}'`;
      const facilities = await getSelectedColumn(
        "`dbo.facilities` ",
        where1,
        "*"
      );

      let user = {
        AssestName: AssestName ? AssestName : facilities[0].AssestName,
        AssestType: AssestType ? AssestType : facilities[0].AssestType,
        EquityPercentage: EquityPercentage
          ? EquityPercentage
          : facilities[0].EquityPercentage,
        Address: Address ? Address : facilities[0].Address,
        IsWaterStreenArea: IsWaterStreenArea
          ? IsWaterStreenArea
          : facilities[0].IsWaterStreenArea,
        CityId: CityId ? CityId : facilities[0].CityId,
        CountryId: CountryId ? CountryId : facilities[0].CountryId,
        StateId: StateId ? StateId : facilities[0].StateId,
        total_area: total_area ? total_area : facilities[0].total_area,
        energy_ref_area: energy_ref_area ? energy_ref_area : facilities[0].energy_ref_area,
        no_of_employee: no_of_employee ? no_of_employee : facilities[0].no_of_employee
      };
      let where = "where ID  = '" + ID + "'";
      const addgroup = await updateData("`dbo.facilities`", where, user);
      if (addgroup.affectedRows > 0) {
        return res.json({
          success: true,
          message: "Succesfully Added facilities!",
          categories: addgroup,
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

exports.getAllroles = async (req, res) => {
  try {
    const getgroup = await getRoles();

    if (getgroup.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched roles",
        categories: getgroup,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Some problem occured while selecting roles",
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

exports.register = async (req, res) => {
  try {
    const {
      email,
      password,
      facilityID,
      firstname,
      lastname,
      tenantId,
      roleID,
      username,
      package_id,
      group_id,
    } = req.body;
    let jsondata = JSON.parse(facilityID);
    const convertedFacilitiyIDs = jsondata.map(Number);
    const idsString = convertedFacilitiyIDs.join(", ");
    var formattedFacilityIds = `${idsString}`;

    const saltRounds = 10;
    const schema = Joi.alternatives(
      Joi.object({
        email: [
          Joi.string()
            .min(5)
            .max(255)
            .email({ tlds: { allow: false } })
            .lowercase()
            .required(),
        ],
        password: Joi.string().min(8).max(15).required().messages({
          "any.required": "{{#label}} is required!!",
          "string.empty": "can't be empty!!",
          "string.min": "minimum 8 value required",
          "string.max": "maximum 15 values allowed",
        }),
        facilityID: [Joi.string().empty().required()],
        firstname: [Joi.string().empty().required()],
        lastname: [Joi.string().empty().required()],
        tenantId: [Joi.string().empty().required()],
        roleID: [Joi.string().empty().required()],
        username: [Joi.string().empty().required()],
        package_id: [Joi.string().empty().required()],
        group_id: [Joi.string().optional().allow("")],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      })
    } else {
      let facilities = "";
      const data = await fetchEmailUser(email);
      if (data.length !== 0) {
        return res.json({
          success: false,
          message:
            "Already have account with this " + email + " email , Please Login",
          status: 400,
        });
      }

      let userNameRes = await fetchUserByUserName(username);
      if (userNameRes.length !== 0) {
        return res.json({
          success: false,
          message: "Already have account with this " + username + " username , Please Login",
          status: 400,
        });
      }

      let groups_id = 0;
      if (group_id == "undefined") {
        groups_id = 0;
      } else {
        groups_id = group_id;
      }

      const hash = await bcrypt.hash(password, saltRounds);
      const user = {
        Id: generateRandomString(11),
        Email: email,
        passwordHash: hash,
        firstname: firstname,
        lastname: lastname,
        tenantID: tenantId,
        username: username,
      };
      const create_user = await registerUser(user);
      if (create_user.affectedRows > 0) {
        let is_super_admin = 0;
        if (roleID == "b34c0dbe-4730-4521-82dd-5d3de28bcea0") {
          is_super_admin = 1;
        } else {
          is_super_admin = 0;
        }

        let user3 = {
          Email: email,
          Password: password,
          tenantName: firstname,
          userName: username,
          user_id: create_user.insertId,
          is_super_admin: is_super_admin ? is_super_admin : 0,
        };
        const create_user2 = await Addtenants(user3);

        if (Array.isArray(jsondata) == true) {
          // for (let jsonfacility of jsondata) {
          //   const user2 = {
          //     userId :create_user.insertId,
          //     roleId: roleID,
          //     tenantID: tenantId,
          //     facilityID: jsonfacility,
          //     tenant_id: create_user2.insertId,
          //     group_id : group_id?group_id:0

          //   }
          //      const create_user1 = await registeruserRoles(user2);
          //  }

          const user2 = {
            userId: create_user.insertId,
            roleId: roleID,
            tenantID: tenantId,
            facilityID: formattedFacilityIds,
            tenant_id: create_user2.insertId,
            group_id: groups_id ? groups_id : 0,
          };
          const create_user1 = await registeruserRoles(user2);

          const user5 = {
            package_id: package_id,
            user_id: create_user2.insertId,
            facility_id: formattedFacilityIds,
            // tenantID: create_user2.insertId,
            tenantID: tenantId,
            group_id: groups_id ? groups_id : 0,
          };
          const create_user3 = await registerPackage(user5);
        } else {
          const user2 = {
            userId: create_user.insertId,
            roleId: roleID,
            tenantID: tenantId,
            facilityID: facilityID,
            tenant_id: create_user2.insertId,
            group_id: groups_id ? groups_id : 0,
          };
          const create_user1 = await registeruserRoles(user2);

          const user5 = {
            package_id: package_id,
            user_id: create_user2.insertId,
            tenantID: tenantId,
            facility_id: facilityID,
            tenantID: create_user2.insertId,
            facilities_id: facilityID,
            group_id: groups_id ? groups_id : 0,
          };
          const create_user3 = await registerPackage(user5);
        }

        return res.json({
          success: true,
          message: "Your account has been successfully created!",
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while adding user",
          status: 400,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Internal server error",
      status: 500,
      error: error,
    });
  }
};

// exports.register = async (req, res) => {
//   try {
//     const { email, password, facilityID, firstname,lastname,tenantId,roleID,username ,package_id} = req.body;
//     console.log(req.body);
//     const saltRounds = 10;
//     const schema = Joi.alternatives(
//       Joi.object({
//         email: [
//           Joi.string()
//             .min(5)
//             .max(255)
//             .email({ tlds: { allow: false } })
//             .lowercase()
//             .required(),
//         ],
//         password: Joi.string().min(8).max(15).required().messages({
//           "any.required": "{{#label}} is required!!",
//           "string.empty": "can't be empty!!",
//           "string.min": "minimum 8 value required",
//           "string.max": "maximum 15 values allowed",
//         }),
//         facilityID: [Joi.number().empty().required()],
//         firstname: [Joi.string().empty().required()],
//         lastname: [Joi.string().empty().required()],
//         tenantId: [Joi.string().empty().required()],
//         roleID: [Joi.string().empty().required()],
//         username: [Joi.string().empty().required()],
//         package_id: [Joi.string().empty().required()],
//       })
//     );
//     const result = schema.validate(req.body);
//     if (result.error) {
//       const message = result.error.details.map((i) => i.message).join(",");
//       return res.json({
//         message: result.error.details[0].message,
//         error: message,
//         missingParams: result.error.details[0].message,
//         status: 400,
//         success: false,
//    false;
//     } else {
//       const data = await fetchEmailUser(email);
//       if (data.length !== 0) {
//         return res.json({
//           success: false,
//           message:
//             "Already have account with this " + email + " email , Please Login",
//           status: 400,
//         });
//       }
//         const hash = await bcrypt.hash(password, saltRounds);
//         const user = {
//           Id:  generateRandomString(11),
//           Email: email,
//           passwordHash: hash,
//           firstname:firstname,
//           lastname: lastname,
//           tenantID: tenantId,
//           username: username,
//         };
//       const create_user = await registerUser(user);
//         if(create_user.affectedRows >0){

//           let user3 = {
//             Email: email,
//             Password: password,
//             tenantName:firstname,
//             userName: username,
//             user_id:create_user.insertId,
//           }
//           const create_user2 = await Addtenants(user3);

//           const user2 = {

//             userId :create_user.insertId,
//             roleId: roleID,
//             tenantID: tenantId,
//             facilityID: facilityID,
//             tenant_id: create_user2.insertId,
//           }
//              const create_user1 = await registeruserRoles(user2);

//              const user5 = {

//               package_id:package_id,
//               userId :create_user.insertId,
//               roleId: roleID,
//               tenantID: tenantId,
//               facility_id: facilityID,
//               tenant_id: create_user2.insertId,
//             }
//                const create_user3 = await registerPackage(user5);

//           return res.json({
//             success: true,
//             message:"Your account has been successfully created!" ,
//             status: 200,
//           });
//         }else{
//           return res.json({
//             success: false,
//             message: "Some problem occured while adding user",
//             status: 400,
//         });
//         }

//     }
//   } catch (error) {
//     console.log(error);
//     return res.json({
//       success: false,
//       message: "Internal server error",
//       status: 500,
//       error: error,
//     });
//   }
// };

exports.Updateregister = async (req, res) => {
  try {
    const {
      user_id,
      email,
      password,
      facilityID,
      firstname,
      lastname,
      tenantId,
      roleID,
      username,
      group_id
    } = req.body;
    const saltRounds = 10;
    const schema = Joi.alternatives(
      Joi.object({
        user_id: [Joi.string().empty().required()],
        email: [Joi.optional().allow("")],
        password: [Joi.optional().allow("")],
        facilityID: [Joi.optional().allow("")],
        group_id: [Joi.optional().allow("")],
        firstname: [Joi.optional().allow("")],
        lastname: [Joi.optional().allow("")],
        tenantId: [Joi.optional().allow("")],
        roleID: [Joi.optional().allow("")],
        username: [Joi.optional().allow("")],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,

        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      let where1 = ` where  user_id ='${user_id}'  `;
      const data = await getSelectedColumn("`dbo.aspnetusers`", where1, "*");

      const user = {
        Email: email ? email : data[0].email,
        firstname: firstname ? firstname : data[0].firstname,
        lastname: lastname ? lastname : data[0].lastname,
        username: username ? username : data[0].username,
      };

      let where = "where user_id  = '" + user_id + "'";
      const create_user = await updateData("`dbo.aspnetusers`", where, user);
      if (create_user.affectedRows > 0) {
        let where1 = ` where  Email ='${data[0].email}'  `;
        const data1 = await getSelectedColumn("`dbo.tenants`", where1, "*");

        let user3 = {
          Email: email ? email : data1[0].Email,
          tenantName: firstname ? firstname : data1[0].tenantName,
          userName: username ? username : data1[0].userName,
        };
        let where = "where user_id  = '" + user_id + "'";
        const addgroup = await updateData("`dbo.tenants`", where, user3);

        // let where11 = ` where userId = '${user_id}'`;
        // const Upgroup = await deleteData("`dbo.aspnetuserroles`", where11);

        const user22 = {
          roleId: roleID,
          facilityID: JSON.parse(facilityID).join(','),
          group_id: group_id
        };
        let where3 = "where userId   = '" + user_id + "'";
        const create_user1 = await updateData("`dbo.aspnetuserroles`", where3, user22);

        return res.json({
          success: true,
          message: "Your account has been Updated successfully!",
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while adding user",
          status: 400,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Internal server error",
      status: 500,
      error: error,
    });
  }
};

exports.getAllusers = async (req, res) => {
  try {
    const { tenantId, search } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        tenantId: [Joi.string().empty().required()],
        search: [Joi.string().empty().required().allow('')]
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
      })
    } else {
      const getgroup = await fetchAllusers(tenantId, search);
      var facility = [];
      if (getgroup.length > 0) {
        await Promise.all(
          getgroup.map(async (item) => {
            let where =
              "LEFT JOIN `dbo.aspnetroles` R ON R.Id = A.roleId  LEFT JOIN `dbo.group` G ON G.id = A.group_id where  A.userId = '" +
              item.user_id +
              "' and A.tenant_id ='" +
              item.tenant_id +
              "'";
            const getgroup1 = await getSelectedColumn(
              "`dbo.aspnetuserroles` A ",
              where,
              " A.*,R.Name as role, G.groupname as GroupName, G.id as group_id, G.is_subgroup, G.is_main_group"
            );

            let groupIdFallback = null;
            let groupNameFallback = null;
            let groupMainFallback = null;
            let groupSubFallback = null;
            if (!getgroup1[0].group_id) {
              const fallbackGroup = await getSelectedColumn(
                "`dbo.group` AS grp",
                `WHERE grp.tenantID = '${getgroup1[0].userId}' AND grp.is_main_group = 1`,
                "grp.id, grp.groupname, grp.is_main_group, grp.is_subgroup"
              );
              groupIdFallback = fallbackGroup[0]?.id || null;
              groupNameFallback = fallbackGroup[0]?.groupname || null;
              groupMainFallback = fallbackGroup[0]?.is_main_group || null;
              groupSubFallback = fallbackGroup[0]?.is_subgroup || null;
            }

            if (
              getgroup1[0]?.role == "Super Admin" ||
              getgroup1[0]?.role == "Admin"
            ) {
              let wheref =
                "LEFT JOIN  `dbo.facilities` F ON  F.TenantID = A.tenantID LEFT JOIN `dbo.aspnetroles` R ON R.Id = A.roleId  where   A.tenant_id ='" +
                item.tenant_id +
                "'";
              facility = await getSelectedColumn(
                "`dbo.aspnetuserroles` A ",
                wheref,
                " A.*,R.Name as role,F.AssestName as facilityName,  F.id as facility_id"
              );
            } else {
              let wheref =
                "LEFT JOIN  `dbo.facilities` F ON  F.ID = A.facilityID LEFT JOIN `dbo.aspnetroles` R ON R.Id = A.roleId  where   A.tenant_id ='" +
                item.tenant_id +
                "'";
              facility = await getSelectedColumn(
                "`dbo.aspnetuserroles` A ",
                wheref,
                " A.*,R.Name as role,F.AssestName as facilityName,  F.id as facility_id"
              );
            }

            item.roleId = getgroup1[0]?.roleId;
            item.facilityID = facility[0]?.facility_id;
            item.facilityName = facility[0]?.facilityName;
            item.role = getgroup1[0]?.role;
            item.group_name = getgroup1[0]?.GroupName == null ? groupNameFallback : getgroup1[0]?.GroupName;
            item.group_id = getgroup1[0]?.group_id == null ? groupIdFallback : getgroup1[0]?.group_id;
            item.is_subgroup = getgroup1[0]?.is_subgroup == null ? groupSubFallback : getgroup1[0]?.is_subgroup;
            item.is_main_group = getgroup1[0]?.is_main_group == null ? groupMainFallback : getgroup1[0]?.is_main_group;
            item.facilities_id = getgroup1[0]?.facilityID.split(",").map(i => i.trim());
            item.password = "";
          })
        );
        return res.json({
          success: true,
          message: "Retrived get all users successfully",
          status: 200,
          data: getgroup
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while selecting users",
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

exports.removeUser = async (req, res) => {
  try {
    const { user_id } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        user_id: [Joi.string().empty().required()],
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
      })
    } else {
      let array = [];

      let where = ` where user_id = '${user_id}'`;
      const Upgroup = await deleteData("`dbo.aspnetusers`", where);

      if (Upgroup.affectedRows > 0) {
        let where1 = ` where 	userId  = '${user_id}'`;
        const Upgroupmap = await deleteData("`dbo.aspnetuserroles`", where1);

        let where2 = ` where 	user_id  = '${user_id}'`;
        const Upgroupmap2 = await deleteData("`dbo.tenants`", where2);

        //
        return res.json({
          success: true,
          message: "deleted Successfully",
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

exports.getcountries = async (req, res) => {
  try {
    const getgroup = await getcountries();

    if (getgroup.length > 0) {
      return res.json(getgroup);
    } else {
      return res.json({
        success: false,
        message: "Some problem occured while selecting countries",
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

exports.getstateByCountries = async (req, res) => {
  try {
    const { CountryID } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        CountryID: [Joi.string().empty().required()],
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
      })
    } else {
      let where = ` where  CountryID ='${CountryID}'  `;
      const getgroup = await getSelectedColumn("`dbo.state`", where, "*");

      if (getgroup.length > 0) {
        return res.json(getgroup);
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while selecting state",
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

exports.getcityBystate = async (req, res) => {
  try {
    const { StateID } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        StateID: [Joi.string().empty().required()],
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
      })
    } else {
      let where = ` where  StateID ='${StateID}'  `;
      const getgroup = await getSelectedColumn("`dbo.city`", where, "*");

      if (getgroup.length > 0) {
        return res.json(getgroup);
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while selecting state",
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

exports.getpackages = async (req, res) => {
  try {
    let where = " ";
    const packages = await getSelectedColumn("packages", where, "*");

    if (packages.length > 0) {
      await Promise.all(
        packages.map(async (item) => {
          let where1 =
            ' LEFT JOIN  `dbo.facilities` C ON C.ID = A.facility_id where A.package_id  = "' +
            item.id +
            '"';
          const packageusers = await getSelectedColumn(
            "packages_users A ",
            where1,
            "C.ID,C.AssestName,A.facility_id"
          );
          item.packageusers = packageusers;
        })
      );

      return res.json({
        success: true,
        message: "Succesfully fetched packages",
        categories: packages,
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

exports.addpackage = async (req, res) => {
  try {
    const { package_id, facility_id } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        // tenantID: [Joi.string().empty().required()],
        package_id: [Joi.string().empty().required()],
        facility_id: [Joi.optional().allow("")],
      })
    );
    const result = schema.validate(req.body);

    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      let array = [];

      const user_id = req.user.user_id;

      //console.log(facility_id,"     facilitiessssssssssssss")
      let tenantIDvalue = facility_id.replace(/\[|\]/g, "");
      let where = `where  package_id = '${package_id}' and facility_id IN (${tenantIDvalue})`;
      const packagesusers = await getSelectedColumn(
        "packages_users",
        where,
        "*"
      );

      if (packagesusers.length > 0) {
        return res.json({
          success: false,
          message: "You have already subscribe this package",
          status: 400,
        });
      } else {
        //let values =  JSON.parse(facility_id);
        let values = facility_id.split(",");
        await Promise.all(
          values.map(async (item) => {
            let user = {
              package_id: package_id,
              user_id: user_id,
              facility_id: item,
            };
            const packagesusers = await Addpackages_user(user);
            if (packagesusers.affectedRows > 0) {
              array.push(packagesusers.insertId);
            }
          })
        );
        if (array.length > 0) {
          return res.json({
            success: true,
            message: "Succesfully Added package",
            status: 200,
          });
        } else {
          return res.json({
            success: false,
            message: "Some problem occured while selecting packages",
            status: 400,
          });
        }
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

exports.getpackagesByusers = async (req, res) => {
  try {
    let where1 =
      " LEFT JOIN  packages B ON B.id = A.package_id  LEFT JOIN  `dbo.tenants` C ON C.Id = A.tenantID";
    const packages = await getSelectedColumn(
      "packages_users A ",
      where1,
      "A.tenantID,B.*,C.tenantName"
    );

    if (packages.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched packages users",
        categories: packages,
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

exports.GetcategoryByScope = async (req, res) => {
  try {
    let array1 = [];
    let array2 = [];
    let array3 = [];

    const category = await getSelectedColumn(
      "`dbo.categoryseeddata`",
      ` `,
      "CatName as label,Id as value,ScopeId as scopeid "
    );
    await Promise.all(
      category.map(async (item) => {
        let where = ` where CategorySeedDataId ='${item.value}'`;
        const category1 = await getSelectedColumn(
          "`subcategoryseeddata`",
          where,
          "Item as label,Id as value,CategorySeedDataId as category_id"
        );
        item.items = category1;

        if (item.scopeid == "1") {
          array1.push(item);
        }
        if (item.scopeid == "2") {
          array2.push(item);
        }
        if (item.scopeid == "3") {
          array3.push(item.items[0]);
        }
      })
    );

    if (category.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched  category",
        scope1: array1,
        scope2: array2,
        scope3: array3,
        status: 400,
      });
    } else {
      return res.json({
        success: false,
        message: "Some problem occured while selecting category",
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

exports.Adduser_offseting = async (req, res) => {
  try {
    const {
      project_name,
      date_of_purchase,
      comments,
      vintage,
      scope1,
      scope2,
      scope3,
      offset,
      tenant_id,
      standard,
      carbon_credit_value,
      type,
    } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        project_name: [Joi.string().empty().required()],
        //  project_type:[Joi.string().empty().required()],
        date_of_purchase: [Joi.string().empty().required()],
        vintage: [Joi.string().empty().required()],
        scope1: [Joi.optional().allow("")],
        scope2: [Joi.optional().allow("")],
        scope3: [Joi.optional().allow("")],
        offset: [Joi.string().empty().required()],
        tenant_id: [Joi.string().empty().required()],
        type: [Joi.string().empty().required()],
        carbon_credit_value: [Joi.string().empty().required()],
        standard: [Joi.string().empty().required()],
        comments: [Joi.optional().allow("")],
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
      })
    } else {
      const user_id = req.user.user_id;

      let user = {
        project_name: project_name,
        scope1: scope1 ? scope1 : 0,
        scope2: scope2 ? scope2 : 0,
        scope3: scope3 ? scope3 : 0,
        offset: offset,
        user_id: user_id,
        order_id: generateRandomString(10),
        tenant_id: tenant_id,
        type: type,
        carbon_credit_value: carbon_credit_value,
        standard: standard,
        vintage: vintage,
        project_type: type,
        comments: comments,
        date_of_purchase: date_of_purchase,
      };

      let filename = "";
      if (req.file) {
        const file = req.file;
        filename = file.filename;
        user.file = filename;
      }

      const addgroup = await user_offseting(user);
      if (addgroup.affectedRows > 0) {
        return res.json({
          success: true,
          message: "Succesfully Added Offset!",
          categories: addgroup,
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

exports.getuser_offseting = async (req, res) => {
  try {
    const { tenant_id } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        tenant_id: [Joi.string().empty().required()],
      })
    );
    const result = schema.validate(req.body);

    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      let where =
        " LEFT JOIN  `dbo.tenants` B ON B.Id = A.user_id where  A.tenant_id = '" +
        tenant_id +
        "'";
      const users = await getSelectedColumn(
        " `user_offseting` A ",
        where,
        "A.*,B.tenantName as user_name "
      );

      if (users.length > 0) {
        await Promise.all(
          users.map(async (item) => {
            if (item.file != null) {
              item.file_path = baseurl + "/upload_document/" + item.file;
            } else {
              item.file_path = "";
            }
          })
        );

        return res.json({
          success: true,
          message: "Succesfully fetched Users Offset",
          categories: users,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while selecting Offset",
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

exports.AddComapnyDetail = async (req, res) => {
  try {
    const {
      companyName,
      industryTypeID,
      secondIndustryTypeID,
      tenant_id,
      location,
      companyBio,
    } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        companyName: [Joi.optional().allow("")],
        industryTypeID: [Joi.optional().allow("")],
        secondIndustryTypeID: [Joi.optional().allow("")],
        tenant_id: [Joi.string().empty().required()],
        companyBio: [Joi.optional().allow("")],
        location: [Joi.optional().allow("")],
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
      })
    } else {
      let where1 = ` where 	Id = '${tenant_id}'`;
      const tenants = await getSelectedColumn("`dbo.tenants` ", where1, "*");

      let user = {
        companyName: companyName ? companyName : tenants[0].companyName,
        industryTypeID: industryTypeID
          ? industryTypeID
          : tenants[0].industryTypeID,
        secondIndustryTypeID: secondIndustryTypeID
          ? secondIndustryTypeID
          : tenants[0].secondIndustryTypeID,
        companyBio: companyBio ? companyBio : tenants[0].companyBio,
        location: location ? location : tenants[0].location,
      };

      let filename = "";
      let filename1 = "";
      if (req.file) {
        const file = req.file;
        filename = file.filename;
      } else {
        filename1 = tenants[0].logoPath;
        filename = tenants[0].logoName;
      }

      user.logoPath = filename1;
      user.logoName = filename;

      let where = "where 	Id  = '" + tenant_id + "'";
      const addtenants = await updateData("`dbo.tenants`", where, user);

      if (addtenants.affectedRows > 0) {
        return res.json({
          success: true,
          message: "Succesfully Added tenants!",
          categories: addtenants,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while selecting tenants!",
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

exports.getComapnyDetail = async (req, res) => {
  try {
    const { tenant_id } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        tenant_id: [Joi.string().empty().required()],
      })
    );
    const result = schema.validate(req.body);

    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      let where = " where  A.Id = '" + tenant_id + "'";
      const users = await getSelectedColumn("`dbo.tenants` A ", where, "A.*");

      if (users.length > 0) {
        await Promise.all(
          users.map(async (item) => {
            item.logoPath = item.logoName
              ? baseurl + "/image/" + item.logoName
              : "";
          })
        );
        return res.json({
          success: true,
          message: "Succesfully fetched Company Detail!",
          categories: users,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while selecting Company Detail!",
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

exports.getComapnyCategory = async (req, res) => {
  try {
    let where = " ";
    const companyprofile_category = await getSelectedColumn(
      "company_profile_category",
      where,
      "*"
    );

    if (companyprofile_category.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched Company Detail!",
        categories: companyprofile_category,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Some problem occured while selecting Company Detail!",
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

exports.getComapnySubCategory = async (req, res) => {
  try {
    const { category } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
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
        status: 400,
        success: false,
      });
    } else {
      let where1 = ` where category = '${category}'`;
      const category1 = await getSelectedColumn(
        "company_profile_category",
        where1,
        "*"
      );

      let where = ` where cat_id = '${category1[0].id}'`;
      const companyprofile_category = await getSelectedColumn(
        "company_profile_subcategory",
        where,
        "*"
      );

      if (companyprofile_category.length > 0) {
        return res.json({
          success: true,
          message: "Succesfully fetched Company Detail!",
          categories: companyprofile_category,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while selecting Company Detail!",
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

exports.getVendorlist = async (req, res) => {
  try {
    const { tenant_id } = req.params;
    const schema = Joi.alternatives(
      Joi.object({
        tenant_id: [Joi.string().empty().required()],
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
        success: true,
      });
    }

    let where = ` where user_id = '${tenant_id}'`;
    const vendor = await getSelectedColumn("vendor", where, "*");

    if (vendor.length > 0) {
      await Promise.all(
        vendor.map(async (item) => {
          let where = ` where ID = '${item.country_id}'`;
          const countriesdata = await getSelectedColumn(
            "`dbo.country`",
            where,
            "*"
          );

          if (countriesdata.length > 0) {
            item.country_name = countriesdata[0].Name;
          } else {
            item.country_name = "";
          }
        })
      );
      return res.json({
        success: true,
        message: "Succesfully fetched vendor!",
        categories: vendor,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Some problem occured while selecting vendor",
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

exports.deleteVendor = async (req, res) => {
  try {
    const { id } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        id: [Joi.number().empty().required()],
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
      })
    } else {
      const user_id = req.user.user_id;

      let where = ` where id = '${id}' and user_id = '${user_id}'`;
      const vendordata = await deleteData("vendor", where);

      if (vendordata.affectedRows > 0) {
        return res.json({
          success: true,
          message: "deleted Successfully",
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while deleting",
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

////////////////////////////////////////////newwww///////////////////////////////////////////////////////

exports.updateuser_offseting = async (req, res) => {
  try {
    const {
      project_name,
      id,
      project_type,
      date_of_purchase,
      comments,
      vintage,
      scope1,
      scope2,
      scope3,
      offset,
      tenant_id,
      standard,
      carbon_credit_value,
      type,
    } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        project_name: [Joi.string().empty().required()],
        project_type: [Joi.optional().allow("")],
        date_of_purchase: [Joi.string().empty().required()],
        vintage: [Joi.string().empty().required()],
        scope1: [Joi.optional().allow("")],
        scope2: [Joi.optional().allow("")],
        scope3: [Joi.optional().allow("")],
        offset: [Joi.string().empty().required()],
        tenant_id: [Joi.string().empty().required()],
        type: [Joi.string().empty().required()],
        carbon_credit_value: [Joi.string().empty().required()],
        standard: [Joi.string().empty().required()],
        comments: [Joi.optional().allow("")],
        id: [Joi.string().empty().required()],
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
      })
    } else {
      const user_id = req.user.user_id;

      let where =
        " where  A.user_id = '" + user_id + "' and A.id = '" + id + "'";
      const users = await getSelectedColumn(
        " `user_offseting` A ",
        where,
        "A.*"
      );

      let user = {
        project_name: project_name ? project_name : users[0].project_name,
        scope1: scope1 ? scope1 : users[0].scope1 ? users[0].scope1 : 0,
        scope2: scope2 ? scope2 : users[0].scope2 ? users[0].scope2 : 0,
        scope2: scope3 ? scope3 : users[0].scope3 ? users[0].scope3 : 0,
        offset: offset ? offset : users[0].offset,
        tenant_id: tenant_id ? tenant_id : users[0].tenant_id,
        type: type ? type : users[0].type,
        carbon_credit_value: carbon_credit_value
          ? carbon_credit_value
          : users[0].carbon_credit_value,
        standard: standard ? standard : users[0].standard,
        vintage: vintage ? vintage : users[0].vintage,
        //project_type:project_type? project_type : users[0].project_type,
        comments: comments ? comments : users[0].comments,
        date_of_purchase: date_of_purchase
          ? date_of_purchase
          : users[0].date_of_purchase,
      };

      let filename = "";
      if (req.file) {
        const file = req.file;
        filename = file.filename;
        user.file = filename;
      }

      const addgroup = await update_user_offseting(user, id);
      if (addgroup.affectedRows > 0) {
        return res.json({
          success: true,
          message: "Succesfully Added Offset!",
          categories: addgroup,
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

exports.deleteuser_offseting = async (req, res) => {
  try {
    const { id } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        id: [Joi.number().empty().required()],
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
      })
    } else {
      const user_id = req.user.user_id;

      let where = ` where id = '${id}' and user_id = '${user_id}'`;
      const vendordata = await deleteData("user_offseting", where);

      if (vendordata.affectedRows > 0) {
        return res.json({
          success: true,
          message: "deleted Successfully",
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while deleting",
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

exports.addHazardous_nonhazardous = async (req, res) => {
  try {
    const { hazadrous, non_hazadrous } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        non_hazadrous: [Joi.string().empty().required()],
        hazadrous: [Joi.string().empty().required()],
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
      })
    } else {
      const user_id = req.user.user_id;

      let user = {
        hazadrous: hazadrous ? hazadrous : "",
        non_hazadrous: non_hazadrous ? non_hazadrous : "",
        user_id: user_id,
      };

      let where = ` where user_id = '${user_id}'`;
      const hazadrous_nonhazadrous = await getSelectedColumn(
        "hazadrous_nonhazadrous_setting",
        where,
        "*"
      );

      if (hazadrous_nonhazadrous.length > 0) {
        return res.json({
          success: false,
          message: "You have already added your hazadrous nonhazadrous waste!",
          status: 400,
        });
      }

      const vendor = await addhazadrous_nonhazadrous(user);
      if (vendor.affectedRows > 0) {
        return res.json({
          success: true,
          message: "Succesfully Added hazadrous non hazadrous!",
          categories: vendor,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message:
            "Some problem occured while selecting hazadrous_nonhazadrous",
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

exports.getHazardous_nonhazardouslist = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    let where = ` where user_id = '${user_id}'`;
    const hazadrous_nonhazadrous = await getSelectedColumn(
      "hazadrous_nonhazadrous_setting",
      where,
      "*"
    );

    if (hazadrous_nonhazadrous.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched hazadrous non hazadrous!",
        categories: hazadrous_nonhazadrous,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Some problem occured while selecting vendor",
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

exports.deleteHazardous_nonhazardous = async (req, res) => {
  try {
    const { id } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        id: [Joi.number().empty().required()],
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
      })
    } else {
      const user_id = req.user.user_id;

      let where = ` where id = '${id}' and user_id = '${user_id}'`;
      const vendordata = await deleteData(
        "hazadrous_nonhazadrous_setting",
        where
      );

      if (vendordata.affectedRows > 0) {
        return res.json({
          success: true,
          message: "deleted Successfully",
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while deleting",
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

exports.updateHazardous_nonhazardous = async (req, res) => {
  try {
    const { hazadrous, non_hazadrous, id } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        hazadrous: [Joi.string().empty().required()],
        non_hazadrous: [Joi.string().empty().required()],
        // id: [Joi.string().optional().required()],
        id: [Joi.optional().allow("")],
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
      })
    } else {
      const user_id = req.user.user_id;

      if (user_id != undefined) {
        let where = " where  A.user_id = '" + user_id + "' ";
        const users = await getSelectedColumn(
          " `hazadrous_nonhazadrous_setting` A ",
          where,
          "A.*"
        );

        let user = {
          non_hazadrous: non_hazadrous
            ? non_hazadrous
            : users[0].non_hazadrous
              ? users[0].non_hazadrous
              : "",
          hazadrous: hazadrous
            ? hazadrous
            : users[0].hazadrous
              ? users[0].hazadrous
              : "",
        };
        if (users.length > 0) {
          const addgroup = await updatehazadrous_nonhazadrous(user, user_id);
          if (addgroup.affectedRows > 0) {
            return res.json({
              success: true,
              message: "Succesfully Updated hazadrous non hazadrous!",
              categories: addgroup,
              status: 200,
            });
          } else {
            return res.json({
              success: false,
              message:
                "Some problem occured while selecting hazadrous non hazadrous",
              status: 400,
            });
          }
        }
      } else {
        let user1 = {
          hazadrous: hazadrous ? hazadrous : "",
          non_hazadrous: non_hazadrous ? non_hazadrous : "",
          user_id: user_id,
        };
        const vendor = await addhazadrous_nonhazadrous(user1);
        if (vendor.affectedRows > 0) {
          return res.json({
            success: true,
            message: "Succesfully Added hazadrous non hazadrous!",
            categories: vendor,
            status: 200,
          });
        } else {
          return res.json({
            success: false,
            message:
              "Some problem occured while selecting hazadrous_nonhazadrous",
            status: 400,
          });
        }
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

exports.AddVendor = async (req, res) => {
  try {
    const { name, address, refer_id, tenant_id, country_id, scorecard, targetStatus } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        name: [Joi.string().empty().required()],
        address: [Joi.string().empty().required()],
        refer_id: [Joi.string().empty().required()],
        scorecard: [Joi.string().empty().required()],
        targetStatus: [Joi.string().empty().required()],
        tenant_id: [Joi.string().optional().allow("")],
        country_id: [Joi.string().optional().allow("")],
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
      })
    } else {
      const user_id = req.user.user_id;

      let user = {
        name: name ? name : "",
        address: address ? address : "",
        refer_id: refer_id ? refer_id : "",
        user_id: tenant_id ? tenant_id : user_id,
        country_id: country_id ? country_id : 0,
        scorecard: scorecard ? scorecard : '',
        target_status: targetStatus ? targetStatus : ''
      };


      const checkRefrenceId = await getSelectedData('vendor', `where user_id =${tenant_id} and refer_id = ${refer_id}`, '*');
      if (checkRefrenceId.length > 0) {
        return res.json({
          success: false,
          message: "Vendor Reference Already Exist!",
          status: 200,
        });
      } else {
        const vendor = await addVendor(user);
        if (vendor.affectedRows > 0) {
          return res.json({
            success: true,
            message: "Succesfully Added vendor!",
            categories: vendor,
            status: 200,
          });
        } else {
          return res.json({
            success: false,
            message: "Some problem occured while selecting vendor",
            status: 400,
          });
        }

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

exports.updateVendor = async (req, res) => {
  try {
    const { id, name, address, refer_id, country_id, scorecard, targetStatus, tenant_id } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        id: [Joi.number().empty().required()],
        address: [Joi.optional().allow("")],
        name: [Joi.optional().allow("")],
        country_id: [Joi.string().optional().allow("")],
        refer_id: [Joi.optional().allow("")],
        scorecard: [Joi.string().empty().required()],
        targetStatus: [Joi.string().empty().required()],
        tenant_id: [Joi.string().optional().allow("")]
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
      })
    } else {
      const checkRefrenceId = await getSelectedData('vendor', `where user_id =${tenant_id} and refer_id = ${refer_id} and id != ${id}`, '*');
      if (checkRefrenceId.length > 0) {
        return res.json({
          success: false,
          message: "Vendor Reference Already Exist!",
          status: 200,
        });
      } else {
        let user = {
          name: name ? name : vendordata[0].name,
          address: address ? address : vendordata[0].address,
          refer_id: refer_id ? refer_id : vendordata[0].refer_id,
          country_id: country_id ? country_id : vendordata[0].country_id,
          scorecard: scorecard ? scorecard : '',
          target_status: targetStatus ? targetStatus : ''

        };

        let where1 = "where id  = '" + id + "'";
        const updatevendor = await updateData("vendor", where1, user);

        if (updatevendor.affectedRows > 0) {
          return res.json({
            success: true,
            message: "Succesfully updated vendor!",
            categories: updatevendor,
            status: 200,
          });
        } else {
          return res.json({
            success: false,
            message: "Some problem occured while selecting vendor!",
            status: 400,
          });
        }

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

exports.AddCostcenter = async (req, res) => {
  try {
    const { cost_center_name, cost_center_refer_id, tenant_id } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        cost_center_name: [Joi.string().empty().required()],
        cost_center_refer_id: [Joi.string().empty().required()],
        tenant_id: [Joi.string().optional().allow("")],
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
      })
    } else {
      const user_id = req.user.user_id;

      let user = {
        cost_center_name: cost_center_name ? cost_center_name : "",
        cost_center_refer_id: cost_center_refer_id ? cost_center_refer_id : "",
        user_id: tenant_id ? tenant_id : user_id,
      };

      const cost_center = await addcost_center(user);
      if (cost_center.affectedRows > 0) {
        return res.json({
          success: true,
          message: "Succesfully Added cost center!",
          categories: cost_center,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while selecting cost center",
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

exports.updatecostCenter = async (req, res) => {
  try {
    const { id, cost_center_name, cost_center_refer_id } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        id: [Joi.number().empty().required()],
        cost_center_name: [Joi.optional().allow("")],
        cost_center_refer_id: [Joi.optional().allow("")],
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
      })
    } else {
      const user_id = req.user.user_id;

      let where = ` where user_id = '${user_id}'`;
      const vendordata = await getSelectedColumn("cost_center", where, "*");

      let user = {
        cost_center_name: cost_center_name
          ? cost_center_name
          : vendordata[0].cost_center_name,
        cost_center_refer_id: cost_center_refer_id
          ? cost_center_refer_id
          : vendordata[0].cost_center_refer_id,
      };

      let where1 = "where id  = '" + id + "'  and user_id = '" + user_id + "'";
      const updatevendor = await updateData("cost_center", where1, user);

      if (updatevendor.affectedRows > 0) {
        return res.json({
          success: true,
          message: "Succesfully updated cost center!",
          categories: updatevendor,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while selecting cost center!",
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

exports.deletecostCenter = async (req, res) => {
  try {
    const { id } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        id: [Joi.number().empty().required()],
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
      })
    } else {
      const user_id = req.user.user_id;

      let where = ` where id = '${id}' and user_id = '${user_id}'`;
      const vendordata = await deleteData("cost_center", where);

      if (vendordata.affectedRows > 0) {
        return res.json({
          success: true,
          message: "deleted Successfully",
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while deleting",
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

exports.getcostCenter = async (req, res) => {
  try {
    const { tenant_id } = req.params;
    const schema = Joi.alternatives(
      Joi.object({
        tenant_id: [Joi.string().empty().required()],
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
        success: true,
      });
    }

    let where = ` where user_id = '${tenant_id}'`;
    const hazadrous_nonhazadrous = await getSelectedColumn(
      "cost_center",
      where,
      "*"
    );

    if (hazadrous_nonhazadrous.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched cost center!",
        categories: hazadrous_nonhazadrous,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Some problem occured while selecting cost center",
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

exports.Addfinancial_year = async (req, res) => {
  try {
    const { financial_year } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        financial_year: [Joi.string().empty().required()],
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
      })
    } else {
      const user_id = req.user.user_id;

      let user = {
        financial_year: financial_year ? financial_year : "",
        user_id: user_id,
      };

      let where = ` where user_id = '${user_id}'`;
      const financialyear = await getSelectedColumn(
        "financial_year_setting",
        where,
        "*"
      );

      if (financialyear.length > 0) {
        return res.json({
          success: false,
          message: "You have already added your inancial year!",
          status: 400,
        });
      }

      const financial = await addfinancial_year(user);
      if (financial.affectedRows > 0) {
        return res.json({
          success: true,
          message: "Succesfully Added financial_year!",
          categories: financial,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while selecting financial_year",
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

exports.updatefinancial_year = async (req, res) => {
  try {
    const { id, financial_year } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        id: [Joi.optional().allow("")],
        financial_year: [Joi.optional().allow("")],
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
      })
    } else {
      const user_id = req.user.user_id;

      if (id != undefined) {
        let where = ` where user_id = '${user_id}'`;
        const vendordata = await getSelectedColumn(
          "financial_year_setting",
          where,
          "*"
        );

        let user = {
          financial_year: financial_year
            ? financial_year
            : vendordata[0].financial_year,
        };

        let where1 =
          "where id  = '" + id + "'  and user_id = '" + user_id + "'";
        const updatevendor = await updateData(
          "financial_year_setting",
          where1,
          user
        );

        if (updatevendor.affectedRows > 0) {
          return res.json({
            success: true,
            message: "Succesfully updated financial_year!",
            categories: updatevendor,
            status: 200,
          });
        } else {
          return res.json({
            success: false,
            message: "Some problem occured while selecting financial_year!",
            status: 400,
          });
        }
      } else {
        let user = {
          financial_year: financial_year ? financial_year : "",
          user_id: user_id,
        };

        const cost_center = await addfinancial_year(user);
        if (cost_center.affectedRows > 0) {
          return res.json({
            success: true,
            message: "Succesfully Added financial_year!",
            categories: cost_center,
            status: 200,
          });
        } else {
          return res.json({
            success: false,
            message: "Some problem occured while selecting financial_year",
            status: 400,
          });
        }
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

exports.deletefinancial_year = async (req, res) => {
  try {
    const { id } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        id: [Joi.number().empty().required()],
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
      })
    } else {
      const user_id = req.user.user_id;

      let where = ` where id = '${id}' and user_id = '${user_id}'`;
      const vendordata = await deleteData("financial_year_setting", where);

      if (vendordata.affectedRows > 0) {
        return res.json({
          success: true,
          message: "deleted Successfully",
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while deleting",
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

exports.getfinancial_year = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    let where = ` where user_id = '${user_id}'`;
    const financial_year = await getSelectedColumn(
      "financial_year_setting",
      where,
      "*"
    );

    if (financial_year.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched financial year!",
        categories: financial_year,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Some problem occured while selecting financial year",
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

exports.updateActions = async (req, res) => {
  try {
    const { id, status } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        id: [Joi.number().empty().required()],
        status: [Joi.string().empty().required()],
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
      })
    } else {
      const user_id = req.user.user_id;

      let user = {
        status: status ? status : "",
      };

      let where1 = "where id  = '" + id + "'  and user_id = '" + user_id + "'";
      const updatevendor = await updateData("actions", where1, user);

      if (updatevendor.affectedRows > 0) {
        return res.json({
          success: true,
          message: "Succesfully updated actions!",
          categories: updatevendor,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while selecting actions!",
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

exports.getSuperadmin = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    let where =
      ` LEFT JOIN  \`dbo\.\aspnetroles\` B ON B.Id = A.roleId where  A.tenant_id ='` +
      user_id +
      `' and  B.Name = 'Platform Admin'`;
    const roles = await getSelectedColumn(
      "`dbo.aspnetuserroles` A ",
      where,
      "A.facilityID,A.roleId,A.userId,B.Name"
    );

    if (roles.length !== 0) {
      let data1 = await fetchUserBySuperAdmin();

      await Promise.all(
        data1.map(async (item) => {
          let where1 =
            `  LEFT JOIN  packages B ON B.id = A.package_id  where  A.tenantID  ='` +
            item.Id +
            `'`;
          const packagesusers = await getSelectedColumn(
            "packages_users A ",
            where1,
            "B.*,B.package_name,B.id as package_id,A.facility_id,A.expired_at"
          );
          // console.log(packagesusers,"packagesuserspackagesusers");

          item.tenantID = item.Id;
          item.licenseExpired = packagesusers[0]?.expired_at;
          item.package_id = packagesusers[0]?.package_id;
          item.package_name = packagesusers[0]?.package_name;
          item.package_info = packagesusers[0];

          let where2 = ` where  A.is_super_admin ='1'`;
          const super_admin = await getSelectedColumn(
            "`dbo.tenants` A ",
            where2,
            "A.Id as super_admin_id"
          );
          item.super_admin_id = super_admin[0]?.super_admin_id;

          let where =
            ` LEFT JOIN  \`dbo\.\aspnetroles\` B ON B.Id = A.roleId where  A.tenant_id ='` +
            item.Id +
            `' `;
          const roles = await getSelectedColumn(
            "`dbo.aspnetuserroles` A ",
            where,
            "A.facilityID,A.roleId,A.userId,B.Name"
          );

          await Promise.all(
            roles.map(async (item1) => {
              if (item1.facilityID == "0") {
                item.role = item1.Name;
              } else {
                item.role = roles[0]?.Name;
              }
            })
          );
        })
      );

      return res.json({
        success: true,
        message: "login Successfully!",
        userinfo: data1,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message:
          "Account not found. Please check your details, login with Platform Admin.",
        status: 400,
      });
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

////////////////new///////////
exports.addpackageBySuperadmin = async (req, res) => {
  try {
    const { package_id, expired_at, tenantID } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        tenantID: [Joi.string().empty().required()],
        package_id: [Joi.string().empty().required()],
        expired_at: [Joi.string().empty().required()],
      })
    );
    const result = schema.validate(req.body);

    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      let array = [];

      const user_id = req.user.user_id;

      let where = `where  tenantID = '${tenantID}'`;
      const packagesusers = await getSelectedColumn(
        "packages_users",
        where,
        "*"
      );

      if (packagesusers.length > 0) {
        let user = {
          package_id: package_id,
          user_id: user_id,
          expired_at: expired_at,
        };
        const packagesusers = await updatePackages(user, tenantID);
        if (packagesusers.affectedRows > 0) {
          return res.json({
            success: true,
            message: "Succesfully Added package",
            status: 200,
          });
        } else {
          return res.json({
            success: false,
            message: "Some problem occured while selecting packages",
            status: 400,
          });
        }
      } else {
        let user = {
          package_id: package_id,
          tenantID: tenantID,
          user_id: user_id,
          expired_at: expired_at,
        };
        const packagesusers = await Addpackages_user(user);

        if (packagesusers.affectedRows > 0) {
          return res.json({
            success: true,
            message: "Succesfully Added package",
            status: 200,
          });
        } else {
          return res.json({
            success: false,
            message: "Some problem occured while selecting packages",
            status: 400,
          });
        }
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

exports.Updatecountry = async (req, res) => {
  try {
    const { country_id, group_id } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        country_id: [Joi.string().empty().required()],
        group_id: [Joi.optional().allow("")],
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
      })
    } else {
      let array = [];

      let update = ` country_id ='${country_id}' `;
      let where = ` id ='${group_id}' `;
      let updatedata = await updateAllData("dbo.group", where, update);
      if (updatedata.affectedRows > 0) {
        return res.json({
          success: true,
          message: "SubGroup Updated Successfully!",
          categories: updatedata,
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

exports.AddSuperAdmin = async (req, res) => {
  try {
    const { email, password, companyName, username, firstname, lastname } = req.body;
    // let jsondata = JSON.parse(facilityID)
    // const convertedFacilitiyIDs = jsondata.map(Number);
    // const idsString = convertedFacilitiyIDs.join(', ');
    // var formattedFacilityIds = `${idsString}`;
    // console.log("sfd", formattedFacilityIds);

    const saltRounds = 10;
    const schema = Joi.alternatives(
      Joi.object({
        email: [
          Joi.string()
            .min(5)
            .max(255)
            .email({ tlds: { allow: false } })
            .lowercase()
            .required(),
        ],
        password: Joi.string().min(8).max(15).required().messages({
          "any.required": "{{#label}} is required!!",
          "string.empty": "can't be empty!!",
          "string.min": "minimum 8 value required",
          "string.max": "maximum 15 values allowed",
        }),
        firstname: [Joi.string().empty().required()],
        companyName: [Joi.string().empty().required()],
        lastname: [Joi.string().empty().required()],
        //  tenantId: [Joi.string().empty().required()],
        // roleID: [Joi.string().empty().required()],
        username: [Joi.string().empty().required()],
        // package_id: [Joi.string().empty().required()],
        // group_id: [Joi.string().optional().allow("")],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 400,
        success: false,
      })
    } else {
      let facilities = "";
      const data = await fetchEmailUser(email);
      if (data.length !== 0) {
        return res.json({
          success: false,
          message:
            "Already have account with this " + email + " email , Please Login",
          status: 400,
        });
      }

      let userNameRes = await fetchUserByUserName(username);
      if (userNameRes.length !== 0) {
        return res.json({
          success: false,
          message: "Already have account with this " + username + " username , Please Login",
          status: 400,
        });
      }
      // let groups_id = 0;
      // if (group_id == 'undefined') {
      //   groups_id = 0;
      // } else {
      //   groups_id = group_id;
      // }

      const hash = await bcrypt.hash(password, saltRounds);
      const user = {
        Id: generateRandomString(11),
        Email: email,
        passwordHash: hash,
        firstname: firstname,
        lastname: lastname,
        tenantID: 0,
        username: username
      };
      const create_user = await registerUser(user);

      if (create_user.affectedRows > 0) {
        // let is_super_admin = 0;
        // // if (roleID == "b34c0dbe-4730-4521-82dd-5d3de28bcea0") {
        // //   is_super_admin = 1
        // // } else {
        // //   is_super_admin = 0
        // // }
        var userId = create_user.insertId;
        let user3 = {
          Email: email,
          Password: password,
          tenantName: companyName,
          companyName: companyName,
          user_id: create_user.insertId,
          is_super_admin: 1,
          userName: username
        };
        const create_user2 = await Addtenants(user3);
        var tenantId = create_user2.insertId;
        const user2 = {
          userId: create_user.insertId,
          roleId: "b34c0dbe-4730-4521-82dd-5d3de28bcea0",
          tenantID: create_user2.insertId,
          facilityID: 0,
          tenant_id: create_user2.insertId,
          group_id: 0,
        };
        const create_user1 = await registeruserRoles(user2);
        const updateRes = await updateUserTenant(tenantId, userId);
        // const user5 = {
        //   package_id: package_id,
        //   user_id: create_user2.insertId,
        //   tenantID: tenantId,
        //   facility_id: facilityID,
        //   tenantID: create_user2.insertId,
        //   facilities_id: facilityID,
        //   group_id: groups_id ? groups_id : 0
        // }
        // const create_user3 = await registerPackage(user5);

        return res.json({
          success: true,
          message: "Your account has been successfully created!",
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "Some problem occured while adding user",
          status: 400,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Internal server error",
      status: 500,
      error: error,
    });
  }
};

// forgot password statrtedd

exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const findUser = await fetchEmail(email);
    if (findUser.length != 0) {
      const tokenGenerate = generateRandomString(10);
      await updateToken(tokenGenerate, findUser[0].Id);
      let token = tokenGenerate;

      const emailTemplatePath = path.resolve(__dirname, './view/forgetPasswordEmail.ejs');
      const reset_link = `${config.live_base_url}verify-token/${token}`
      const emailHtml = await ejs.renderFile(emailTemplatePath, { reset_link });

      const mailOptions = {
        from: 'ekobons@gmail.com',
        // replyTo: 'no-reply@gmail.com',
        to: email,
        subject: "Reset password",
        html: emailHtml
      };

      sendEmail(mailOptions)
        .then(info => {
          console.log(info);
          return res.json({
            success: true,
            message: "Your account has been successfully created!",
            status: 200,
          });
        })
        .catch(error => console.log(error));
    } else {
      return res.json({
        success: false,
        message: "Your account has been successfully created!",
        status: 200,
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Internal server error",
      status: 500,
      error: error,
    });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    const token = req.params.token;
    const result = await fetchByForgotToken(token);
    if (result.length != 0) {
      res.render(path.join(__dirname, "/view", "forgetPassword.ejs"), {
        msg: "This is msgg",
        token: token,
      });
    } else {
      res.send(`<div class="container">
                    <p> User not Registered with Eko Trace </p>
            </div>`);
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Internal server error",
      status: 500,
      error: error,
    });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { token, password, confirm_password } = req.body;
    if (password == confirm_password) {
      const result = await fetchByForgotToken(token);
      if (result.length != 0) {
        // Generate hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        let where1 = `where tenantID = ${result[0].Id} and email = '${result[0].Email}'`;
        let where2 = `where Id = ${result[0].Id} and Email = '${result[0].Email}'`;
        const Data1 = {
          passwordHash: hashedPassword,
        };
        const Data2 = {
          Password: password,
        };
        const changePasswordUsers = await updatePassword("`dbo.aspnetusers`", where1, Data1);
        const changePasswordTenants = await updatePassword("`dbo.tenants`", where2, Data2);

        console.log(changePasswordUsers);
        if (changePasswordUsers.affectedRows >= 0) {
          await updateToken(null, result[0].Id);
          return res.json({
            success: true,
            redirectUrl: "/success"  // redirect to the success page
          });
        } else {
          res.render(path.join(__dirname, "/view", "forgetPassword.ejs"), {
            msg: "Internal Error Occured, Please contact Support.",
          });
        }
      } else {
        res.render(path.join(__dirname, "/view", "forgetPassword.ejs"), {
          msg: "User is not registered with EkoTrace",
        });
      }
    } else {
      res.render(path.join(__dirname, "/../views", "forgetPassword.ejs"), {
        msg: "Password and Confirm Password do not match",
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Internal server error",
      status: 500,
      error: error,
    });
  }
};

// Abhishek Lodhi 25-02-2025

exports.getExcelSheet = async (req, res) => {
  try {
    const { facility_id, tenantID } = req.query;

    const schema = Joi.object({
      facility_id: Joi.number().required(),
      tenantID: Joi.number().required()
    });

    const result = schema.validate(req.query);
    if (result.error) {
      return res.status(400).json({
        message: result.error.details[0].message,
        status: 400,
        success: false,
      });
    }

    const findResult = await findFacilityWithCountryCode(facility_id);
    if (findResult.length === 0) return res.status(404).json({ error: true, message: "Facility not found", success: false });

    const findVendor = await findVendorByTenantId(tenantID);
    if (!findVendor) return res.status(404).json({ error: true, message: "Vendor not found", success: false });
    const modelValues = findVendor.map(val => val.name).join(",");
    const currencyCode = findResult[0].CurrencyCode;
    const unitDropdownValues = `Kg,Tonnes,Litres,${currencyCode}`;

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile("purchasedGoods.xlsx");
    const worksheet = workbook.getWorksheet(1);

    const unitColumnIndex = 6;
    const unitColumnIndex1 = 8;
    const lookupColumnIndex = 10;

    const hiddenSheet = workbook.addWorksheet('VendorListHidden');
    hiddenSheet.state = 'veryHidden';

    findVendor.forEach((vendor, index) => {
      hiddenSheet.getCell(`A${index + 1}`).value = vendor.name;
    });

    const range = `VendorListHidden!$A$1:$A$${findVendor.length}`;

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const unitCell = row.getCell(unitColumnIndex);
        const unitCell1 = row.getCell(unitColumnIndex1);
        const lookupCell = row.getCell(lookupColumnIndex);
        const dateCell = row.getCell(3);
        if (dateCell.value) {
          const dateValue = dateCell.value instanceof Date
            ? dateCell.value.toISOString().split("T")[0].split("-").reverse().join("-")
            : dateCell.text;

          dateCell.value = dateValue;
        }

        if (modelValues.length > 0) {
          unitCell1.dataValidation = {
            type: "list",
            allowBlank: false,
            formulae: [`=${range}`],
            showErrorMessage: true,
            errorTitle: "Invalid Entry",
            error: "Please select a valid vendor.",
          };
        }

        unitCell.dataValidation = {
          type: "list",
          allowBlank: false,
          formulae: [`"${unitDropdownValues}"`],
          showErrorMessage: true,
          errorTitle: "Invalid Entry",
          error: "Please select a valid unit.",
        };

        lookupCell.value = {
          formula: `IF(F${rowNumber}<>"", "Kg CO2e/" & F${rowNumber}, "")`,
        };
      }
    });

    const updatedFilePath = "updated_purchasedGoods.xlsx";
    await workbook.xlsx.writeFile(updatedFilePath);

    res.download(updatedFilePath, "updated_purchasedGoods.xlsx", (err) => {
      if (err) {
        console.error("Error while downloading file:", err);
        return res.status(500).json({ error: true, message: "File download error", success: false });
      }
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Internal Server Error " + error.message, success: false });
  }
};

exports.getPurchaseCategoriesEf = async (req, res) => {
  try {
    const { product, country_code, year } = req.body;

    const schema = Joi.object({
      product: Joi.string().required(),
      country_code: Joi.string().required(),
      year: Joi.string().required(),
    });

    const result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        message: result.error.details[0].message,
        status: 400,
        success: false,
      });
    }

    let productfalse;
    try {
      productArray = JSON.parse(product);
    } catch (parseError) {
      return res.status(400).json({
        message: "Invalid JSON format in product",
        status: 400,
        success: false,
      });
    }

    productArray = await Promise.all(
      productArray.map(async (product) => {
        const productResult = await getPurchaseCategoriesEf(product['Product Description'], country_code, year);
        if (productResult?.length) {
          const {
            Fiscal_Year, EFkgC02e_kg, EFkgC02e_ccy, EFkgC02e_tonnes,
            EFkgC02e_litres, reference, ...filteredResult
          } = productResult[0];
          return { ...product, productResult: filteredResult, is_find: true };
        }

        return {
          ...product,
          productResult: {
            id: "",
            typeofpurchase: "",
            product_code_id: "",
            created_at: "",
            category: "",
            sub_category: "",
            product: "",
            HSN_code: "",
            NAIC_code: "",
            ISIC_code: "",
            country_id: "",
            typesofpurchasename: "",
            other_category_flag: ""
          },
          is_find: false,
        };
      })
    );

    return res.status(200).json({
      error: false,
      success: true,
      message: "Products processed successfully",
      data: productArray,
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Internal Servrer Error " + error.message, success: false });
  }
};

exports.getAllPurchaseCategoriesEf = async (req, res) => {
  try {

    const { country_code, year } = req.body;

    const schema = Joi.object({
      country_code: Joi.string().required(),
      year: Joi.string().required(),
    });

    const result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        message: result.error.details[0].message,
        status: 400,
        success: false,
      });
    }

    const getAllPurchaseResult = await getAllPurchaseCategoriesEf(country_code, year);

    return res.status(200).json({
      error: false,
      message: getAllPurchaseResult.length > 0
        ? "Fetched all purchase categories ef"
        : "No purchase categories found",
      success: getAllPurchaseResult.length > 0,
      data: getAllPurchaseResult.length > 0 ? getAllPurchaseResult : []
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Internal Server Error " + error.message, success: false });
  }
};

exports.addVehicleFeet = async (req, res) => {
  try {
    const { facility_id, category, vehicleJson } = req.body;

    const schema = Joi.object({
      facility_id: Joi.string().required(),
      category: Joi.string().required(),
      vehicleJson: Joi.string().required()
    });

    const result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        message: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const user_id = req.user.user_id

      const vehicles = JSON.parse(vehicleJson);

      let failedVehicles = [];
      let successCount = 0;

      const countryResponse = await country_check(facility_id);
      if (!countryResponse.length) {
        return res.status(400).json({ error: true, message: "Invalid Facility ID", success: false });
      }

      for (const val of vehicles) {
        const findCompanyOwnedVehicleResponse = await findCompanyOwnedVehicleByItemType(
          val.vehicle_type,
          countryResponse[0].CountryId
        );

        if (findCompanyOwnedVehicleResponse.length === 0) {
          failedVehicles.push({ vehicle_model: val.vehicle_model, reason: "No matching company-owned vehicle found" });
          continue;
        }

        const vehicleData = {
          facility_id,
          category,
          vehicle_model: val.vehicle_model,
          fuel_type: val.fuel_type,
          type_engine: val.type_engine == '' ? null : val.type_engine,
          company_owned_vehicle_id: findCompanyOwnedVehicleResponse[0].ID,
          charging_outside: val.charging_outside == '' ? null : val.charging_outside,
          quantity: val.quantity == '' ? null : val.quantity,
          acquisition_date: val.acquisition_date,
          retire_vehicle: val.retire_vehicle,
          user_id,
        };

        const addVechileFeetResponse = await addVechileFeet(vehicleData);

        if (addVechileFeetResponse.affectedRows == 0) {
          failedVehicles.push({ vehicle_model: val.vehicle_model, reason: "Failed to add vehicle fleet" });
        } else {
          successCount++;
        }
      }

      return res.status(201).json({
        error: failedVehicles.length > 0,
        message: `Successfully add vehicle fleet`,
        success: successCount > 0,
        failedVehicles,
      });
    }
  } catch (error) {
    return res.status(500).json({ error: true, message: "Internal Servre Error " + error.message, success: false })
  }
};

exports.updateVehicleFeet = async (req, res) => {
  try {
    const { facility_id, category, vehicleJson } = req.body;

    const schema = Joi.object({
      facility_id: Joi.string().required(),
      category: Joi.string().required(),
      vehicleJson: Joi.string().required()
    });

    const result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        message: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const user_id = req.user.user_id

      const vehicles = JSON.parse(vehicleJson);

      let failedVehicles = [];
      let successCount = 0;

      const countryResponse = await country_check(facility_id);
      if (!countryResponse.length) {
        return res.status(400).json({ error: true, message: "Invalid Facility ID", success: false });
      }

      await deleteVehicleFleetByFacilityId(facility_id, category)

      for (const val of vehicles) {
        const findCompanyOwnedVehicleResponse = await findCompanyOwnedVehicleByItemType(
          val.vehicle_type,
          countryResponse[0].CountryId
        );

        if (findCompanyOwnedVehicleResponse.length === 0) {
          failedVehicles.push({ vehicle_model: val.vehicle_model, reason: "No matching company-owned vehicle found" });
          continue;
        }

        const vehicleData = {
          facility_id,
          category,
          vehicle_model: val.vehicle_model,
          fuel_type: val.fuel_type,
          type_engine: val.type_engine == '' ? null : val.type_engine,
          company_owned_vehicle_id: findCompanyOwnedVehicleResponse[0].ID,
          charging_outside: val.charging_outside == '' ? null : val.charging_outside,
          quantity: val.quantity == '' ? null : val.quantity,
          acquisition_date: val.acquisition_date,
          retire_vehicle: val.retire_vehicle,
          user_id,
        };

        const addVechileFeetResponse = await addVechileFeet(vehicleData);

        if (addVechileFeetResponse.affectedRows == 0) {
          failedVehicles.push({ vehicle_model: val.vehicle_model, reason: "Failed to update vehicle fleet" });
        } else {
          successCount++;
        }
      }

      return res.status(201).json({
        error: failedVehicles.length > 0,
        message: `Successfully update vehicle fleet`,
        success: successCount > 0,
        failedVehicles,
      });
    }
  } catch (error) {
    return res.status(500).json({ error: true, message: "Internal Servre Error " + error.message, success: false })
  }
};

exports.updateVehicleFeetById = async (req, res) => {
  try {
    const { id, facility_id, category, vehicle_model, vehicle_type, fuel_type, type_engine, charging_outside, quantity, acquisition_date, retire_vehicle } = req.body;

    const schema = Joi.object({
      id: Joi.number().required(),
      facility_id: Joi.string().required(),
      category: Joi.string().required(),
      vehicle_model: Joi.string().required(),
      vehicle_type: Joi.string().required(),
      fuel_type: Joi.string().required(),
      type_engine: Joi.string().allow(null, ""),
      charging_outside: Joi.string().allow(null, ""),
      quantity: Joi.string().allow(null, ""),
      acquisition_date: Joi.string().required(),
      retire_vehicle: Joi.string().required()
    });

    const result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        message: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const user_id = req.user.user_id

      const countryResponse = await country_check(facility_id);
      if (!countryResponse.length) return res.status(400).json({ error: true, message: "Invalid Facility ID", success: false });

      const findCompanyOwnedVehicleResponse = await findCompanyOwnedVehicleByItemType(vehicle_type,
        countryResponse[0].CountryId);

      if (!findCompanyOwnedVehicleResponse.length) return res.status(400).json({ error: true, message: "No matching company-owned vehicle found ", success: false })

      const vehicleData = {
        facility_id,
        category,
        vehicle_model: vehicle_model,
        fuel_type: fuel_type,
        type_engine: type_engine == '' ? null : type_engine,
        company_owned_vehicle_id: findCompanyOwnedVehicleResponse[0].ID,
        charging_outside: charging_outside == '' ? null : charging_outside,
        quantity: quantity == '' ? null : quantity,
        acquisition_date: acquisition_date,
        retire_vehicle: retire_vehicle,
        user_id,
      };

      const updateVehicleFeetResponse = await updateVechileFeet(vehicleData, id);

      return res.status(200).json({
        error: updateVehicleFeetResponse.affectedRows === 0,
        message: "Successfully updated vehicle fleet",
        success: updateVehicleFeetResponse.affectedRows > 0
      });
    }
  } catch (error) {
    return res.status(500).json({ error: true, message: "Internal Servre Error " + error.message, success: false })
  }
};

exports.getVehicleFleetByFacilityId = async (req, res) => {
  try {
    const { facility_id } = req.body;

    const schema = Joi.object({
      facility_id: Joi.string().required()
    });

    const result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        message: result.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      const getFacilityResponse = await getVehicleFleetByFacilityId(facility_id);
      if (getFacilityResponse.length) {
        return res.status(200).json({
          error: false,
          message: "Vehicle fleet retrieved successfully",
          success: true,
          data: getFacilityResponse,
        });
      } else {
        return res.status(200).json({
          error: true,
          message: "No vehicle fleet found for the given facility ID",
          success: false,
        });
      }
    }
  } catch (error) {
    return res.status(500).json({ error: true, message: "Internal Servre Error " + error.message, success: false })
  }
};

exports.downloadExcelVehicleFleetByFacilityId = async (req, res) => {
  try {
    const { facility_id } = req.query;

    const schema = Joi.object({
      facility_id: Joi.number().required(),
    });

    const result = schema.validate(req.query);
    if (result.error) {
      return res.status(400).json({
        message: result.error.details[0].message,
        status: 400,
        success: false,
      });
    }

    const getFacilityResponse = await getVehicleFleetByFacilityId(facility_id);
    const unitDropdownValues = getFacilityResponse.filter(val => val.retire_vehicle == 0).map(val => val.vehicle_model).join(",");

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile("vehicleFleet.xlsx");
    const worksheet = workbook.getWorksheet('Passenger Vehicles - Data Entry');
    const unitColumnIndex = 2;

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const unitCell = row.getCell(unitColumnIndex);
        const dateCell = row.getCell(3);
        if (dateCell.value) {
          const dateValue = dateCell.value instanceof Date
            ? dateCell.value.toISOString().split("T")[0].split("-").reverse().join("-")
            : dateCell.text;

          dateCell.value = dateValue;
        }

        unitCell.dataValidation = {
          type: "list",
          allowBlank: false,
          formulae: [`"${unitDropdownValues}"`],
          showErrorMessage: true,
          errorTitle: "Invalid Entry",
          error: "Please select a valid unit.",
        };
      }
    });

    const updatedFilePath = "updated_vehicleFleet.xlsx";
    await workbook.xlsx.writeFile(updatedFilePath);

    res.download(updatedFilePath, "updated_vehicleFleet.xlsx", (err) => {
      if (err) {
        console.error("Error while downloading file:", err);
        return res.status(500).json({ error: true, message: "File download error", success: false });
      }
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Internal Server Error " + error.message, success: false });
  }
};

exports.downloadExcelVehicleFleetByFacilityCategoryId = async (req, res) => {
  try {
    const { facility_id, categoryID } = req.query;

    const schema = Joi.object({
      facility_id: Joi.number().required(),
      categoryID: Joi.number().required(),
    });

    const result = schema.validate(req.query);
    if (result.error) {
      return res.status(400).json({
        message: result.error.details[0].message,
        status: 400,
        success: false,
      });
    }

    const getFacilityResponse = await getVehicleFleetByFacilityCategoryId(facility_id, categoryID);

    const modelValues = getFacilityResponse.filter(val => val.retire_vehicle == 0).map(val => val.vehicle_model).join(",");

    const currencyResponse = await findFacilityWithCountryCode(facility_id); (facility_id);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile("vehiclede.xlsx");
    const worksheet = workbook.getWorksheet("Template");

    if (!worksheet) {
      return res.status(500).json({
        error: true,
        message: 'Worksheet "Template" not found in Excel file',
        success: false,
      });
    }

    const unitColumnIndex = 2;
    const unitColumnIndex1 = 3;
    const unitColumnIndex2 = 5;

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const unitCell = row.getCell(unitColumnIndex);
        const unitCell1 = row.getCell(unitColumnIndex1);
        const unitCell2 = row.getCell(unitColumnIndex2);
        const dateCell = row.getCell(3);

        if (dateCell.value) {
          const dateValue = dateCell.value instanceof Date
            ? dateCell.value.toISOString().split("T")[0].split("-").reverse().join("-")
            : dateCell.text;

          dateCell.value = dateValue;
        }

        if (modelValues.length > 0) {
          unitCell.dataValidation = {
            type: "list",
            allowBlank: false,
            formulae: [`"${modelValues}"`],
            showErrorMessage: true,
            errorTitle: "Invalid Entry",
            error: "Please select a valid unit.",
          };
        }

        unitCell1.dataValidation = {
          type: "list",
          allowBlank: false,
          formulae: [`"Total distance travelled,Total fuel burnt,Total amount spent"`],
          showErrorMessage: true,
          errorTitle: "Invalid Entry",
          error: "Please select a valid option.",
        };

        unitCell2.value = {
          formula: `IF(ISNUMBER(MATCH(${unitCell1.address}, {"Total distance travelled","Total fuel burnt","Total amount spent"}, 0)), CHOOSE(MATCH(${unitCell1.address}, {"Total distance travelled","Total fuel burnt","Total amount spent"}, 0), "Km", "Litres", "${currencyResponse[0].CurrencyCode}"), "")`
        };
      }
    });

    let updatedFilePath = categoryID == 1 ? "passenger_vehicles.xlsx" : "delivery_vehicles.xlsx";
    await workbook.xlsx.writeFile(updatedFilePath);

    res.download(updatedFilePath, updatedFilePath, (err) => {
      if (err) {
        console.error("Error while downloading file:", err);
        return res.status(500).json({ error: true, message: "File download error", success: false });
      }
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Internal Server Error " + error.message, success: false });
  }
};

exports.addPurchaseGoodsMatchUnmatch = async (req, res) => {
  try {
    const { filename, user_id, facility_id, jsonData } = req.body;

    const schema = Joi.object({
      filename: Joi.string().required().allow(null),
      user_id: Joi.string().required(),
      facility_id: Joi.string().required(),
      jsonData: Joi.string().required()
    });

    const result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        message: result.error.details[0].message,
        status: 400,
        success: false,
      });
    }

    const jsonConvertParse = JSON.parse(jsonData);
    const data = {
      filename: (!filename || filename === 'null' || filename === 'undefined') ? null : filename,
      user_id: user_id,
      facility_id: facility_id,
      no_of_rows: jsonConvertParse.length
    }
    const addPurchaseGoodsPayloads = await insertPurchaseGoodsPayloads(data);
    if (addPurchaseGoodsPayloads.insertId > 0) {
      for (const item of jsonConvertParse) {
        try {
          if (item.is_find === true) {
            delete item.month;
            delete item.typeofpurchase;
            delete item.vendorunit;
            delete item.is_find;
            item.user_id = user_id;
            item.purchase_payload_id = addPurchaseGoodsPayloads.insertId;
            await insertPurchaseGoodsMatched(item);
          } else {
            console.log(true);

            delete item.month;
            delete item.typeofpurchase;
            delete item.vendorunit;
            delete item.is_find;
            item.user_id = user_id;
            item.purchase_payload_id = addPurchaseGoodsPayloads.insertId;
            await insertPurchaseGoodsUnmatched(item);
          }
        } catch (innerErr) {
          console.error("Error inserting item:", innerErr.message);
        }
      }

      return res.status(201).json({
        error: false,
        message: "Data added with AI.",
        success: true
      });
    } else {
      return res.status(500).json({
        error: true,
        message: "Failed to insert purchase goods payload.",
        success: false
      });
    }
  } catch (error) {
    return res.status(500).json({ error: true, message: "Internal server error " + error.message, success: false });
  }
};

exports.getPurchaseGoodsByUserAndFacilityId = async (req, res) => {
  try {
    const { userId, facilityID } = req.body;

    const schema = Joi.object({
      userId: Joi.number().required(),
      facilityID: Joi.number().required(),
    });

    const result = schema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        message: result.error.details[0].message,
        status: 400,
        success: false,
      });
    }

    const getPurchaseGoodsPayloads = await getPurchaseGoodsPayloadsByUserAndFacilityId(userId, facilityID);
    if (getPurchaseGoodsPayloads.length > 0) {
      return res.status(200).json({ error: false, message: "Purchase goods payloads fetched successfully.", success: true, data: getPurchaseGoodsPayloads });
    } else {
      return res.status(200).json({ error: true, message: "No data found.", success: false, data: [] });
    }
  } catch (error) {
    return res.status(500).json({ error: true, message: "Internal server error " + error.message, success: false });
  }
};

exports.getPurchaseGoodsMatchedDataUsingPayloadId = async (req, res) => {
  try {
    const { purchase_payload_id, status, page = 1, limit = 100 } = req.body;

    const schema = Joi.object({
      purchase_payload_id: Joi.number().required(),
      status: Joi.string().optional().allow("", null),
      page: Joi.number().min(1).optional(),
      limit: Joi.number().min(1).optional()
    });

    const result = schema.validate({ purchase_payload_id, status, page, limit });
    if (result.error) {
      return res.status(400).json({
        message: result.error.details[0].message,
        status: 400,
        success: false,
      });
    }

    let purchaseGoodMatched = [];
    let total = 0;

    if (status) {
      // ✅ Paginated and filtered by status = 1
      const { data, totalCount } = await purchase_goods_matched_items_ai_by_payload_id_and_status_paginated(
        purchase_payload_id,
        status,
        page,
        limit
      );
      purchaseGoodMatched = data;
      total = totalCount;
    } else {
      
      // ✅ No filtering or pagination — fetch all
      const { data, totalCount }= await purchase_goods_matched_items_ai_by_payload_id_and_status_paginated(purchase_payload_id,null, page, limit);
      purchaseGoodMatched = data;
      total = totalCount;
    }

    if (purchaseGoodMatched.length > 0) {
      const matchedWithCategories = await Promise.all(
        purchaseGoodMatched.map(async (val, index) => {
          const [productResult] = await purchase_goods_categories_ef_by_match_productCategory_Id(val.match_productCategory_Id);
          const data = {
            "S. No.": (status === 1 ? (page - 1) * limit : 0) + index + 1,
            "id": val.id,
            "Product Category": val.product_category,
            "Product Description": val.product_description,
            "Purchase Date": val.purchase_date,
            "Value / Quantity": val.value,
            "Unit": val.unit,
            "Vendor": val.vendor_name,
            "Vendor Specific EF": val.vendor_ef,
            "Vendor Specific Unit": "",
            "KG": "",
            "kg CO2e / kg": ""
          };
          return { ...data, productResult, is_find: val.status === 1 ? true : false };
        })
      );

      return res.status(200).json({
        success: true,
        message: "Matched data fetched successfully",
        data: matchedWithCategories,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        
      });
    } else {
      return res.status(200).json({
        success: false,
        message: `No ${status === 1 ? "matched" : "unmatched"} data found`,
        data: [],
        ...(status === 1 && {
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0
          }
        })
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: true,
      message: "Internal server error: " + error.message,
      success: false
    });
  }
};
exports.updatePurchaseGoodsMAtchId = async (req, res) => {
  try {
    const { id, matchedId,matchProductName  } = req.body;

    const schema = Joi.object({
      id: Joi.string().required(),
      matchedId: Joi.string().required(),
      matchProductName: Joi.string().required()
    });

    const result = schema.validate({ id, matchedId,matchProductName  });
    if (result.error) {
      return res.status(400).json({
        message: result.error.details[0].message,
        status: 400,
        success: false,
      });
    }

    let purchaseGoodMatched = {
      match_productCategory_Id: matchedId,
      product_name: matchProductName,
      status: 1
    };

    let where = ` where id = '${id}'`;
    const updatevendor = await updateData(`purchase_goods_matched_items_ai`, where, purchaseGoodMatched);
    return res.status(200).json({
      success: true,
      message: "Matched data updated successfully",
      data: updatevendor,
    });
 

  
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: true,
      message: "Internal server error: " + error.message,
      success: false
    });
  }
};

