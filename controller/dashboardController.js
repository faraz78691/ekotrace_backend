const Joi = require("joi");
const moment = require("moment");
const config = require("../config");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const {
  Allfireextinguisher,
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
  water_supply_treatment_categoryDetailsemission,
  upstream_vehicle_storage_emissions,
  downstream_vehicle_storage_emissions,
  franchise_categories_emissionDetails,
  waste_generated_emissionsDetailsEmssionByMethod,
  waste_generated_emissionsDetailsEmssionByMethodemission,
  waste_generated_emissionsDetailsEmssionByloop,
  waste_generated_emissionsDetailsEmssion_new,
  getAllelectricityDetailByCat,
  getAllelectricityDetail,
  purchaseGoodsBySupplier,
  getCombustionEmissionDetail,
  water_supply_treatment_graph,
  flight_travelDetailsByemssion,
  waste_generated_emissionsDetailsEmssion,
  investmentAllEmissionsFinance,
  hotel_stayDetailsemssion,
  other_modes_of_transportDetailsemssion,
  offsetemission,
  actionsEmission,
  waste_generated_emissions_by_hazardous,
  waste_generated_emissions_by_non_hazadrous,
  costcenterData_emission,
  emssionBycostcenter,
  investmentEmissionsFinance,
  getCombustionEmissionDetailFixed,
  getscope1CombustionEmissionDetail, topFiveWasteEmissions
} = require("../models/dashboard");
const {
  getSelectedColumn,
  getData,
  getAllFacilites,
  getGroupIdByTenant,
} = require("../models/common");

exports.dashboardScope = async (req, res) => {
  try {
    const { facilities, year } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facilities: [Joi.string().empty().required()],
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

      let finalyear = "";
      let finalyeardata = "2";
      let where = ` where user_id = '${user_id}'`;
      const financialyear = await getSelectedColumn(
        "financial_year_setting",
        where,
        "*"
      );
      if (financialyear.length > 0) {
        let final_year = financialyear[0].financial_year;
        if (final_year == "2") {
          /*finalyear = [
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
            "Jan",
            "Feb",
            "Mar",
          ];*/
          finalyear = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          finalyeardata = "2";
        } else {
          finalyear = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          finalyeardata = "1";
        }
      } else {
        finalyear = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        finalyeardata = "2";
      }

      let month = finalyear;
      let monthlyData = {};
      let monthlyData1 = {};
      let monthlyData2 = {};
      month.forEach((month) => {
        monthlyData[month] = 0;
        monthlyData1[month] = 0;
        monthlyData2[month] = 0;
      });

      let array1 = [];
      let array2 = [];
      let array3 = [];
      let scope1month = [];
      let scope1 = [];
      let scope2month = [];
      let scope3month = [];
      let scope2 = [];
      let scope3 = [];

      let categorydata,
        categorydata2,
        categorydata3,
        categorydata4,
        categorydata5,
        categorydata6,
        categorydata7,
        categorydata8,
        categorydata9,
        categorydata10,
        categorydata11,
        categorydata12,
        categorydata13,
        categorydata14,
        categorydata15,
        categorydata16,
        categorydata17,
        categorydata18,
        categorydata19,
        categorydata20,
        categorydata21 = "";
      let sum = 0;
      let sum1 = 0;
      let sum2 = 0;
      if (facilities) {
        let facilitiesdata = "";
        if (facilities != "0") {
          facilitiesdata = facilities.replace(/\[|\]/g, "");
        } else {
          facilitiesdata = "0";
        }

        categorydata = await getCombustionEmission(facilitiesdata, year, finalyeardata);

        categorydata2 = await Allrefrigerants(facilitiesdata, year, finalyeardata);
        categorydata3 = await Allfireextinguisher(
          facilitiesdata,
          year,
          finalyeardata
        );
        categorydata4 = await getAllcompanyownedvehicles(
          facilitiesdata,
          year,
          finalyeardata
        );
        array1 = [
          ...categorydata,
          ...categorydata2,
          ...categorydata3,
          ...categorydata4,
        ];
        if (array1) {
          await Promise.all(
            array1.map(async (item) => {
              // if (item.month_number && monthlyData.hasOwnProperty(item.month_number)) {
              //      sum  += parseFloat(item.emission)
              //      monthlyData[item.month_number] += parseFloat(item.emission); // Add emission value to the corresponding month
              // }

              if (
                item.month_number &&
                monthlyData.hasOwnProperty(item.month_number)
              ) {
                monthlyData[item.month_number] += parseFloat(item.emission);
                let emissionFixed = parseFloat(item.emission);
                sum += emissionFixed;
                // Add emission value to the corresponding month
              }
            })
          );
          scope1month.push(Object.keys(monthlyData));
          scope1.push(
            Object.values(monthlyData).map((num) =>
              parseFloat(num / 1000).toFixed(3)
            )
          );
        }

        categorydata5 = await getAllelectricity(
          facilitiesdata,
          year,
          finalyeardata
        );
        categorydata6 = await getAllheatandsteam(
          facilitiesdata,
          year,
          finalyeardata
        );
        array2 = [...categorydata5, ...categorydata6];
        if (array2) {
          await Promise.all(
            array2.map(async (item) => {
              if (
                item.month_number &&
                monthlyData1.hasOwnProperty(item.month_number)
              ) {
                monthlyData1[item.month_number] += parseFloat(item.emission);
                let emissionFixed = parseFloat(item.emission);
                sum1 += emissionFixed;
                // Add emission value to the corresponding month
              }
            })
          );
          scope2month.push(Object.keys(monthlyData1));
          scope2.push(
            Object.values(monthlyData1).map((num) =>
              parseFloat(num / 1000).toFixed(3)
            )
          );
        }

        categorydata7 = await purchaseGoodsDetails(
          facilitiesdata,
          year,
          finalyeardata
        );
        categorydata8 = await flight_travelDetails(
          facilitiesdata,
          year,
          finalyeardata
        );
        let hotelstayDetails = await hotel_stayDetails(
          facilitiesdata,
          year,
          finalyeardata
        );
        let othermodes_of_transportDetails =
          await other_modes_of_transportDetails(
            facilitiesdata,
            year,
            finalyeardata
          );

        categorydata9 = await processing_of_sold_products_categoryDetails(
          facilitiesdata,
          year,
          finalyeardata
        );
        categorydata10 = await sold_product_categoryDetails(
          facilitiesdata,
          year,
          finalyeardata
        );
        categorydata11 = await endoflife_waste_typeDetails(
          facilitiesdata,
          year,
          finalyeardata
        );
        categorydata12 = await water_supply_treatment_categoryDetails(
          facilitiesdata,
          year,
          finalyeardata
        );

        categorydata13 = await employee_commuting_categoryDetails(
          facilitiesdata,
          year,
          finalyeardata
        );
        categorydata14 = await homeoffice_categoryDetails(
          facilitiesdata,
          year,
          finalyeardata
        );
        categorydata15 = await waste_generated_emissionsDetails(
          facilitiesdata,
          year,
          finalyeardata
        );

        categorydata16 = await upstreamLease_emissionDetails(
          facilitiesdata,
          year,
          finalyeardata
        );
        categorydata17 = await downstreamLease_emissionDetails(
          facilitiesdata,
          year,
          finalyeardata
        );
        categorydata18 = await franchise_categories_emissionDetails(
          facilitiesdata,
          year,
          finalyeardata
        );
        categorydata19 = await investment_emissionsDetails(
          facilitiesdata,
          year,
          finalyeardata
        );

        categorydata20 = await upstream_vehicle_storage_emissions(
          facilitiesdata,
          year,
          finalyeardata
        );
        categorydata21 = await downstream_vehicle_storage_emissions(
          facilitiesdata,
          year,
          finalyeardata
        );

        array3 = [
          ...categorydata7,
          ...categorydata8,
          ...hotelstayDetails,
          ...othermodes_of_transportDetails,
          ...categorydata9,
          ...categorydata10,
          ...categorydata11,
          ...categorydata11,
          ...categorydata12,
          ...categorydata13,
          ...categorydata14,
          ...categorydata15,
          ...categorydata16,
          ...categorydata17,
          ...categorydata18,
          ...categorydata19,
          ...categorydata20,
          ...categorydata21,
        ];

        if (array3) {
          await Promise.all(
            array3.map(async (item) => {
              const emission = parseFloat(item.emission) || 0;
              if (item.category === "Employee Commuting" || item.category === "Home Office") {
                const portion = emission / 12;

                for (const key of Object.keys(monthlyData2)) {
                  monthlyData2[key] += portion;
                }
              } else {
                if (item.month_number && monthlyData1.hasOwnProperty(item.month_number)) {
                  monthlyData2[item.month_number] += emission;
                }
              }
              sum2 += emission;
            })
          );

          if (categorydata.length > 0) {
            for (item of categorydata) {
              if (
                item.month_number &&
                monthlyData2.hasOwnProperty(item.month_number)
              ) {
                monthlyData2[item.month_number] += parseFloat(
                  item?.scope3_emission ? item?.scope3_emission : 0
                );
                let emissionFixed = parseFloat(
                  item?.scope3_emission ? item?.scope3_emission : 0
                );
                sum2 += emissionFixed;
                // Add emission value to the corresponding month
              }
            }
          }

          if (categorydata5.length > 0) {
            for (item of categorydata5) {
              if (
                item.month_number &&
                monthlyData2.hasOwnProperty(item.month_number)
              ) {
                monthlyData2[item.month_number] += parseFloat(
                  item?.scope3_emission ? item?.scope3_emission : 0
                );
                let emissionFixed = parseFloat(
                  item?.scope3_emission ? item?.scope3_emission : 0
                );
                sum2 += emissionFixed;
                // Add emission value to the corresponding month
              }
            }
          }

          if (categorydata6.length > 0) {
            for (item of categorydata6) {
              if (
                item.month_number &&
                monthlyData2.hasOwnProperty(item.month_number)
              ) {
                monthlyData2[item.month_number] += parseFloat(
                  item?.scope3_emission ? item?.scope3_emission : 0
                );
                let emissionFixed = parseFloat(
                  item?.scope3_emission ? item?.scope3_emission : 0
                );
                sum2 += emissionFixed;
                // Add emission value to the corresponding month
              }
            }
          }
          scope3month.push(Object.keys(monthlyData2));
          scope3.push(
            Object.values(monthlyData2).map((num) =>
              parseFloat(num / 1000).toFixed(3)
            )
          );
        }
        // if (scope1.length == 0) {
        //   scope1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // }
        let series = [
          { name: "Scope 1", data: scope1[0] },
          { name: "Scope 2", data: scope2[0] },
          { name: "Scope 3", data: scope3[0] },
        ];
        let sumtotal1 = sum ? parseFloat(sum / 1000).toFixed(3) : 0;
        let sumtotal2 = sum1 ? parseFloat(sum1 / 1000).toFixed(3) : 0;
        let sumtotal3 = sum2 ? parseFloat(sum2 / 1000).toFixed(3) : 0;
        return res.json({
          success: true,
          message: "Succesfully fetched category",
          scope1: sumtotal1,
          scope2: sumtotal2,
          scope3: sumtotal3,
          series: series,
          series_graph: [
            parseFloat(sumtotal1),
            parseFloat(sumtotal2),
            parseFloat(sumtotal3),
          ],
          month: month,
          status: 200,
        });
      }

      // if (sum && sum1 && sum2) {

      // } else {
      // return res.json({
      //     success: false,
      //     message: "data not found!",
      //     status: 200,
      // });
      // }
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

// exports.dashboardScope = async (req, res) => {
//   try {

//     const {facilities,year} = req.body;
//     const schema = Joi.alternatives(
//     Joi.object({
//       facilities:[Joi.string().empty().required()],
//       year:[Joi.string().empty().required()],
//     })
//     );
//     const result = schema.validate(req.body);
//     if (result.error) {
//     const message = result.error.details.map((i) => i.message).join(",");
//     return res.json({
//         message: result.error.details[0].message,
//         error: message,
//         missingParams: result.error.details[0].message,
//         status: 200,
//         success: false,
//     });
//     }else{
//       let month = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
//       let monthlyData = {};
//       let monthlyData1 = {};
//       let monthlyData2 = {};
//        month.forEach(month => {
//        monthlyData[month] = 0;
//        monthlyData1[month] = 0; // Initialize all months with emission of 0
//        monthlyData2[month] = 0;
//       });
//       let array = [];
//       let array1 = [];
//       let array2 = [];
//       let array3 = [];
//       let scope1month =[];
//       let scope1 = [];
//       let scope2month = [];
//       let scope3month = [];
//       let scope2 = [];
//       let scope3 = [];
//       const authHeader = req.headers.auth;
//       const jwtToken = authHeader.replace("Bearer ", "");
//       const decoded = jwt.decode(jwtToken);
//       const user_id = decoded.user_id;
//       let  categorydata ,categorydata2,categorydata3,categorydata4,categorydata5,categorydata6,
//       categorydata7,categorydata8,categorydata9,categorydata10,categorydata11,categorydata12,categorydata13,
//       categorydata14,categorydata15,categorydata16,categorydata17,categorydata18,categorydata19,categorydata20,categorydata21 = "";
//       let sum =0
//       let sum1 = 0;
//       let sum2 = 0;
//       if(facilities){
//         let  facilitiesdata = "";
//         if(facilities != "0"){
//           facilitiesdata =  facilities.replace(/\[|\]/g, '')
//         }else{
//           facilitiesdata = "0"

//         }

//           categorydata = await getCombustionEmission(facilitiesdata,year)
//           categorydata2 = await Allrefrigerants(facilitiesdata,year)
//           categorydata3  =  await Allfireextinguisher(facilitiesdata,year)
//           categorydata4  =  await getAllcompanyownedvehicles(facilitiesdata,year)
//           array1 =   [ ...categorydata,...categorydata2,...categorydata3,...categorydata4];
//           if(array1.length > 0){
//             await Promise.all(
//               array1.map(async (item) => {
//                   if (item.month_number && monthlyData.hasOwnProperty(item.month_number)) {
//                        sum  += parseFloat(item.emission)
//                        monthlyData[item.month_number] += parseFloat(item.emission); // Add emission value to the corresponding month
//                   }
//               }));

//                scope1month.push(Object.keys(monthlyData));
//                scope1.push(Object.values(monthlyData).map(num => parseFloat(num.toFixed(1))));
//           }
//           categorydata5  =  await getAllelectricity(facilitiesdata,year)
//           categorydata6  =  await getAllheatandsteam(facilitiesdata,year)
//           array2 =   [ ...categorydata5,...categorydata6];
//           if(array2){
//             await Promise.all(
//               array2.map(async (item) => {
//                 if (item.month_number && monthlyData1.hasOwnProperty(item.month_number)) {
//                   monthlyData1[item.month_number] += parseFloat(item.emission);
//                   let emissionFixed = parseFloat(item.emission);
//                      sum1  += emissionFixed
//                    // Add emission value to the corresponding month
//                 }
//               }));
//               scope2month.push(Object.keys(monthlyData1));
//               scope2.push(Object.values(monthlyData1).map(num => parseFloat(num.toFixed(1))));

//           }
//            categorydata7  =  await purchaseGoodsDetails(facilitiesdata,year)
//            categorydata8  =  await flight_travelDetails(facilitiesdata,year)
//            let hotelstayDetails = await hotel_stayDetails(facilitiesdata,year);
//            let othermodes_of_transportDetails = await other_modes_of_transportDetails(facilitiesdata,year);

//           categorydata9 =  await processing_of_sold_products_categoryDetails(facilitiesdata,year)
//           categorydata10 =  await sold_product_categoryDetails(facilitiesdata,year)
//           categorydata11  =  await endoflife_waste_typeDetails(facilitiesdata,year)
//           categorydata12  =  await water_supply_treatment_categoryDetails(facilitiesdata,year)

//           categorydata13  =  await employee_commuting_categoryDetails(facilitiesdata,year)
//           categorydata14  =  await homeoffice_categoryDetails(facilitiesdata,year)
//           categorydata15  =  await waste_generated_emissionsDetails(facilitiesdata,year)

//           categorydata16  =  await upstreamLease_emissionDetails(facilitiesdata,year)
//           categorydata17  =  await downstreamLease_emissionDetails(facilitiesdata,year)
//           categorydata18  =  await franchise_categories_emissionDetails(facilitiesdata,year)
//           categorydata19 =  await investment_emissionsDetails(facilitiesdata,year)

//           categorydata20  =  await upstream_vehicle_storage_emissions(facilitiesdata,year)
//           categorydata21  =  await downstream_vehicle_storage_emissions(facilitiesdata,year)

//             array3 =   [ ...categorydata7,...categorydata8,...hotelstayDetails,...othermodes_of_transportDetails,
//               ...categorydata9,...categorydata10,...categorydata11,...categorydata11,...categorydata12,...categorydata13
//             ,...categorydata14,...categorydata15,...categorydata16,...categorydata17,...categorydata18,...categorydata19,...categorydata20,
//           ...categorydata21];
//            if(array3){
//              await Promise.all(
//                array3.map(async (item) => {
//                console.log(item.emission);
//                  if (item.month_number && monthlyData2.hasOwnProperty(item.month_number)) {
//                   monthlyData2[item.month_number] += parseFloat(item.emission);
//                   sum2  += parseFloat(item.emission)
//                    // Add emission value to the corresponding month
//                 }
//                }));
//                scope3month.push(Object.keys(monthlyData2));
//                scope3.push(Object.values(monthlyData2).map(num => parseFloat(num.toFixed(1))));

//            }

//        let series = [{"name": 'Scope 1',"data": scope1[0]},
//         {"name": 'Scope 2',"data": scope2[0]},{"name": 'Scope 3',"data": scope3[0]}];
//         let sumtotal1  = sum ? parseFloat(sum.toFixed(1)) :0
//         let sumtotal2  =sum1?  parseFloat(sum1.toFixed(1)) : 0
//         let sumtotal3 = sum2? parseFloat(sum2.toFixed(1)) :0
//         return res.json({
//           success: true,
//           message: "Succesfully fetched category",
//           scope1: sumtotal1,
//           scope2: sumtotal2,
//           scope3: sumtotal3,
//           series:series,
//           series_graph: [ sumtotal1,sumtotal2, sumtotal3],
//           month : month,
//           status: 200,
//       });

//       }

//      // if (sum && sum1 && sum2) {

//       // } else {
//       // return res.json({
//       //     success: false,
//       //     message: "data not found!",
//       //     status: 200,
//       // });
//       // }
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

exports.dashboardTop5 = async (req, res) => {
  try {
    const { facilities, year } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facilities: [Joi.string().empty().required()],
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
      let month = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",

      ];
      let monthlyData = {};
      let monthlyData1 = {};
      let monthlyData2 = {};
      month.forEach((month) => {
        monthlyData[month] = 0;
        monthlyData1[month] = 0; // Initialize all months with emission of 0
        monthlyData2[month] = 0;
      });
      let categoryTotals = {};
      let categoryTotals2 = {};
      let categoryTotals3 = {};
      let array1 = [];
      let array2 = [];
      let array3 = [];

      let categorydata,
        categorydata2,
        categorydata3,
        categorydata4,
        categorydata5,
        categorydata6,
        categorydata7,
        categorydata8,
        categorydata9,
        categorydata10,
        categorydata11,
        categorydata12,
        categorydata13,
        categorydata14,
        categorydata15,
        categorydata16,
        categorydata17,
        categorydata18,
        categorydata19,
        categorydata20,
        categorydata21 = "";
      let sum = 0;
      let sum1 = 0;
      let sum2 = 0;
      if (facilities) {
        let facilitiesdata = "";
        if (facilities != "0") {
          facilitiesdata = facilities.replace(/\[|\]/g, "");
        } else {
          facilitiesdata = "0";
        }
        categorydata = await getCombustionEmission(facilitiesdata, year);
        categorydata2 = await Allrefrigerants(facilitiesdata, year);
        categorydata3 = await Allfireextinguisher(facilitiesdata, year);
        categorydata4 = await getAllcompanyownedvehicles(facilitiesdata, year);
        array1 = [
          ...categorydata,
          ...categorydata2,
          ...categorydata3,
          ...categorydata4,
        ];
        if (array1.length > 0) {
          await Promise.all(
            array1.map(async (item) => {
              if (
                item.month_number &&
                monthlyData.hasOwnProperty(item.month_number)
              ) {
                let category = item.category; // Assuming there is a "category" property in each item
                if (!categoryTotals[category]) {
                  categoryTotals[category] = 0;
                }
                categoryTotals[category] += parseFloat(item.emission);
              }
            })
          );
        }
        const resultArray = Object.keys(categoryTotals).map((category) => ({
          emission: parseFloat(categoryTotals[category].toFixed(1) / 1000),
          category,
          scope: "scope1",
        }));

        categorydata5 = await getAllelectricity(facilitiesdata, year);
        categorydata6 = await getAllheatandsteam(facilitiesdata, year);
        array2 = [...categorydata5, ...categorydata6];
        if (array2) {
          await Promise.all(
            array2.map(async (item) => {
              if (
                item.month_number &&
                monthlyData1.hasOwnProperty(item.month_number)
              ) {
                let category = item.category;
                if (!categoryTotals2[category]) {
                  categoryTotals2[category] = 0;
                }
                categoryTotals2[category] += parseFloat(item.emission);
              }
            })
          );
        }
        const resultArray1 = Object.keys(categoryTotals2).map((category) => ({
          emission: parseFloat(categoryTotals2[category].toFixed(1) / 1000),
          category,
          scope: "scope2",
        }));

        categorydata7 = await purchaseGoodsDetails(facilitiesdata, year);
        categorydata8 = await flight_travelDetails(facilitiesdata, year);
        let hotelstayDetails = await hotel_stayDetails(facilitiesdata, year);
        let othermodes_of_transportDetails =
          await other_modes_of_transportDetails(facilitiesdata, year);

        categorydata9 = await processing_of_sold_products_categoryDetails(
          facilitiesdata,
          year
        );
        categorydata10 = await sold_product_categoryDetails(
          facilitiesdata,
          year
        );
        categorydata11 = await endoflife_waste_typeDetails(
          facilitiesdata,
          year
        );
        categorydata12 = await water_supply_treatment_categoryDetails(
          facilitiesdata,
          year
        );

        categorydata13 = await employee_commuting_categoryDetails(
          facilitiesdata,
          year
        );
        categorydata14 = await homeoffice_categoryDetails(facilitiesdata, year);
        categorydata15 = await waste_generated_emissionsDetails(
          facilitiesdata,
          year
        );

        categorydata16 = await upstreamLease_emissionDetails(
          facilitiesdata,
          year
        );
        categorydata17 = await downstreamLease_emissionDetails(
          facilitiesdata,
          year
        );
        categorydata18 = await franchise_categories_emissionDetails(
          facilitiesdata,
          year
        );
        categorydata19 = await investment_emissionsDetails(
          facilitiesdata,
          year
        );

        categorydata20 = await upstream_vehicle_storage_emissions(
          facilitiesdata,
          year
        );
        categorydata21 = await downstream_vehicle_storage_emissions(
          facilitiesdata,
          year
        );

        array3 = [
          ...categorydata7,
          ...categorydata8,
          ...hotelstayDetails,
          ...othermodes_of_transportDetails,
          ...categorydata9,
          ...categorydata10,
          ...categorydata11,
          ...categorydata11,
          ...categorydata12,
          ...categorydata13,
          ...categorydata14,
          ...categorydata15,
          ...categorydata16,
          ...categorydata17,
          ...categorydata18,
          ...categorydata19,
          ...categorydata20,
          ...categorydata21,
        ];
        if (array3) {
          await Promise.all(
            array3.map(async (item) => {
              if (
                item.month_number &&
                monthlyData2.hasOwnProperty(item.month_number)
              ) {
                let category = item.category;
                if (!categoryTotals3[category]) {
                  categoryTotals3[category] = 0;
                }
                categoryTotals3[category] += parseFloat(item.emission);
              }
            })
          );
        }
        if (categorydata.length > 0) {
          for (item of categorydata) {
            if (
              item.month_number &&
              monthlyData2.hasOwnProperty(item.month_number)
            ) {
              monthlyData2[item.month_number] += parseFloat(
                item?.scope3_emission ? item?.scope3_emission : 0
              );
              let emissionFixed = parseFloat(
                item?.scope3_emission ? item?.scope3_emission : 0
              );
              // emissionFixed = (emissionFixed/1000).toFixed(3)
              let category = item.category;
              if (!categoryTotals3[category]) {
                categoryTotals3[category] = 0;
              }
              categoryTotals3[category] += emissionFixed;


              // Add emission value to the corresponding month
            }
          }
        }

        if (categorydata5.length > 0) {
          for (item of categorydata5) {
            if (
              item.month_number &&
              monthlyData2.hasOwnProperty(item.month_number)
            ) {
              monthlyData2[item.month_number] += parseFloat(
                item?.scope3_emission ? item?.scope3_emission : 0
              );
              let emissionFixed = parseFloat(
                item?.scope3_emission ? item?.scope3_emission : 0
              );
              // emissionFixed = (emissionFixed/1000).toFixed(3)
              let category = item.category;
              if (!categoryTotals3[category]) {
                categoryTotals3[category] = 0;
              }
              categoryTotals3[category] += emissionFixed;


              // Add emission value to the corresponding month
            }
          }
        }

        if (categorydata6.length > 0) {
          for (item of categorydata6) {
            if (
              item.month_number &&
              monthlyData2.hasOwnProperty(item.month_number)
            ) {
              monthlyData2[item.month_number] += parseFloat(
                item?.scope3_emission ? item?.scope3_emission : 0
              );
              let emissionFixed = parseFloat(
                item?.scope3_emission ? item?.scope3_emission : 0
              );
              // emissionFixed = (emissionFixed/1000).toFixed(3)
              let category = item.category;
              if (!categoryTotals3[category]) {
                categoryTotals3[category] = 0;
              }
              categoryTotals3[category] += emissionFixed;


              // Add emission value to the corresponding month
            }
          }
        }

        const combinedCategories = ['Stationary Combustion', 'Electricity', 'Heat and Steam'];
        let combinedEmission = 0;
        let resultArray2 = [];

        Object.keys(categoryTotals3).forEach((category) => {
          const emission = categoryTotals3[category];

          if (combinedCategories.includes(category)) {
            combinedEmission += emission;
          } else {
            resultArray2.push({
              emission: parseFloat(emission.toFixed(3) / 1000),
              category,
              scope: "scope3",
            });
          }
        });

        if (combinedEmission > 0) {
          resultArray2.unshift({
            emission: parseFloat(combinedEmission.toFixed(3) / 1000),
            category: 'Fuel and Energy-related Activities',
            scope: 'scope3',
          });
        }

        let array = [...resultArray, ...resultArray1, ...resultArray2];

        array.sort((a, b) => b.emission - a.emission);

        let top5Emissions = array.slice(0, 5);
        return res.json({
          success: true,
          message: "Succesfully fetched category",
          top5Emissions: top5Emissions,
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

exports.getdashboardfacilities = async (req, res) => {
  try {
    const { tenantID, superAdminId } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        tenantID: [Joi.string().empty().required()],
        superAdminId: [Joi.string().empty().required()],
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
      let facilities = "";
      facilities = await getData("`dbo.aspnetuserroles`",
        `where tenant_id =${tenantID}`
      );

      if (facilities.length == 0) {
        let where = "  where  F.TenantID = '" + tenantID + "'";
        facilities = await getSelectedColumn(
          "`dbo.facilities` F ",
          where,
          "F.ID,F.ID as facilityID,F.AssestName as AssestType,F.AssestType as name, F.TenantID as tenantID,F.ID as id"
        );
      } else if (facilities[0].facilityID == 0) {
        let where = "  where  F.TenantID = '" + tenantID + "'";
        facilities = await getSelectedColumn(
          "`dbo.facilities` F ",
          where,
          "F.ID,F.ID as facilityID, F.AssestName as AssestType,F.AssestType as name, F.TenantID as tenantID,F.ID as id"
        );
      }

      let array = [];

      await Promise.all(

        facilities.map(async (item) => {
          let facilities1 = [];
          let where1 = "";

          if (item?.group_id != 0 && item?.group_id != undefined) {
            let where2 = ` where  G.id  = '${item?.group_id}'`;
            const groupmap = await getSelectedColumn("`dbo.group` G", where2, " G.groupname as AssestName,G.tenantID,G.id,G.is_subgroup");
            if (groupmap?.length > 0) {
              if (groupmap[0]?.is_subgroup == 0) {
                where1 =
                  " JOIN  `dbo.facilities` F ON G.facilityId = F.ID where G.groupId = '" + item.group_id + "'";
                facilities1 = await getSelectedColumn("`dbo.groupmapping` G", where1, "G.facilityId,F.ID as id,F.ID as ID,F.AssestName as AssestType,F.AssestType as name,F.CountryId as country_code");
              } else {
                let where = "  where  F.sub_group_id = '" + item.group_id + "'";
                facilities1 = await getSelectedColumn("`dbo.facilities` F ", where, "F.ID as id,F.ID as ID, F.AssestName as AssestType,F.AssestType as name,F.CountryId as country_code"
                );
              }
            }
          } else {
            let where = `  where F.ID IN(${item.facilityID})`;
            facilities1 = await getSelectedColumn(
              "`dbo.facilities` F ",
              where,
              "F.ID as id ,F.ID as ID, F.AssestName as AssestType,F.AssestType as name,F.CountryId as country_code"
            );
          }

          await Promise.all(
            facilities1.map(async (item1) => {
              array.push(item1);
            })
          );
        })
      );

      console.log("array", array,);

      if (facilities.length > 0) {
        let where1 =
          ' where G.tenantID = "' + superAdminId + '"' + " AND G.is_subgroup <> 1  AND G.is_main_group <> 1 AND G.group_by <> 2";
        const groupmap = await getSelectedColumn("`dbo.group` G", where1, " G.groupname as name,G.tenantID,G.id");

        await Promise.all(
          groupmap.map(async (item) => {
            item.AssestType = "";
            let where1 = ' where G.groupId = "' + item.id + '"';
            const groupmap = await getSelectedColumn(
              "`dbo.groupmapping` G",
              where1,
              " G.facilityId"
            );

            item.ID = groupmap?.map((item) => String(item.facilityId));
            item.AssestType = item.name;
          })
        );
        console.log("groupmap", groupmap,);

        // Step 1: Create a Set of valid user IDs
        const validIDs = new Set(array.map(u => u.ID.toString()));

        // Step 2: Filter groupmap to only include groups whose all IDs exist in usersarray
        const filteredGroupMap = groupmap.filter(group =>
          group.ID.every(id => validIDs.has(id))
        );

        // Step 3: Combine arrays
        const arrays = [...array, ...filteredGroupMap];
        if (arrays.length == 0) {
          return res.json({
            success: false,
            message: "data not found!",
            status: 200,
          });
        } else {
          return res.json({
            success: true,
            message: "Succesfully fetched facilities",
            categories: arrays,
            status: 200,
          });
        }

      } else {
        return res.json({
          success: false,
          message: "data not found!",
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

exports.ScopewiseEmssion = async (req, res) => {
  try {
    const { facilities, year } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facilities: [Joi.string().empty().required()],
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
      let month = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",

      ];
      let monthlyData = {};
      let monthlyData1 = {};
      let monthlyData2 = {};
      month.forEach((month) => {
        monthlyData[month] = 0;
        monthlyData1[month] = 0;
        monthlyData2[month] = 0;
      });
      let categoryTotals = {};
      let categoryTotals2 = {};
      let categoryTotals3 = {};
      let array1 = [];
      let array2 = [];
      let array3 = [];

      let categorydata,
        categorydata2,
        categorydata3,
        categorydata4,
        categorydata5,
        categorydata6,
        categorydata7,
        categorydata8,
        categorydata9,
        categorydata10,
        categorydata11,
        categorydata12,
        categorydata13,
        categorydata14,
        categorydata15,
        categorydata16,
        categorydata17,
        categorydata18,
        categorydata19,
        categorydata20,
        categorydata21 = "";
      let sum = 0;
      let sum1 = 0;
      let sum2 = 0;
      if (facilities) {
        let facilitiesdata = "";
        if (facilities != "0") {
          facilitiesdata = facilities.replace(/\[|\]/g, "");
        } else {
          facilitiesdata = "0";
        }
        categorydata = await getCombustionEmission(facilitiesdata, year);
        categorydata2 = await Allrefrigerants(facilitiesdata, year);
        categorydata3 = await Allfireextinguisher(facilitiesdata, year);
        categorydata4 = await getAllcompanyownedvehicles(facilitiesdata, year);
        array1 = [
          ...categorydata,
          ...categorydata2,
          ...categorydata3,
          ...categorydata4,
        ];
        if (array1.length > 0) {
          await Promise.all(
            array1.map(async (item) => {
              if (
                item.month_number &&
                monthlyData.hasOwnProperty(item.month_number)
              ) {
                let category = item.category; // Assuming there is a "category" property in each item
                if (!categoryTotals[category]) {
                  categoryTotals[category] = 0;
                }
                categoryTotals[category] += parseFloat(item.emission);
              }
            })
          );
        }
        const resultArray = Object.keys(categoryTotals).map((category) => ({
          emission: parseFloat(categoryTotals[category].toFixed(1)),
          category,
          scope: "scope1",
        }));

        categorydata5 = await getAllelectricity(facilitiesdata, year);
        categorydata6 = await getAllheatandsteam(facilitiesdata, year);
        array2 = [...categorydata5, ...categorydata6];
        if (array2) {
          await Promise.all(
            array2.map(async (item) => {
              if (
                item.month_number &&
                monthlyData1.hasOwnProperty(item.month_number)
              ) {
                let category = item.category;
                if (!categoryTotals2[category]) {
                  categoryTotals2[category] = 0;
                }
                categoryTotals2[category] += parseFloat(item.emission);
              }
            })
          );
        }
        const resultArray1 = Object.keys(categoryTotals2).map((category) => ({
          emission: parseFloat(categoryTotals2[category].toFixed(1)),
          category,
          scope: "scope2",
        }));

        categorydata7 = await purchaseGoodsDetails(facilitiesdata, year);
        categorydata8 = await flight_travelDetails(facilitiesdata, year);
        let hotelstayDetails = await hotel_stayDetails(facilitiesdata, year);
        let othermodes_of_transportDetails =
          await other_modes_of_transportDetails(facilitiesdata, year);

        categorydata9 = await processing_of_sold_products_categoryDetails(
          facilitiesdata,
          year
        );
        categorydata10 = await sold_product_categoryDetails(
          facilitiesdata,
          year
        );
        categorydata11 = await endoflife_waste_typeDetails(
          facilitiesdata,
          year
        );
        categorydata12 = await water_supply_treatment_categoryDetails(
          facilitiesdata,
          year
        );

        categorydata13 = await employee_commuting_categoryDetails(
          facilitiesdata,
          year
        );
        categorydata14 = await homeoffice_categoryDetails(facilitiesdata, year);
        categorydata15 = await waste_generated_emissionsDetails(
          facilitiesdata,
          year
        );

        categorydata16 = await upstreamLease_emissionDetails(
          facilitiesdata,
          year
        );
        categorydata17 = await downstreamLease_emissionDetails(
          facilitiesdata,
          year
        );
        categorydata18 = await franchise_categories_emissionDetails(
          facilitiesdata,
          year
        );
        categorydata19 = await investment_emissionsDetails(
          facilitiesdata,
          year
        );

        categorydata20 = await upstream_vehicle_storage_emissions(
          facilitiesdata,
          year
        );
        categorydata21 = await downstream_vehicle_storage_emissions(
          facilitiesdata,
          year
        );
        array3 = [
          ...categorydata7,
          ...categorydata8,
          ...hotelstayDetails,
          ...othermodes_of_transportDetails,
          ...categorydata9,
          ...categorydata10,
          ...categorydata11,
          ...categorydata11,
          ...categorydata12,
          ...categorydata13,
          ...categorydata14,
          ...categorydata15,
          ...categorydata16,
          ...categorydata17,
          ...categorydata18,
          ...categorydata19,
          ...categorydata20,
          ...categorydata21,
        ];
        if (array3) {
          await Promise.all(
            array3.map(async (item) => {
              if (
                item.month_number &&
                monthlyData2.hasOwnProperty(item.month_number)
              ) {
                let category = item.category;
                if (!categoryTotals3[category]) {
                  categoryTotals3[category] = 0;
                }
                let emssion = parseFloat(item.emission);
                categoryTotals3[category] += emssion;
              }
            })
          );
        }
        if (categorydata.length > 0) {
          for (item of categorydata) {
            if (
              item.month_number &&
              monthlyData2.hasOwnProperty(item.month_number)
            ) {
              monthlyData2[item.month_number] += parseFloat(
                item?.scope3_emission ? item?.scope3_emission : 0
              );
              let emissionFixed = parseFloat(
                item?.scope3_emission ? item?.scope3_emission : 0
              );

              let category = item.category;
              if (!categoryTotals3[category]) {
                categoryTotals3[category] = 0;
              }
              categoryTotals3[category] += emissionFixed;


              // Add emission value to the corresponding month
            }
          }
        }

        if (categorydata5.length > 0) {
          for (item of categorydata5) {
            if (
              item.month_number &&
              monthlyData2.hasOwnProperty(item.month_number)
            ) {
              monthlyData2[item.month_number] += parseFloat(
                item?.scope3_emission ? item?.scope3_emission : 0
              );
              let emissionFixed = parseFloat(
                item?.scope3_emission ? item?.scope3_emission : 0
              );

              let category = item.category;
              if (!categoryTotals3[category]) {
                categoryTotals3[category] = 0;
              }
              categoryTotals3[category] += emissionFixed;


              // Add emission value to the corresponding month
            }
          }
        }

        if (categorydata6.length > 0) {
          for (item of categorydata6) {
            if (
              item.month_number &&
              monthlyData2.hasOwnProperty(item.month_number)
            ) {
              monthlyData2[item.month_number] += parseFloat(
                item?.scope3_emission ? item?.scope3_emission : 0
              );
              let emissionFixed = parseFloat(
                item?.scope3_emission ? item?.scope3_emission : 0
              );

              let category = item.category;
              if (!categoryTotals3[category]) {
                categoryTotals3[category] = 0;
              }
              categoryTotals3[category] += emissionFixed;


              // Add emission value to the corresponding month
            }
          }
        }

        const combinedCategories = ['Stationary Combustion', 'Electricity', 'Heat and Steam'];

        let combinedEmission = 0;
        let combinedEmission1 = 0;
        const resultArray2 = [];

        Object.keys(categoryTotals3).forEach((category) => {
          const emission = categoryTotals3[category];

          if (combinedCategories.includes(category)) {
            combinedEmission += emission;
          } else {
            resultArray2.push({
              emission: parseFloat(emission.toFixed(3) / 1000),
              category,
              scope: "scope3",
            });
          }
        });

        if (combinedEmission > 0) {
          resultArray2.unshift({
            emission: parseFloat(combinedEmission.toFixed(3) / 1000),
            category: 'Fuel and Energy-related Activities',
            scope: 'scope3',
          });
        }

        let newDAta = [];
        let newDAta2 = [];
        let newDAta3 = [];
        for (let category in categoryTotals) {
          newDAta.push(
            `${category} - ${parseFloat(
              categoryTotals[category] / 1000
            ).toFixed(3)} Tonnes`
          );
        }
        for (let category in categoryTotals2) {
          newDAta2.push(
            `${category} - ${parseFloat(
              categoryTotals2[category] / 1000
            ).toFixed(3)} Tonnes`
          );
        }

        for (let category in categoryTotals3) {
          const emission = parseFloat(categoryTotals3[category]);
          if (combinedCategories.includes(category)) {
            combinedEmission1 += emission;
          } else {
            newDAta3.push(
              `${category} - ${(emission / 1000).toFixed(3)} Tonnes`
            );
          }
        }

        if (combinedEmission1 > 0) {
          newDAta3.unshift(
            `Fuel and Energy-related Activities - ${(combinedEmission1 / 1000).toFixed(3)} Tonnes`
          );
        }

        return res.json({
          success: true,
          message: "Succesfully fetched category",
          Scope1: resultArray,
          Scope2: resultArray1,
          Scope3: resultArray2,
          seriesScope1: Object.values(categoryTotals).map((num) =>
            parseFloat(num.toFixed(1) / 1000)
          ),
          labelScope1: newDAta,
          seriesScope2: Object.values(categoryTotals2).map((num) =>
            parseFloat(num.toFixed(1) / 1000)
          ),
          labelScope2: newDAta2,
          seriesScope3: resultArray2.map((val) => parseFloat((val.emission / 1000).toFixed(4))),
          labelScope3: newDAta3,
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

exports.UpDownwiseEmssion = async (req, res) => {
  try {
    const { facilities, year } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facilities: [Joi.string().empty().required()],
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
      let month = [
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
        "Jan",
        "Feb",
        "Mar",
      ];
      let monthlyData = {};
      let monthlyData1 = {};
      let monthlyData2 = {};
      month.forEach((month) => {
        monthlyData[month] = 0;
        monthlyData1[month] = 0; // Initialize all months with emission of 0
        monthlyData2[month] = 0;
      });

      let categoryTotals3 = {};

      let array3 = [];

      let categorydata16,
        categorydata17,
        categorydata20,
        categorydata21 = "";
      if (facilities) {
        let facilitiesdata = "";
        if (facilities != "0") {
          facilitiesdata = facilities.replace(/\[|\]/g, "");
        } else {
          facilitiesdata = "0";
        }
        categorydata16 = await upstreamLease_emissionDetails(
          facilitiesdata,
          year
        );
        categorydata17 = await downstreamLease_emissionDetails(
          facilitiesdata,
          year
        );
        categorydata20 = await upstream_vehicle_storage_emissions(
          facilitiesdata,
          year
        );
        categorydata21 = await downstream_vehicle_storage_emissions(
          facilitiesdata,
          year
        );

        array3 = [
          ...categorydata16,
          ...categorydata17,
          ...categorydata20,
          ...categorydata21,
        ];
        if (array3) {
          await Promise.all(
            array3.map(async (item) => {
              if (
                item.month_number &&
                monthlyData2.hasOwnProperty(item.month_number)
              ) {
                let category = item.category;
                if (!categoryTotals3[category]) {
                  categoryTotals3[category] = 0;
                }
                categoryTotals3[category] += parseFloat(item.emission);
              }
            })
          );
        }
        const resultArray2 = Object.keys(categoryTotals3).map((category) => ({
          emission: parseFloat(categoryTotals3[category].toFixed(1)),
          category,
          scope: "scope3",
        }));

        sumUpstream = 0;
        sumDownstream = 0;
        resultArray2.forEach((item) => {
          if (item.category.includes("Upstream")) {
            sumUpstream += item.emission;
          } else if (item.category.includes("Downstream")) {
            sumDownstream += item.emission;
          }
        });
        return res.json({
          success: true,
          message: "Succesfully fetched category",
          upstream: sumUpstream,
          downstream: sumDownstream,
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

exports.dashboardEmssionByactivities = async (req, res) => {
  try {
    const { facilities, year } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facilities: [Joi.string().empty().required()],
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
      let month = [
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
        "Jan",
        "Feb",
        "Mar",
      ];
      let monthlyData = {};
      let monthlyData1 = {};
      let monthlyData2 = {};
      month.forEach((month) => {
        monthlyData[month] = 0;
        monthlyData1[month] = 0; // Initialize all months with emission of 0
        monthlyData2[month] = 0;
      });
      let categoryTotals = {};
      let categoryTotals2 = {};
      let categoryTotals3 = {};
      let array1 = [];
      let array2 = [];
      let array3 = [];

      let categorydata7,
        categorydata8,
        categorydata9,
        categorydata10,
        categorydata11,
        categorydata13,
        categorydata15,
        categorydata16,
        categorydata17,
        categorydata18,
        categorydata19,
        categorydata20,
        categorydata21 = "";

      if (facilities) {
        let facilitiesdata = "";
        if (facilities != "0") {
          facilitiesdata = facilities.replace(/\[|\]/g, "");
        } else {
          facilitiesdata = "0";
        }

        categorydata7 = await purchaseGoodsDetails(facilitiesdata, year);
        categorydata20 = await upstream_vehicle_storage_emissions(
          facilitiesdata,
          year
        );
        categorydata15 = await waste_generated_emissionsDetails(
          facilitiesdata,
          year
        );

        categorydata8 = await flight_travelDetails(facilitiesdata, year);
        let hotelstayDetails = await hotel_stayDetails(facilitiesdata, year);
        let othermodes_of_transportDetails =
          await other_modes_of_transportDetails(facilitiesdata, year);
        categorydata13 = await employee_commuting_categoryDetails(
          facilitiesdata,
          year
        );
        categorydata16 = await upstreamLease_emissionDetails(
          facilitiesdata,
          year
        );

        array2 = [
          ...categorydata7,
          ...categorydata20,
          ...categorydata15,
          ...categorydata8,
          ...hotelstayDetails,
          ...othermodes_of_transportDetails,
          ...categorydata13,
          ...categorydata16,
        ];

        if (array2) {
          await Promise.all(
            array2.map(async (item) => {
              if (
                item.month_number &&
                monthlyData2.hasOwnProperty(item.month_number)
              ) {
                let category = item.category;
                if (!categoryTotals[category]) {
                  categoryTotals[category] = 0;
                }
                categoryTotals[category] += parseFloat(item.emission);
              }
            })
          );
        }

        const resultArray1 = Object.keys(categoryTotals).map((category) => ({
          emission: parseFloat(categoryTotals[category] / 1000).toFixed(3),
          category,
          scope: "scope3",
        }));

        categorydata9 = await processing_of_sold_products_categoryDetails(
          facilitiesdata,
          year
        );
        categorydata10 = await sold_product_categoryDetails(
          facilitiesdata,
          year
        );
        categorydata11 = await endoflife_waste_typeDetails(
          facilitiesdata,
          year
        );
        categorydata17 = await downstreamLease_emissionDetails(
          facilitiesdata,
          year
        );
        categorydata21 = await downstream_vehicle_storage_emissions(
          facilitiesdata,
          year
        );
        categorydata19 = await investment_emissionsDetails(
          facilitiesdata,
          year
        );
        categorydata18 = await franchise_categories_emissionDetails(
          facilitiesdata,
          year
        );

        array3 = [
          ...categorydata9,
          ...categorydata10,
          ...categorydata11,
          categorydata17,
          ...categorydata21,
          ...categorydata19,
          ...categorydata18,
        ];
        if (array3) {
          await Promise.all(
            array3.map(async (item) => {
              if (
                item.month_number &&
                monthlyData2.hasOwnProperty(item.month_number)
              ) {
                let category = item.category;
                if (!categoryTotals3[category]) {
                  categoryTotals3[category] = 0;
                }
                categoryTotals3[category] += parseFloat(item.emission);
              }
            })
          );
        }

        const resultArray2 = Object.keys(categoryTotals3).map((category) => ({
          emission: parseFloat(categoryTotals3[category] / 1000).toFixed(3),
          category,
          scope: "scope3",
        }));

        return res.json({
          success: true,
          message: "Succesfully fetched category",
          upstream: resultArray1,
          downstrem: resultArray2,
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

exports.dashboardEmssionByVendors = async (req, res) => {
  try {
    const { facilities, year } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facilities: [Joi.string().empty().required()],
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
      let categoryTotals = {};

      if (facilities) {
        let facilitiesdata = "";
        if (facilities != "0") {
          facilitiesdata = facilities.replace(/\[|\]/g, "");
        } else {
          facilitiesdata = "0";
        }
        let purchaseGoods = await purchaseGoodsBySupplier(facilitiesdata, year);
        let array = [];
        if (purchaseGoods.length > 0) {
          await Promise.all(
            purchaseGoods.map(async (item) => {
              let supplier = item.supplier;
              array.push({
                supplier: supplier,
                unit: item.unit,
                emssion: parseFloat(item.emission),
              });
            })
          );
        }

        return res.json({
          success: true,
          message: "Succesfully fetched category",
          purchaseGoods: array,
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

exports.businessdashboardemssionByTravel = async (req, res) => {
  try {
    const { facilities, year } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facilities: [Joi.string().empty().required()],
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
      let array3 = [];

      let sum = 0;

      if (facilities) {
        let facilitiesdata = "";
        if (facilities != "0") {
          facilitiesdata = facilities.replace(/\[|\]/g, "");
        } else {
          facilitiesdata = "0";
        }

        let categorydata8 = await flight_travelDetailsByemssion(
          facilitiesdata,
          year
        );
        let flight = categorydata8[0].emission
          ? parseFloat(categorydata8[0].emission / 1000).toFixed(3)
          : 0;

        let hotelstayDetails = await hotel_stayDetailsemssion(
          facilitiesdata,
          year
        );
        let hotelstay = hotelstayDetails[0].emission
          ? parseFloat(hotelstayDetails[0].emission / 1000).toFixed(3)
          : 0;

        let rentalemssion = await other_modes_of_transportDetailsemssion(
          facilitiesdata,
          year,
          "Car"
        );
        let rental = rentalemssion[0].emission
          ? parseFloat(rentalemssion[0].emission / 1000).toFixed(3)
          : 0;

        let othermodesemssion = await other_modes_of_transportDetailsemssion(
          facilitiesdata,
          year
        );
        let other_modes = othermodesemssion[0].emission
          ? parseFloat(othermodesemssion[0].emission / 1000).toFixed(3)
          : 0;

        array3.push(
          parseFloat(flight),
          parseFloat(rental),
          parseFloat(hotelstay),
          parseFloat(other_modes)
        );

        const sum = array3.reduce((acc, curr) => acc + curr, 0);
        if (array3) {
          return res.json({
            success: true,
            message: "Succesfully fetched category",
            series: array3,
            categories: [
              "Air travel",
              "Rental car",
              "Hotel stay",
              "Other Ground Travel",
            ],
            totalEmssion: sum,
            status: 200,
          });
        } else {
          return res.json({
            success: false,
            message: "data not found!",
            status: 200,
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

exports.businessdashboardemssionByAir = async (req, res) => {
  try {
    const { facilities, year } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facilities: [Joi.string().empty().required()],
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
      let array3 = [];
      let array4 = [];

      let sum = 0;

      if (facilities) {
        let facilitiesdata = "";
        if (facilities != "0") {
          facilitiesdata = facilities.replace(/\[|\]/g, "");
        } else {
          facilitiesdata = "0";
        }

        let categorydata1 = await flight_travelDetailsByemssion(
          facilitiesdata,
          year,
          "Short"
        );
        let categorydata2 = await flight_travelDetailsByemssion(
          facilitiesdata,
          year,
          "Medium"
        );
        let categorydata3 = await flight_travelDetailsByemssion(
          facilitiesdata,
          year,
          "Long"
        );

        let flight1 = categorydata1[0].emission
          ? parseFloat(categorydata1[0].emission / 1000).toFixed(3)
          : 0;
        let flight2 = categorydata2[0].emission
          ? parseFloat(categorydata2[0].emission / 1000).toFixed(3)
          : 0;
        let flight3 = categorydata3[0].emission
          ? parseFloat(categorydata3[0].emission / 1000).toFixed(3)
          : 0;

        array3.push(
          parseFloat(flight1),
          parseFloat(flight2),
          parseFloat(flight3)
        );

        let categorydata4 = await flight_travelDetailsByemssion(
          facilitiesdata,
          year,
          "",
          "Economy"
        );
        let categorydata5 = await flight_travelDetailsByemssion(
          facilitiesdata,
          year,
          "",
          "Business"
        );
        let categorydata6 = await flight_travelDetailsByemssion(
          facilitiesdata,
          year,
          "",
          "First Class"
        );

        let flight4 = categorydata4[0].emission
          ? parseFloat(categorydata4[0].emission / 1000).toFixed(3)
          : 0;
        let flight5 = categorydata5[0].emission
          ? parseFloat(categorydata5[0].emission / 1000).toFixed(3)
          : 0;
        let flight6 = categorydata6[0].emission
          ? parseFloat(categorydata6[0].emission / 1000).toFixed(3)
          : 0;

        array4.push(
          parseFloat(flight4),
          parseFloat(flight5),
          parseFloat(flight6)
        );

        const sum = array3.reduce((acc, curr) => acc + curr, 0);
        const sum1 = array4.reduce((acc, curr) => acc + curr, 0);
        if (array3) {
          return res.json({
            success: true,
            message: "Succesfully fetched category",
            flight_type_series: array3,
            flight_class_series: array4,
            totalflight_type: sum,
            totalflight_class: sum1,
            flight_type: ["Short haul", "Medium haul", "Long haul"],
            flight_class: ["Economy", "Business", "First Class"],
            status: 200,
          });
        } else {
          return res.json({
            success: false,
            message: "data not found!",
            status: 200,
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

exports.businessdashboardemssionBygroundTravel = async (req, res) => {
  try {
    const { facilities, year } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facilities: [Joi.string().empty().required()],
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
      let array3 = [];

      let sum = 0;

      if (facilities) {
        let facilitiesdata = "";
        if (facilities != "0") {
          facilitiesdata = facilities.replace(/\[|\]/g, "");
        } else {
          facilitiesdata = "0";
        }

        let rentalemssion = await other_modes_of_transportDetailsemssion(
          facilitiesdata,
          year,
          "Car"
        );
        let rental = rentalemssion[0].emission
          ? parseFloat(rentalemssion[0].emission / 1000).toFixed(3)
          : 0;

        let othermodesemssion1 = await other_modes_of_transportDetailsemssion(
          facilitiesdata,
          year,
          "Bus"
        );
        let other_modes1 = othermodesemssion1[0].emission
          ? parseFloat(othermodesemssion1[0].emission / 1000).toFixed(3)
          : 0;

        let othermodesemssion2 = await other_modes_of_transportDetailsemssion(
          facilitiesdata,
          year,
          "Rail"
        );
        let other_modes2 = othermodesemssion2[0].emission
          ? parseFloat(othermodesemssion2[0].emission / 1000).toFixed(3)
          : 0;

        let othermodesemssion3 = await other_modes_of_transportDetailsemssion(
          facilitiesdata,
          year,
          "Auto"
        );
        let other_modes3 = othermodesemssion3[0].emission
          ? parseFloat(othermodesemssion3[0].emission / 1000).toFixed(3)
          : 0;

        array3.push(
          parseFloat(rental),
          parseFloat(other_modes1),
          parseFloat(other_modes2),
          parseFloat(other_modes3)
        );

        const sum = array3.reduce((acc, curr) => acc + curr, 0);
        if (array3) {
          return res.json({
            success: true,
            message: "Succesfully fetched category",
            series: array3,
            categories: ["Car", "Bus", "Rail", "Auto"],
            totalEmssion: sum,
            status: 200,
          });
        } else {
          return res.json({
            success: false,
            message: "data not found!",
            status: 200,
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

exports.businessdashboardemssion = async (req, res) => {
  try {
    const { facilities, year } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facilities: [Joi.string().empty().required()],
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

      let finalyear = "";
      let finalyeardata = "2";
      let where = ` where user_id = '${user_id}'`;
      const financialyear = await getSelectedColumn(
        "financial_year_setting",
        where,
        "*"
      );
      if (financialyear.length > 0) {
        let final_year = financialyear[0].financial_year;
        if (final_year == "2") {
          finalyear = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          finalyeardata = "2";
        } else {
          finalyear = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          finalyeardata = "1";
        }
      } else {
        finalyear = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        finalyeardata = "2";
      }

      let month = finalyear;
      let monthlyData = {};
      let monthlyData1 = {};
      let monthlyData2 = {};
      month.forEach((month) => {
        monthlyData[month] = 0;
        monthlyData1[month] = 0; // Initialize all months with emission of 0
        monthlyData2[month] = 0;
      });

      let array3 = [];
      let scope3month = [];

      let scope3 = [];

      let categorydata8 = "";
      let sum2 = 0;
      if (facilities) {
        let facilitiesdata = "";
        if (facilities != "0") {
          facilitiesdata = facilities.replace(/\[|\]/g, "");
        } else {
          facilitiesdata = "0";
        }
        categorydata8 = await flight_travelDetails(
          facilitiesdata,
          year,
          finalyeardata
        );
        let hotelstayDetails = await hotel_stayDetails(
          facilitiesdata,
          year,
          finalyeardata
        );
        let othermodes_of_transportDetails =
          await other_modes_of_transportDetails(
            facilitiesdata,
            year,
            finalyeardata
          );

        array3 = [
          ...categorydata8,
          ...hotelstayDetails,
          ...othermodes_of_transportDetails,
        ];
        if (array3) {
          await Promise.all(
            array3.map(async (item) => {
              if (
                item.month_number &&
                monthlyData2.hasOwnProperty(item.month_number)
              ) {
                monthlyData2[item.month_number] += parseFloat(item.emission);
                sum2 += parseFloat(item.emission);
                // Add emission value to the corresponding month
              }
            })
          );
          scope3month.push(Object.keys(monthlyData2));
          scope3.push(
            Object.values(monthlyData2).map((num) =>
              parseFloat(num / 1000).toFixed(3)
            )
          );
        }

        let series = [{ name: "Scope 3", data: scope3[0] }];
        let sumtotal3 = sum2 ? parseFloat(sum2 / 1000).toFixed(3) : 0;

        return res.json({
          success: true,
          message: "Succesfully fetched category",
          totalemssion: sumtotal3,
          series: series,
          month: month,
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

// exports.businessdashboardemssion = async (req, res) => {
//   try {

//     const {facilities,year} = req.body;
//     const schema = Joi.alternatives(
//     Joi.object({
//       facilities:[Joi.string().empty().required()],
//       year:[Joi.string().empty().required()],
//     })
//     );
//     const result = schema.validate(req.body);
//     if (result.error) {
//     const message = result.error.details.map((i) => i.message).join(",");
//     return res.json({
//         message: result.error.details[0].message,
//         error: message,
//         missingParams: result.error.details[0].message,
//         status: 200,
//         success: false,
//     });
//     }else{
//       let month = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
//       let monthlyData = {};
//       let monthlyData1 = {};
//       let monthlyData2 = {};
//        month.forEach(month => {
//        monthlyData[month] = 0;
//        monthlyData1[month] = 0; // Initialize all months with emission of 0
//        monthlyData2[month] = 0;
//       });

//       let array3 = [];
//       let scope3month = [];

//       let scope3 = [];
//       const authHeader = req.headers.auth;
//       const jwtToken = authHeader.replace("Bearer ", "");
//       const decoded = jwt.decode(jwtToken);
//       const user_id = decoded.user_id;
//       let  categorydata8 = ""
//       let sum2 = 0;
//       if(facilities){
//         let  facilitiesdata = "";
//         if(facilities != "0"){
//           facilitiesdata =  facilities.replace(/\[|\]/g, '')
//         }else{
//           facilitiesdata = "0"

//         }
//           categorydata8  =  await flight_travelDetails(facilitiesdata,year)
//           let hotelstayDetails = await hotel_stayDetails(facilitiesdata,year);
//           let othermodes_of_transportDetails = await other_modes_of_transportDetails(facilitiesdata,year);

//           array3 =   [ ...categorydata8,...hotelstayDetails,...othermodes_of_transportDetails];
//            if(array3){
//              await Promise.all(
//                array3.map(async (item) => {
//                console.log(item.emission);
//                  if (item.month_number && monthlyData2.hasOwnProperty(item.month_number)) {
//                   monthlyData2[item.month_number] += parseFloat(item.emission);
//                   sum2  += parseFloat(item.emission)
//                    // Add emission value to the corresponding month
//                 }
//                }));
//                scope3month.push(Object.keys(monthlyData2));
//                scope3.push(Object.values(monthlyData2).map(num => parseFloat(num.toFixed(1))));

//            }

//        let series = [{"name": 'Scope 3',"data": scope3[0]}];
//         let sumtotal3 = sum2? parseFloat(sum2.toFixed(1)) :0

//         return res.json({
//           success: true,
//           message: "Succesfully fetched category",
//           totalemssion: sumtotal3,
//           series:series,
//           month : month,
//           status: 200,
//       });

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

exports.dashboardWastetop5 = async (req, res) => {
  try {
    const { facilities, year } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facilities: [Joi.string().empty().required()],
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
      let array3 = [];
      let array = [];

      let categorydata15 = "";
      // let sum1 = 0;
      // let sum4 = 0;
      // let sum5 = 0;
      // let sum3 = 0;
      // let sum2 = 0;
      // if (facilities) {
      //   let facilitiesdata = "";
      //   if (facilities != "0") {
      //     facilitiesdata = facilities.replace(/\[|\]/g, "");
      //   } else {
      //     facilitiesdata = "0";
      //   }

      //   categorydata15 = await waste_generated_emissionsDetailsEmssion(
      //     facilitiesdata,
      //     year
      //   );

      //   let item1 = [];
      //   if (categorydata15) {
      //     await Promise.all(
      //       categorydata15.map(async (item) => {
      //         let where =
      //           " LEFT JOIN endoflife_waste_type  E ON E.id = F.waste_type where F.type = '" +
      //           item.waste_type +
      //           "'";
      //         const waste_type = await getSelectedColumn(
      //           "`endoflife_waste_type_subcategory` F ",
      //           where,
      //           "F.type,F.waste_type,E.type as wasteName"
      //         );
      //         item.wasteName = waste_type?.[0].wasteName;
      //         sum1 += item.emission;
      //         array.push({
      //           emission: parseFloat(sum1),
      //           wasteName: item.wasteName,
      //         });
      //       })
      //     );
      //   }

      //   const emissionsByWaste = array.reduce(
      //     (acc, { emission, wasteName }) => {
      //       acc[wasteName] = (acc[wasteName] || 0) + emission;
      //       return acc;
      //     },
      //     {}
      //   );

      //   // Convert the object into an array of objects
      //   const emissionsArray = Object.entries(emissionsByWaste).map(
      //     ([wasteName, emission]) => ({
      //       wasteName,
      //       emission,
      //     })
      //   );

      //   // Sort the emissions array by emission value in descending order
      //   emissionsArray.sort((a, b) => b.emission - a.emission);

      //   // Select the top 5 emissions
      //   const top5Emissions = emissionsArray.slice(0, 5);

      //   const formattedEmissions = top5Emissions.map((item) => ({
      //     wasteName: item.wasteName,
      //     emission: parseFloat(item.emission / 1000).toFixed(3), // Change 2 to the desired number of decimal places
      //   }));

      //   let series = [
      //     {
      //       name: "waste type",
      //       data: Object.values(formattedEmissions).map(
      //         (item) => item.emission
      //       ),
      //     },
      //   ];
      //   let ef = Object.values(formattedEmissions).map((item) => item.emission);

      //   const sum = ef.reduce((acc, curr) => acc + curr, 0);

      //   return res.json({
      //     success: true,
      //     message: "Succesfully fetched category",
      //     top5Emissions: formattedEmissions,
      //     totalEmission: sum,
      //     series: series,
      //     label: Object.values(formattedEmissions).map(
      //       (item) => item.wasteName
      //     ),
      //     status: 200,
      //   });
      // }

      // faraz code starts 
      categorydata15 = await topFiveWasteEmissions(facilities, year)

      if (categorydata15.length > 0) {
        return res.json({
          success: true,
          message: "Succesfully fetched category",
          top5Emissions: categorydata15,

          status: 200,
        });
      }
      else {
        return res.json({
          success: false,
          message: "Succesfully fetched category",
          top5Emissions: [],

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

exports.dashboardWasteTotal = async (req, res) => {
  try {
    const { facilities, year } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facilities: [Joi.string().empty().required()],
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
      let categorydata15 = "";
      let sum1 = 0;
      let sum2 = 0;
      let sum_quantity = 0;
      let sum_quantity2 = 0;
      let sum_quantity3 = 0;
      if (facilities) {
        let facilitiesdata = "";
        if (facilities != "0") {
          facilitiesdata = facilities.replace(/\[|\]/g, "");
        } else {
          facilitiesdata = "0";
        }

        categorydata15 = await waste_generated_emissionsDetailsEmssion(
          facilitiesdata,
          year
        );
        let unit = "";
        if (categorydata15) {
          await Promise.all(
            categorydata15.map(async (item) => {
              let total_waste = parseFloat(item.total_waste);
              let emission = parseFloat(item.emission / 1000);
              unit = item.unit;
              sum1 += total_waste;

              if (item.method == "reuse") {
                let total_waste = parseFloat(item.total_waste);
                sum_quantity += total_waste;
              }

              if (item.method == "composting") {
                let total_waste = parseFloat(item.total_waste);
                sum_quantity2 += total_waste;
              }

              if (item.method == "recycling") {
                let total_waste = parseFloat(item.total_waste);
                sum_quantity3 += total_waste;
              }
              sum2 += emission;
            })
          );
        }

        let waste1 =
          await waste_generated_emissionsDetailsEmssionByMethodemission(
            facilitiesdata,
            year,
            "reuse"
          );

        let waste2 =
          await waste_generated_emissionsDetailsEmssionByMethodemission(
            facilitiesdata,
            year,
            "composting"
          );

        let waste3 =
          await waste_generated_emissionsDetailsEmssionByMethodemission(
            facilitiesdata,
            year,
            "recycling"
          );

        let sumreuse = waste1[0]?.["emission"]
          ? parseFloat(waste1[0]["emission"] / 1000)
          : 0;

        let sumcomposted = waste2[0]?.["emission"]
          ? parseFloat(waste2[0]["emission"] / 1000)
          : 0;

        let recycling = waste3[0]?.["emission"]
          ? parseFloat(waste3[0]["emission"] / 1000)
          : 0;

        let array3 = [];

        array3.push(sumreuse, sumcomposted, recycling);

        const sumtotal3 = array3.reduce((acc, curr) => acc + curr, 0);

        let totalsum = parseFloat(sum1).toFixed(1);

        let diverted =
          (parseFloat(sum_quantity + sum_quantity2 + sum_quantity3) /
            parseFloat(sum1)) *
          100;

        let diverted_emssion = diverted;

        let totalsum1 = parseFloat(sum2).toFixed(4);

        return res.json({
          success: true,
          message: "Succesfully fetched category",
          waste_disposed: parseFloat(totalsum) + " " + unit,
          waste_emissions: parseFloat(totalsum1) + " " + "Tonnes",
          diverted_emssion:
            parseFloat(diverted_emssion ? diverted_emssion : 0).toFixed(2) +
            " " +
            "%",
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

exports.dashboardWasteEmissionhaz = async (req, res) => {
  try {
    const { facilities, year } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facilities: [Joi.string().empty().required()],
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

      let sum2 = 0;
      let sum1 = 0;
      if (facilities) {
        let facilitiesdata = "";
        if (facilities != "0") {
          facilitiesdata = facilities.replace(/\[|\]/g, "");
        } else {
          facilitiesdata = "0";
        }

        let hazadrous = await waste_generated_emissions_by_hazardous(
          facilitiesdata,
          year
        );

        let non_hazadrous = await waste_generated_emissions_by_non_hazadrous(
          facilitiesdata,
          year
        );

        return res.json({
          success: true,
          message: "Succesfully fetched category",
          series: [
            Number(hazadrous[0].emission),
            Number(non_hazadrous[0].emission),
          ],
          cities: ["Hazardous Waste", "Non-Hazardous Waste"],
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

exports.dashboardWasteEmission = async (req, res) => {
  try {
    const { facilities, year } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facilities: [Joi.string().empty().required()],
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
      let month = [
        "recycling",
        "incineration",
        "composting",
        "landfill",
        "anaerobic_digestion",
      ];
      let monthlyData = {};
      let monthlyData1 = {};
      let monthlyData2 = {};
      month.forEach((month) => {
        monthlyData[month] = 0;
        monthlyData1[month] = 0; // Initialize all months with emission of 0
        monthlyData2[month] = 0;
      });

      let array3 = [];
      let scope3month = [];

      let scope3 = [];

      let categorydata8 = "";
      let sum2 = 0;
      if (facilities) {
        let facilitiesdata = "";
        if (facilities != "0") {
          facilitiesdata = facilities.replace(/\[|\]/g, "");
        } else {
          facilitiesdata = "0";
        }

        let waste_disposed = await waste_generated_emissionsDetailsEmssion_new(
          facilitiesdata,
          year
        );

        if (waste_disposed) {
          await Promise.all(
            waste_disposed.map(async (item) => {
              if (item.method && monthlyData2.hasOwnProperty(item.method)) {
                monthlyData2[item.method] += parseFloat(item.emission);
                sum2 += parseFloat(item.emission);
              }

              // Add emission value to the corresponding month
            })
          );
          scope3month.push(Object.keys(monthlyData2));
          scope3.push(
            Object.values(monthlyData2).map((num) =>
              parseFloat(parseFloat(num / 1000).toFixed(3))
            )
          );
        }

        let series = [{ name: "Scope 3", data: scope3[0] }];
        let sumtotal3 = sum2 ? parseFloat(sum2 / 1000).toFixed(3) : 0;

        return res.json({
          success: true,
          message: "Succesfully fetched category",
          totalemssion: parseFloat(sumtotal3),
          series: series,
          hazardousmonth: [
            "Recycling",
            "Incineration",
            "Composting",
            "Landfill",
            "Anaerobic Digestion",
          ],
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

exports.dashboardWasteUpDownwiseEmssion = async (req, res) => {
  try {
    const { facilities, year } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facilities: [Joi.string().empty().required()],
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
      let month = [
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
        "Jan",
        "Feb",
        "Mar",
      ];
      let monthlyData = {};
      let monthlyData1 = {};
      let monthlyData2 = {};
      month.forEach((month) => {
        monthlyData[month] = 0;
        monthlyData1[month] = 0; // Initialize all months with emission of 0
        monthlyData2[month] = 0;
      });

      let categoryTotals3 = {};

      let array3 = [];

      let categorydata16,
        categorydata17,
        categorydata20,
        categorydata21 = "";
      if (facilities) {
        let facilitiesdata = "";
        if (facilities != "0") {
          facilitiesdata = facilities.replace(/\[|\]/g, "");
        } else {
          facilitiesdata = "0";
        }
        categorydata16 = await endoflife_waste_typeDetails(
          facilitiesdata,
          year
        );
        categorydata17 = await waste_generated_emissionsDetails(
          facilitiesdata,
          year
        );

        array3 = [...categorydata16, ...categorydata17];
        if (array3) {
          await Promise.all(
            array3.map(async (item) => {
              if (
                item.month_number &&
                monthlyData2.hasOwnProperty(item.month_number)
              ) {
                let category = item.category;
                if (!categoryTotals3[category]) {
                  categoryTotals3[category] = 0;
                }
                categoryTotals3[category] += parseFloat(item.emission / 1000);
              }
            })
          );
        }
        const resultArray2 = Object.keys(categoryTotals3).map((category) => ({
          emission: parseFloat(categoryTotals3[category].toFixed(3)),
          category,
          scope: "scope3",
        }));

        sumUpstream = [];
        sumDownstream = [];
        resultArray2.forEach((item) => {
          if (
            item.category.includes("End-of-Life Treatment of Sold Products")
          ) {
            sumUpstream = item.emission;
          } else if (item.category.includes("Waste generated in operations")) {
            sumDownstream = item.emission;
          }
        });
        return res.json({
          success: true,
          message: "Succesfully fetched category",
          series: ["Upstream", "Downstream"],
          upstream_downstream: [sumDownstream, sumUpstream],
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

exports.dashboardWaterTotal = async (req, res) => {
  try {
    const { facilities, year } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facilities: [Joi.string().empty().required()],
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
      let categorydata15 = "";
      let sum1 = 0;
      let sum2 = 0;
      let sum3 = 0;
      let totalemssion = 0;
      let totaltreated = 0;
      let totalwaterwithdrawl = 0;
      if (facilities) {
        let facilitiesdata = "";
        if (facilities != "0") {
          facilitiesdata = facilities.replace(/\[|\]/g, "");
        } else {
          facilitiesdata = "0";
        }

        let where2 = ' where id = "2" ';
        const unitvalue = await getSelectedColumn(
          "water_supply_treatment_type",
          where2,
          "*"
        );

        let where = ' where id = "1" ';
        const unitvalue2 = await getSelectedColumn(
          "water_supply_treatment_type",
          where,
          "*"
        );

        let sum1discharge = 0;
        categorydata15 = await water_supply_treatment_categoryDetailsemission(
          facilitiesdata,
          year
        );

        let treatment_unit = "";
        let supply_unit = "";
        let total_water_withdrawn = 0;
        let total_water_consummed = 0;
        let total_discharge = 0;
        let total_water_treated = 0;
        if (categorydata15) {
          await Promise.all(
            categorydata15.map(async (item) => {
              let where1 =
                ' where G.water_supply_treatment_id = "' + item.id + '"';
              const water_withdrawl = await getSelectedColumn(
                "water_discharge_by_destination_only G",
                where1,
                "SUM(G.kilolitres) as sum"
              );

              await Promise.all(
                water_withdrawl.map(async (item) => {
                  sum3 += parseFloat(item.sum);
                })
              );

              let waterwithdrawn = item.water_supply;
              let waterdischarged = item.water_treatment;
              if (waterdischarged) {
                sum2 += parseFloat(waterdischarged);
              }
              if (waterwithdrawn) {
                sum1 = parseFloat(waterwithdrawn);
              }
              let where2 =
                ' where G.water_supply_treatment_id = "' + item.id + '"';
              const discharge = await getSelectedColumn(
                "water_discharge_by_destination G",
                where2,
                " SUM(G.totalwaterdischarge)  AS totalsum"
              );
              await Promise.all(
                discharge.map(async (item) => {
                  sum1discharge += parseFloat(item.totalsum);
                })
              );

              if (item.water_treatment_unit == "1") {
                totaltreated = parseFloat(
                  (sum1discharge * unitvalue[0]?.kgCO2e_cubic_metres) / 1000
                );
              }
              if (item.water_treatment_unit == "2") {
                totaltreated = parseFloat(
                  (sum1discharge * unitvalue[0]?.kgCO2e_Kilo_litres) / 1000
                );
              }

              if (item.water_supply_unit == "1") {
                totalwaterwithdrawl = parseFloat(
                  (sum1 * unitvalue2[0]?.kgCO2e_cubic_metres) / 1000
                );
              }
              if (item.water_supply_unit == "2") {
                totalwaterwithdrawl = parseFloat(
                  (sum1 * unitvalue2[0]?.kgCO2e_Kilo_litres) / 1000
                );
              }
              total_water_withdrawn += parseFloat(item.water_supply);
              total_water_consummed += parseFloat(item.water_supply - item.water_treatment);
              total_discharge += parseFloat(item.water_treatment);
              total_water_treated += parseFloat(item.water_treated ? item.water_treated : 0);
              totalemssion += parseFloat(item.emission ? item.emission / 1000 : 0);
            })
          );
        }

        return res.json({
          success: true,
          message: "Succesfully fetched category",
          water_withdrawn: parseFloat(total_water_withdrawn).toFixed(3) + " " + "KL",
          water_treated: parseFloat(total_water_treated).toFixed(3) + " " + "KL",
          water_discharge: parseFloat(total_discharge) + " " + "KL",
          water_consumed: parseFloat(total_water_consummed).toFixed(3) + " " + "KL",
          water_total: parseFloat(totalemssion).toFixed(3) + " " + "tC02e",
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

exports.dashboardWaterwithdrawnby_source = async (req, res) => {
  try {
    const { facilities, year } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facilities: [Joi.string().empty().required()],
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
      let water_withdrawlarray = [];
      let scopesum = [];
      let categorydata8 = "";
      let sum1 = 0;

      if (facilities) {
        let facilitiesdata = "";
        if (facilities != "0") {
          facilitiesdata = facilities.replace(/\[|\]/g, "");
        } else {
          facilitiesdata = "0";
        }
        categorydata8 = await water_supply_treatment_categoryDetailsemission(
          facilitiesdata,
          year
        );
        if (categorydata8) {
          await Promise.all(
            categorydata8.map(async (item) => {
              let where1 = ` where G.water_supply_treatment_id = '${item.id}' and G.water_withdrawl !=""  group by G.water_withdrawl `;
              const water_withdrawl = await getSelectedColumn(
                "water_withdrawl_by_source G",
                where1,
                "G.totalwaterwithdrawl,G.water_withdrawl"
              );
              await Promise.all(
                water_withdrawl.map(async (item1) => {
                  water_withdrawlarray.push({
                    water_withdrawl: item1.water_withdrawl,
                    emission: parseFloat(parseFloat(item1.totalwaterwithdrawl).toFixed(3)),
                  });
                })
              );
            })
          );
        }

        const emissionsBywater = water_withdrawlarray.reduce(
          (acc, { emission, water_withdrawl }) => {
            acc[water_withdrawl] = (acc[water_withdrawl] || 0) + emission;
            return acc;
          },
          {}
        );

        let sumtotal3 = sum1 ? parseFloat(sum1).toFixed(3) : 0;
        return res.json({
          success: true,
          message: "Succesfully fetched category",
          totalemssion: sumtotal3,
          series: Object.values(emissionsBywater),
          water_withdrawl: Object.keys(emissionsBywater), //["Surface water","Groundwater","Third party water"," Sea water/ desalinated water", "Others"],
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

exports.dashboardWaterDischargedbydestination = async (req, res) => {
  try {
    const { facilities, year } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facilities: [Joi.string().empty().required()],
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
      let water_dischargearray = [];
      let scopesum = [];
      let categorydata8 = "";
      let sum1 = 0;

      if (facilities) {
        let facilitiesdata = "";
        if (facilities != "0") {
          facilitiesdata = facilities.replace(/\[|\]/g, "");
        } else {
          facilitiesdata = "0";
        }
        categorydata8 = await water_supply_treatment_categoryDetailsemission(
          facilitiesdata,
          year
        );
        if (categorydata8) {
          await Promise.all(
            categorydata8.map(async (item) => {
              let where1 = ` where G.water_supply_treatment_id = '${item.id}' and  G.water_discharge != "" group by G.water_discharge `;
              const water_discharge = await getSelectedColumn(
                "water_discharge_by_destination_only G",
                where1,
                "G.totaldischarge,G.water_discharge"
              );
              await Promise.all(
                water_discharge.map(async (item1) => {
                  water_dischargearray.push({
                    water_discharge: item1.water_discharge,
                    emission: parseFloat(parseFloat(item1.totaldischarge).toFixed(3)),
                  });
                })
              );
            })
          );
        }
        const emissionsBywater = water_dischargearray.reduce(
          (acc, { emission, water_discharge }) => {
            acc[water_discharge] = (acc[water_discharge] || 0) + emission;
            return acc;
          },
          {}
        );

        let sumtotal3 = sum1 ? parseFloat(sum1).toFixed(3) : 0;
        return res.json({
          success: true,
          message: "Succesfully fetched category",
          totalemssion: sumtotal3,
          series: Object.values(emissionsBywater),
          water_discharge: Object.keys(emissionsBywater), //["Surface water","Groundwater","Third party water"," Sea water/ desalinated water", "Others"],
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

exports.dashboardWaterTreatedbydestination = async (req, res) => {
  try {
    const { facilities, year } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facilities: [Joi.string().empty().required()],
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
      let water_dischargearray = [];
      let scopesum = [];
      let categorydata8 = "";
      let sum1 = 0;

      if (facilities) {
        let facilitiesdata = "";
        if (facilities != "0") {
          facilitiesdata = facilities.replace(/\[|\]/g, "");
        } else {
          facilitiesdata = "0";
        }
        categorydata8 = await water_supply_treatment_categoryDetailsemission(
          facilitiesdata,
          year
        );


        if (categorydata8) {
          await Promise.all(
            categorydata8.map(async (item) => {
              let where1 = ` where G.water_supply_treatment_id = '${item.id}' and G.water_discharge != "" group by G.water_discharge `;
              const water_discharge = await getSelectedColumn(
                "water_discharge_by_destination G",
                where1,
                "G.totalwaterdischarge,G.water_discharge"
              );
              await Promise.all(
                water_discharge.map(async (item1) => {
                  water_dischargearray.push({
                    water_discharge: item1.water_discharge,
                    emission: parseFloat(parseFloat(item1.totalwaterdischarge / item.water_treatment).toFixed(3)),
                  });
                })
              );
            })
          );
        }

        const emissionsBywater = water_dischargearray.reduce(
          (acc, { emission, water_discharge }) => {
            acc[water_discharge] = (acc[water_discharge] || 0) + emission;
            return acc;
          },
          {}
        );

        let sumtotal3 = sum1 ? parseFloat(sum1).toFixed(1) : 0;
        return res.json({
          success: true,
          message: "Succesfully fetched category",
          totalemssion: sumtotal3,
          series: Object.values(emissionsBywater),
          water_discharge: Object.keys(emissionsBywater), //["Surface water","Groundwater","Third party water"," Sea water/ desalinated water", "Others"],
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

exports.dashboardWaterTreatedbylevel = async (req, res) => {
  try {
    const { facilities, year } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facilities: [Joi.string().empty().required()],
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
      let water_dischargearray = [];
      let scopesum = [];
      let categorydata8 = "";
      let sum1 = 0;

      if (facilities) {
        let facilitiesdata = "";
        if (facilities != "0") {
          facilitiesdata = facilities.replace(/\[|\]/g, "");
        } else {
          facilitiesdata = "0";
        }
        categorydata8 = await water_supply_treatment_categoryDetailsemission(
          facilitiesdata,
          year
        );
        if (categorydata8) {
          await Promise.all(
            categorydata8.map(async (item) => {
              let where1 = ` where G.water_supply_treatment_id = '${item.id}' and G.leveloftreatment  != "" group by G.leveloftreatment `;
              const water_discharge = await getSelectedColumn(
                "water_discharge_by_destination G",
                where1,
                "SUM(G.totalwaterdischarge) as sum,G.leveloftreatment"
              );
              await Promise.all(
                water_discharge.map(async (item1) => {
                  sum1 += parseFloat(item1.sum);
                  scopesum.push(parseFloat(parseFloat(item1.sum).toFixed(3)));

                  water_dischargearray.push({
                    leveloftreatment: item1.leveloftreatment,
                    emission: parseFloat(parseFloat(item1.sum).toFixed(3)),
                  });
                })
              );
            })
          );
        }

        const emissionsBywater = water_dischargearray.reduce(
          (acc, { emission, leveloftreatment }) => {
            acc[leveloftreatment] = (acc[leveloftreatment] || 0) + emission;
            return acc;
          },
          {}
        );

        let sumtotal3 = sum1 ? parseFloat(sum1).toFixed(1) : 0;
        return res.json({
          success: true,
          message: "Succesfully fetched category",
          totalemssion: sumtotal3,
          series: Object.values(emissionsBywater),
          leveloftreatment: Object.keys(emissionsBywater), //["Surface water","Groundwater","Third party water"," Sea water/ desalinated water", "Others"],
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

exports.dashboardWaterEmission = async (req, res) => {
  try {
    const { facilities, year } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facilities: [Joi.string().empty().required()],
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
      let categorydata15 = "";
      let sum1 = 0;
      let sum2 = 0;
      let sum3 = 0;
      let totaltreated = 0;

      let totalwaterwithdrawl = 0;
      let totalwaterwithdrawlpercent = 0;
      let totalwatertreatedpercent = 0;
      let array = [];
      if (facilities) {
        let facilitiesdata = "";
        if (facilities != "0") {
          facilitiesdata = facilities.replace(/\[|\]/g, "");
        } else {
          facilitiesdata = "0";
        }

        let where2 = ' where id = "2" ';
        const unitvalue = await getSelectedColumn(
          "water_supply_treatment_type",
          where2,
          "*"
        );

        let where = ' where id = "1" ';
        const unitvalue2 = await getSelectedColumn(
          "water_supply_treatment_type",
          where,
          "*"
        );

        categorydata15 = await water_supply_treatment_categoryDetailsemission(
          facilitiesdata,
          year
        );

        if (categorydata15) {
          await Promise.all(
            categorydata15.map(async (item) => {
              totalwaterwithdrawlpercent += parseFloat(item.withdrawn_emission ?? 0);
              totalwatertreatedpercent += parseFloat(item.treatment_emission ?? 0);
            })
          );
        }


        let water_treated = parseFloat(totalwatertreatedpercent / 1000).toFixed(4);
        let water_wiitdrawn = parseFloat(totalwaterwithdrawlpercent / 1000).toFixed(4);
        array.push(parseFloat(water_wiitdrawn), parseFloat(water_treated));
        const sum = array.reduce((acc, curr) => acc + curr, 0);

        return res.json({
          success: true,
          message: "Succesfully fetched category",
          total_emssion: sum,
          water_treated_wiitdrawn: array,
          category: [
            "Emissions in water withdrawn",
            "Emissions in water treatment",
          ],
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

exports.dashboardWaterTreated_nonTreated = async (req, res) => {
  try {
    const { facilities, year } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facilities: [Joi.string().empty().required()],
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
      let treatmentpercent = 0;
      let notreatmentpercent = 0;
      let array = [];
      if (facilities) {
        let facilitiesdata = "";
        if (facilities != "0") {
          facilitiesdata = facilities.replace(/\[|\]/g, "");
        } else {
          facilitiesdata = "0";
        }
        categorydata15 = await water_supply_treatment_categoryDetailsemission(
          facilitiesdata,
          year
        );

        if (categorydata15) {
          await Promise.all(
            categorydata15.map(async (item) => {
              treatmentpercent += parseFloat(item.water_treated ? item.water_treated : 0);
              notreatmentpercent += parseFloat(item.water_non_treated ? item.water_non_treated : 0);
            })
          );
        }

        array.push(parseFloat(treatmentpercent), parseFloat(notreatmentpercent));
        const sum = array.reduce((acc, curr) => acc + curr, 0);

        return res.json({
          success: true,
          message: "Succesfully fetched category",
          total_emssion: sum,
          water_treated_nontreated: array,
          category: ["Treated", "Non - Treated"],
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

exports.dashboardenergyConsumption = async (req, res) => {
  try {
    const { facilities, year } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facilities: [Joi.string().empty().required()],
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
      let array1 = [];

      let categorydata,
        categorydata2,
        categorydata3,
        categorydata4 = "";
      let sum = 0;
      let sum1 = 0;
      let sum2 = 0;
      if (facilities) {
        let facilitiesdata = "";
        if (facilities != "0") {
          facilitiesdata = facilities.replace(/\[|\]/g, "");
        } else {
          facilitiesdata = "0";
        }
        categorydata = await getscope1CombustionEmissionDetail(
          facilitiesdata,
          year,
          1
        );

        categorydata2 = await getscope1CombustionEmissionDetail(
          facilitiesdata,
          year,
          2
        );

        categorydata3 = await getscope1CombustionEmissionDetail(
          facilitiesdata,
          year,
          3
        );

        categorydata4 = await getscope1CombustionEmissionDetail(
          facilitiesdata,
          year,
          4
        );
      };



      let totalsum = categorydata[0].emission
        ? parseFloat(categorydata[0].emission / 1000).toFixed(3)
        : 0;
      let totalsum1 = categorydata2[0].emission
        ? parseFloat(categorydata2[0].emission / 1000).toFixed(3)
        : 0;
      let totalsum2 = categorydata3[0].emission
        ? parseFloat(categorydata3[0].emission / 1000).toFixed(3)
        : 0;
      let totalsum3 = categorydata4[0].emission
        ? parseFloat(categorydata4[0].emission / 1000).toFixed(3)
        : 0;

      let sumtotal1 = parseFloat(totalsum + totalsum1 + totalsum2 + totalsum3);

      return res.json({
        success: true,
        message: "Succesfully fetched category",
        totalEmssion: sumtotal1,
        flueType: [
          parseFloat(totalsum),
          parseFloat(totalsum1),
          parseFloat(totalsum2),
          parseFloat(totalsum3),
        ],
        series: ["Liquid", "Gas", "Solid", "Bioenergy"],
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

exports.dashboardenergyConsumptionRenewable = async (req, res) => {
  try {
    const { facilities, year } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facilities: [Joi.string().empty().required()],
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
      let categorydata, categorydata2;

      if (facilities) {
        let facilitiesdata = "";
        if (facilities != "0") {
          facilitiesdata = facilities.replace(/\[|\]/g, "");
        } else {
          facilitiesdata = "0";
        }
        categorydata = await getAllelectricityDetail(
          facilitiesdata,
          year,
          1002
        );
        categorydata2 = await getAllelectricityDetail(facilitiesdata, year, 2);
      }

      let totalsum = categorydata[0].emission
        ? parseFloat(categorydata[0].emission / 1000).toFixed(3)
        : 0;
      let totalsum1 = categorydata2[0].emission
        ? parseFloat(categorydata2[0].emission / 1000).toFixed(3)
        : 0;

      let sumtotal1 = parseFloat(totalsum + totalsum1);

      return res.json({
        success: true,
        message: "Succesfully fetched category",
        totalEmssion: sumtotal1,
        renewable: [parseFloat(totalsum), parseFloat(totalsum1)],
        series: ["Renewable", "Non-Renewable"],
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

exports.dashboardenergyConsumptionWellTank = async (req, res) => {
  try {
    const { facilities, year } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facilities: [Joi.string().empty().required()],
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
      let categorydata,
        categorydata2,
        categorydata3,
        categorydata4,
        categorydata5 = "";

      if (facilities) {
        let facilitiesdata = "";
        if (facilities != "0") {
          facilitiesdata = facilities.replace(/\[|\]/g, "");
        } else {
          facilitiesdata = "0";
        }
        categorydata = await getCombustionEmissionDetail(
          facilitiesdata,
          year,
          1
        );

        categorydata2 = await getCombustionEmissionDetail(
          facilitiesdata,
          year,
          2
        );

        categorydata3 = await getCombustionEmissionDetail(
          facilitiesdata,
          year,
          3
        );

        categorydata4 = await getCombustionEmissionDetail(
          facilitiesdata,
          year,
          4
        );

        /*categorydata5 = await getAllelectricityDetailByCat(
            facilitiesdata,
          year
        );*/

        categorydata5 = await getCombustionEmissionDetailFixed(
          facilitiesdata,
          year
        );
      }

      let totalsum = categorydata[0].emission
        ? parseFloat(categorydata[0].emission / 1000).toFixed(3)
        : 0;
      let totalsum1 = categorydata2[0].emission
        ? parseFloat(categorydata2[0].emission / 1000).toFixed(3)
        : 0;
      let totalsum2 = categorydata3[0].emission
        ? parseFloat(categorydata3[0].emission / 1000).toFixed(3)
        : 0;
      let totalsum3 = categorydata4[0].emission
        ? parseFloat(categorydata4[0].emission / 1000).toFixed(3)
        : 0;

      let totalsum4 = categorydata5[0].emission
        ? parseFloat(categorydata5[0].emission / 1000).toFixed(3)
        : 0;

      let sumtotal1 = parseFloat(totalsum + totalsum1 + totalsum2 + totalsum3);
      let sumtotal2 = parseFloat(
        totalsum + totalsum1 + totalsum2 + totalsum3 + totalsum4
      );
      return res.json({
        success: true,
        message: "Succesfully fetched category",
        totalEmssion: sumtotal2,
        energyinuse: [sumtotal1, parseFloat(totalsum4)],
        series: ["Well to Tank Emissions", "Emissions in Energy Use"],
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

exports.dashboardenergyConsumptionMonth = async (req, res) => {
  try {
    const { facilities, year } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facilities: [Joi.string().empty().required()],
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

      let finalyear = "";
      let finalyeardata = "2";
      let where = ` where user_id = '${user_id}'`;
      const financialyear = await getSelectedColumn(
        "financial_year_setting",
        where,
        "*"
      );
      if (financialyear.length > 0) {
        let final_year = financialyear[0].financial_year;
        if (final_year == "2") {
          finalyear = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          finalyeardata = "2";
        } else {
          finalyear = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          finalyeardata = "1";
        }
      } else {
        finalyear = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        finalyeardata = "2";
      }

      let month = finalyear;
      let monthlyData = {};
      let monthlyData1 = {};
      let monthlyData2 = {};
      month.forEach((month) => {
        monthlyData[month] = 0;
        monthlyData1[month] = 0; // Initialize all months with emission of 0
        monthlyData2[month] = 0;
      });

      let scope1month = [];
      let scope1 = [];
      let scope2month = [];
      let scope3month = [];
      let scope2 = [];
      let scope3 = [];

      let categorydata,
        categorydata5 = "";
      let sum = 0;
      let sum1 = 0;

      if (facilities) {
        let facilitiesdata = "";
        if (facilities != "0") {
          facilitiesdata = facilities.replace(/\[|\]/g, "");
        } else {
          facilitiesdata = "0";
        }

        categorydata = await getCombustionEmission(
          facilitiesdata,
          year,
          finalyeardata
        );

        if (categorydata) {
          await Promise.all(
            categorydata.map(async (item) => {
              if (
                item.month_number &&
                monthlyData.hasOwnProperty(item.month_number)
              ) {
                sum += parseFloat(item.emission);
                monthlyData[item.month_number] += parseFloat(item.emission); // Add emission value to the corresponding month
              }
            })
          );

          scope1month.push(Object.keys(monthlyData));
          scope1.push(
            Object.values(monthlyData).map((num) =>
              parseFloat(num / 1000).toFixed(3)
            )
          );
        }
        categorydata5 = await getAllelectricity(
          facilitiesdata,
          year,
          finalyeardata
        );

        if (categorydata5) {
          await Promise.all(
            categorydata5.map(async (item) => {
              if (
                item.month_number &&
                monthlyData1.hasOwnProperty(item.month_number)
              ) {
                monthlyData1[item.month_number] += parseFloat(item.emission);
                let emissionFixed = parseFloat(item.emission);
                sum1 += emissionFixed;
                // Add emission value to the corresponding month
              }
            })
          );
          scope2month.push(Object.keys(monthlyData1));
          scope2.push(
            Object.values(monthlyData1).map((num) =>
              parseFloat(num / 1000).toFixed(3)
            )
          );
        }

        let categorydata3 = [...categorydata, ...categorydata5];

        let sum3 = 0;
        if (categorydata3) {
          await Promise.all(
            categorydata3.map(async (item) => {
              if (
                item.month_number &&
                monthlyData2.hasOwnProperty(item.month_number)
              ) {
                //monthlyData1[item.month_number] += parseFloat(item.emission);
                //let emissionFixed = parseFloat(item.emission);
                //sum3 += emissionFixed;
                monthlyData2[item.month_number] += parseFloat(
                  item?.scope3_emission ? item?.scope3_emission : 0
                );
                let emissionFixed = parseFloat(
                  item?.scope3_emission ? item?.scope3_emission : 0
                );
                sum3 += emissionFixed;

                // Add emission value to the corresponding month
              }
            })
          );
          scope3month.push(Object.keys(monthlyData2));
          scope3.push(
            Object.values(monthlyData2).map((num) =>
              parseFloat(num / 1000).toFixed(3)
            )
          );
        }

        let series = [
          { name: "Stationary Combustion", data: scope1[0] },
          { name: "Electricity used", data: scope2[0] },
          { name: "Well to Tank", data: scope3[0] },
        ];
        let sumtotal1 = sum ? parseFloat(sum.toFixed(1)) : 0;
        let sumtotal2 = sum1 ? parseFloat(sum1.toFixed(1)) : 0;
        let sumtotal3 = sum3 ? parseFloat(sum3.toFixed(1)) : 0;

        return res.json({
          success: true,
          message: "Succesfully fetched category",
          scope1: sumtotal1,
          scope2: sumtotal2,
          scope3: sumtotal3,
          series: series,
          series_graph: [sumtotal1, sumtotal2, sumtotal3],
          month: month,
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

exports.dashboardWasteBreakdown = async (req, res) => {
  try {
    const { facilities, year } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facilities: [Joi.string().empty().required()],
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
      let month = [
        "Reuse",
        "Open-Loop Recycling",
        "Closed-Loop Recycling",
        "Composting",
      ];
      let monthlyData = {};
      let monthlyData1 = {};
      let monthlyData2 = {};
      month.forEach((month) => {
        monthlyData[month] = 0;
        monthlyData1[month] = 0; // Initialize all months with emission of 0
        monthlyData2[month] = 0;
      });

      let array3 = [];
      let scope3month = [];

      let scope3 = [];

      let categorydata8 = "";
      let sum2 = 0;
      if (facilities) {
        let facilitiesdata = "";
        if (facilities != "0") {
          facilitiesdata = facilities.replace(/\[|\]/g, "");
        } else {
          facilitiesdata = "0";
        }

        let waste1 = await waste_generated_emissionsDetailsEmssionByMethod(
          facilitiesdata,
          year,
          "reuse"
        );

        let waste2 = await waste_generated_emissionsDetailsEmssionByMethod(
          facilitiesdata,
          year,
          "composting"
        );

        let waste3 = await waste_generated_emissionsDetailsEmssionByloop(
          facilitiesdata,
          year,
          "1"
        );

        let waste4 = await waste_generated_emissionsDetailsEmssionByloop(
          facilitiesdata,
          year,
          "2"
        );

        let sumreuse = waste1[0]["emission"]
          ? parseFloat(waste1[0]["emission"])
          : 0;

        let openloop = waste3[0]["emission"]
          ? parseFloat(waste3[0]["emission"])
          : 0;

        let closeloop = waste4[0]["emission"]
          ? parseFloat(waste4[0]["emission"])
          : 0;

        let sumcomposting = waste2[0]["emission"]
          ? parseFloat(waste2[0]["emission"])
          : 0;

        array3.push(sumreuse, openloop, closeloop, sumcomposting);

        const sumtotal3 = array3.reduce((acc, curr) => acc + curr, 0);

        return res.json({
          success: true,
          message: "Succesfully fetched category",
          totalemssion: parseFloat(sumtotal3.toFixed(3)),
          series: [
            parseFloat(sumreuse.toFixed(3)),
            parseFloat(openloop.toFixed(3)),
            parseFloat(closeloop.toFixed(3)),
            parseFloat(sumcomposting?.toFixed(3)),
          ],
          hazardousmonth: month,
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

exports.dashboardnetZero = async (req, res) => {
  try {
    const { facilities, year } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facilities: [Joi.string().empty().required()],
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
      let month = ["Emissions", "Offset", "Reducted and Avoided Emissions"];
      let monthlyData = {};
      let monthlyData1 = {};
      let monthlyData2 = {};
      month.forEach((month) => {
        monthlyData[month] = 0;
        monthlyData1[month] = 0; // Initialize all months with emission of 0
        monthlyData2[month] = 0;
      });

      let array1 = [];
      let scope3month = [];

      let scope3 = [];
      const user_id = req.user.user_id;
      let categorydata8 = "";
      let sum2 = 0;
      if (facilities) {
        let facilitiesdata = "";
        if (facilities != "0") {
          facilitiesdata = facilities.replace(/\[|\]/g, "");
        } else {
          facilitiesdata = "0";
        }
        let categorydata,
          categorydata2,
          categorydata3,
          categorydata4,
          categorydata5,
          categorydata6,
          categorydata7,
          categorydata8,
          categorydata9,
          categorydata10,
          categorydata11,
          categorydata12,
          categorydata13,
          categorydata14,
          categorydata15,
          categorydata16,
          categorydata17,
          categorydata18,
          categorydata19,
          categorydata20,
          categorydata21 = "";
        let sum1 = 0;
        let sum3 = 0;
        let sum2 = 0;

        categorydata = await getCombustionEmission(facilitiesdata, year);
        categorydata2 = await Allrefrigerants(facilitiesdata, year);
        categorydata3 = await Allfireextinguisher(facilitiesdata, year);
        categorydata4 = await getAllcompanyownedvehicles(facilitiesdata, year);

        categorydata5 = await getAllelectricity(facilitiesdata, year);
        categorydata6 = await getAllheatandsteam(facilitiesdata, year);

        categorydata7 = await purchaseGoodsDetails(facilitiesdata, year);
        categorydata8 = await flight_travelDetails(facilitiesdata, year);
        let hotelstayDetails = await hotel_stayDetails(facilitiesdata, year);
        let othermodes_of_transportDetails =
          await other_modes_of_transportDetails(facilitiesdata, year);

        categorydata9 = await processing_of_sold_products_categoryDetails(
          facilitiesdata,
          year
        );
        categorydata10 = await sold_product_categoryDetails(
          facilitiesdata,
          year
        );
        categorydata11 = await endoflife_waste_typeDetails(
          facilitiesdata,
          year
        );
        categorydata12 = await water_supply_treatment_categoryDetails(
          facilitiesdata,
          year
        );

        categorydata13 = await employee_commuting_categoryDetails(
          facilitiesdata,
          year
        );
        categorydata14 = await homeoffice_categoryDetails(facilitiesdata, year);
        categorydata15 = await waste_generated_emissionsDetails(
          facilitiesdata,
          year
        );

        categorydata16 = await upstreamLease_emissionDetails(
          facilitiesdata,
          year
        );
        categorydata17 = await downstreamLease_emissionDetails(
          facilitiesdata,
          year
        );
        categorydata18 = await franchise_categories_emissionDetails(
          facilitiesdata,
          year
        );
        categorydata19 = await investment_emissionsDetails(
          facilitiesdata,
          year
        );

        categorydata20 = await upstream_vehicle_storage_emissions(
          facilitiesdata,
          year
        );
        categorydata21 = await downstream_vehicle_storage_emissions(
          facilitiesdata,
          year
        );

        array1.push(
          ...categorydata,
          ...categorydata2,
          ...categorydata3,
          ...categorydata3,
          ...categorydata4,
          ...categorydata5,
          ...categorydata6,
          ...categorydata7,
          ...categorydata8,
          ...hotelstayDetails,
          ...othermodes_of_transportDetails,
          ...categorydata9,
          ...categorydata10,
          ...categorydata11,
          ...categorydata12,
          ...categorydata13,
          ...categorydata14,
          ...categorydata15,
          ...categorydata16,
          ...categorydata17,
          ...categorydata18,
          ...categorydata19,
          ...categorydata20,
          ...categorydata21
        );

        await Promise.all(
          array1.map(async (item) => {
            sum1 += parseFloat(item.emission);
          })
        );

        let offset_emission = await offsetemission(user_id);
        if (offset_emission) {
          await Promise.all(
            offset_emission.map(async (item) => {
              sum2 += parseFloat(item.offset);
            })
          );
        }

        let actions_emission = await actionsEmission(user_id);
        if (actions_emission) {
          await Promise.all(
            actions_emission.map(async (item) => {
              sum3 += parseFloat(item.emission);
            })
          );
        }

        let total = sum1 + sum2 + sum3;

        return res.json({
          success: true,
          message: "Succesfully fetched category",
          totalemssion: parseFloat(parseFloat(total / 1000).toFixed(3)),
          series: [
            parseFloat(parseFloat(sum1 / 1000).toFixed(2)),
            parseFloat(parseFloat(sum2 / 1000).toFixed(2)),
            parseFloat(parseFloat(sum3 / 1000).toFixed(2)),
          ],
          hazardousmonth: month,
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

exports.dashboardCostcentreBreakdown = async (req, res) => {
  try {
    const { facilities, year } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facilities: [Joi.string().empty().required()],
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

      if (facilities) {
        let facilitiesdata = "";
        if (facilities != "0") {
          facilitiesdata = facilities.replace(/\[|\]/g, "");
        } else {
          facilitiesdata = "0";
        }
        let arraycost = [];
        let seriesdata = [];
        let costcenter = await costcenterData_emission(user_id);
        let sum = 0;

        await Promise.all(
          costcenter.map(async (item) => {
            console.log(item);
            let emssiondata = await emssionBycostcenter(
              facilities,
              year,
              item.cost_center_name
            );

            if (emssiondata.length > 0) {
              let ef = emssiondata[0].emission
                ? parseFloat(emssiondata[0].emission / 1000)
                : 0;
              sum += ef;
              seriesdata.push(parseFloat(parseFloat(ef).toFixed(3)));
            } else {
              seriesdata.push(0);
            }
            arraycost.push(item.cost_center_name);
          })
        );

        console.log(sum);

        return res.json({
          success: true,
          message: "Succesfully fetched category",
          totalemssion: parseFloat(sum.toFixed(3)),
          series: seriesdata,
          cost_center: arraycost,
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

exports.getdashboardfacilitiessubgroup = async (req, res) => {
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
        status: 200,
        success: false,
      });
    } else {
      let facilities = "";
      let othersubGroups = "";

      //  If tenandId is present in group if condition will run
      // where1 =
      //   ' where G.tenantID = "' +
      //   tenantID +
      //   '" AND ( (is_subgroup = 1  OR is_main_group = 1) OR G.group_by = 2)';
      // const groupmap = await getSelectedColumn(
      //   "`dbo.group` G",
      //   where1,
      //   " G.groupname as AssestName,G.tenantID,G.id,G.is_subgroup,G.group_by"
      // );
      // if (groupmap.length > 0) {
      //   console.log(groupmap, "groupmapgroupmapgroupmap11111");
      //   await Promise.all(
      //     groupmap.map(async (item) => {
      //       let where1 = "";
      //       if (item.is_subgroup == 1) {
      //         where1 = ' where G.sub_group_id = "' + item.id + '"';
      //       } else {
      //         where1 = ' where G.groupId = "' + item.id + '"';
      //       }

      //       console.log(where1, "groupmapgroupmap");
      //       const groupmap = await getSelectedColumn(
      //         "`dbo.groupmapping` G",
      //         where1,
      //         " G.facilityId,G.sub_group_id"
      //       );
      //       item.name = item.AssestName;

      //       item.ID = groupmap?.map((item) =>
      //         String(item.facilityId ? item.facilityId : item.sub_group_id)
      //       );
      //     })
      //   );

      //   let array = [...groupmap];

      //   return res.json({
      //     success: true,
      //     message: "Succesfully fetched facilities",
      //     categories: array,
      //     status: 200,
      //   });
      // } else {
      //   let where1 = " where  A.tenant_id = '" + tenantID + "'";
      //   const rolesdata = await getSelectedColumn(
      //     "`dbo.aspnetuserroles` A ",
      //     where1,
      //     "A.group_id, A.tenantID"
      //   );

      //   let where2 =
      //     " LEFT JOIN `dbo.country` C ON  C.ID = F.country_id  where  F.tenantID = '" +
      //     rolesdata[0].tenantID +
      //     "' ";
      //   let subGroups = await getSelectedColumn(
      //     "`dbo.group` F ",
      //     where2,
      //     "F.id ,F.country_id,F.is_main_group,F.groupname as name,F.tenantID,C.Name as country_name,F.is_subgroup,F.group_by"
      //   );
      //   if (subGroups.length > 0) {
      //     if (subGroups[0].is_main_group == 1) {
      //       let where3 =
      //         " LEFT JOIN `dbo.country` C ON  C.ID = F.country_id  where  F.member_group_id = '" +
      //         rolesdata[0].group_id +
      //         "'";
      //       othersubGroups = await getSelectedColumn(
      //         "`dbo.group` F ",
      //         where3,
      //         "F.id ,F.country_id,F.is_main_group,F.groupname as AssestName,F.tenantID,C.Name as country_name ,F.is_subgroup,F.group_by"
      //       );

      //       if (othersubGroups.length > 0) {
      //         console.log(othersubGroups, "othersubGroups");
      //         await Promise.all(
      //           othersubGroups.map(async (item) => {
      //             let where1 = "";
      //             if (item.is_subgroup == 1) {
      //               where1 = ' where G.sub_group_id = "' + item.id + '"';
      //             } else {
      //               where1 = ' where G.groupId = "' + item.id + '"';
      //             }

      //             console.log(where1, "groupmapgroupmap");
      //             const groupmap = await getSelectedColumn(
      //               "`dbo.groupmapping` G",
      //               where1,
      //               " G.facilityId,G.sub_group_id"
      //             );
      //             item.name = item.AssestName;

      //             item.ID = groupmap?.map((item) =>
      //               String(
      //                 item.facilityId ? item.facilityId : item.sub_group_id
      //               )
      //             );
      //           })
      //         );

      //         let array = [...othersubGroups, ...subGroups];

      //         return res.json({
      //           success: true,
      //           message: "Succesfully fetched facilities",
      //           categories: array,
      //           status: 200,
      //         });
      //       } else {
      //         return res.json({
      //           success: false,
      //           message: "Data not found",
      //           categories: "",
      //           status: 200,
      //         });
      //       }
      //     } else {
      //       let where3 =
      //         " LEFT JOIN `dbo.country` C ON  C.ID = F.country_id  where  F.id = '" +
      //         subGroups[0].id +
      //         "'";
      //       othersubGroups = await getSelectedColumn(
      //         "`dbo.group` F ",
      //         where3,
      //         "F.id ,F.country_id,F.is_main_group,F.groupname as AssestName,F.tenantID,C.Name as country_name ,F.is_subgroup,F.group_by"
      //       );

      //       if (othersubGroups.length > 0) {
      //         console.log(othersubGroups, "othersubGroups");
      //         await Promise.all(
      //           othersubGroups.map(async (item) => {
      //             let where1 = "";
      //             if (item.is_subgroup == 1) {
      //               where1 = ' where G.sub_group_id = "' + item.id + '"';
      //             } else {
      //               where1 = ' where G.groupId = "' + item.id + '"';
      //             }

      //             console.log(where1, "groupmapgroupmap");
      //             const groupmap = await getSelectedColumn(
      //               "`dbo.groupmapping` G",
      //               where1,
      //               " G.facilityId,G.sub_group_id"
      //             );
      //             item.name = item.AssestName;

      //             item.ID = groupmap?.map((item) =>
      //               String(
      //                 item.facilityId ? item.facilityId : item.sub_group_id
      //               )
      //             );
      //           })
      //         );

      //         let array = [...othersubGroups];

      //         return res.json({
      //           success: true,
      //           message: "Succesfully fetched facilities",
      //           categories: array,
      //           status: 200,
      //         });
      //       } else {
      //         return res.json({
      //           success: false,
      //           message: "Data not found",
      //           categories: "",
      //           status: 200,
      //         });
      //       }
      //     }
      //   } else {
      //     return res.json({
      //       success: false,
      //       message: "Data not found",
      //       categories: "",
      //       status: 200,
      //     });
      //   }
      // }

      let where1 =
        'LEFT JOIN `dbo.group` AS G ON G.tenantID = A.tenantID where A.tenant_id = "' +
        tenantID + '" ORDER BY G.is_main_group DESC';
      const groupmap = await getSelectedColumn("`dbo.aspnetuserroles` A", where1, "G.groupname as AssestName,G.tenantID,G.id, G.is_subgroup, G.is_main_group, G.group_by"
      );
      if (groupmap.length > 0) {
        await Promise.all(
          groupmap.map(async (item) => {
            var groupmap1 = [];
            if (item.group_by == 2) {
              item.name = item.AssestName;
              let where1 = ' where G.groupId = "' + item.id + '"';
              groupmap1 = await getSelectedColumn(
                "`dbo.groupmapping` G",
                where1,
                " G.sub_group_id"
              );
              item.ID = groupmap1?.map((item) => String(item.sub_group_id));
            } else {
              item.name = item.AssestName;
              item.ID = []
            }
          })
        );
      }
      let array = [...groupmap];
      if (array) {
        return res.json({
          success: true,
          message: "Succesfully fetched facilities",
          categories: array,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "data not found!",
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

exports.getFacilityByTenantIdMainGroup = async (req, res) => {
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
      // let where11 =
      //   ' where G.tenantID = "' +
      //   tenantID +
      //   '" and (is_subgroup = 0 AND is_main_group = 0 AND group_by =0) ';
      // const facilities = await getSelectedColumn(
      //   "`dbo.group` G",
      //   where11,
      //   " G.groupname as AssestName,G.tenantID,G.id"
      // );

      // if (facilities.length > 0) {
      //   await Promise.all(
      //     facilities.map(async (item) => {
      //       item.name = item.AssestName;
      //       let where1 = ' where G.groupId = "' + item.id + '"';
      //       const groupmap = await getSelectedColumn(
      //         "`dbo.groupmapping` G",
      //         where1,
      //         " G.facilityId"
      //       );

      //       item.ID = groupmap?.map((item) => String(item.facilityId));
      //     })
      //   );
      // }

      let where1 =
        'LEFT JOIN `dbo.group` AS G ON G.tenantID = A.tenantID where A.tenant_id = "' +
        tenantID +
        '" and (G.is_subgroup =1 or G.is_main_group=1)';
      const groupmap = await getSelectedColumn(
        "`dbo.aspnetuserroles` A",
        where1,
        " G.groupname as AssestName,G.tenantID,G.id, G.is_subgroup, G.is_main_group"
      );

      if (groupmap.length > 0) {
        await Promise.all(
          groupmap.map(async (item) => {
            var groupmap1 = [];
            if (item.is_main_group == 1) {
              item.name = item.AssestName;
              let where1 = ' where G.groupId = "' + item.id + '"';
              groupmap1 = await getSelectedColumn(
                "`dbo.groupmapping` G",
                where1,
                " G.facilityId"
              );
            }
            else {
              item.name = item.AssestName;
              let where1 = ' where G.sub_group_id = "' + item.id + '"';
              groupmap1 = await getSelectedColumn(
                "`dbo.groupmapping` G",
                where1,
                " G.facilityId"
              );
            }
            item.ID = groupmap1?.map((item) => String(item.facilityId));
          })
        );
      }
      let array = [...groupmap];

      if (array) {
        return res.json({
          success: true,
          message: "Succesfully fetched facilities",
          categories: array,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "data not found!",
          status: 200,
        });
      }

      // let facilities = "";

      //  facilities =  await fetchfacilitiesBytenants(tenantID);

      // if(facilities[0].facilityID == 0){
      //   let where = "  where  F.TenantID = '"+tenantID+"'";
      //   facilities = await getSelectedColumn("`dbo.facilities` F ",where,"F.ID as facilityID ,F.AssestName as name" );
      //  }

      // let array = [];
      // await Promise.all(
      //   facilities.map(async (item) => {
      //      let where = "  where  F.ID = '"+item.facilityID+"'";
      //     const facilities1 = await getSelectedColumn("`dbo.facilities` F ",where,"F.ID as id ,F.AssestName as name" );

      //     await Promise.all(facilities1.map(async (item1) => {
      //           array.push(item1)
      //        }));

      //   }));

      // if (array.length > 0) {
      // return res.json(array);
      // } else {
      // return res.json({
      //     success: false,
      //     message: "Some problem occured while selecting facilities",
      //     status: 400,
      // });
      // }
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

exports.getFacilityGroupsByTenantIdAdmin = async (req, res) => {
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
      // let where11 =
      //   ' where G.tenantID = "' + tenantID + '" and is_subgroup = 0';
      // const facilities = await getSelectedColumn(
      //   "`dbo.group` G",
      //   where11,
      //   " G.groupname as AssestName,G.tenantID,G.id"
      // );

      // if (facilities.length > 0) {
      //   await Promise.all(
      //     facilities.map(async (item) => {
      //       item.name = item.AssestName;
      //       let where1 = ' where G.groupId = "' + item.id + '"';
      //       const groupmap = await getSelectedColumn(
      //         "`dbo.groupmapping` G",
      //         where1,
      //         " G.facilityId"
      //       );

      //       item.ID = groupmap?.map((item) => String(item.facilityId));
      //     })
      //   );
      // }
      let where1 = 'LEFT JOIN `dbo.group` AS G ON G.tenantID = A.tenantID where A.tenant_id = "' + tenantID + '" and (G.is_subgroup =1 or G.is_main_group=1)';
      const groupmap = await getSelectedColumn(
        "`dbo.aspnetuserroles` A",
        where1,
        " G.groupname as AssestName,G.tenantID,G.id, G.is_subgroup, G.is_main_group"
      );
      console.log(groupmap);
      if (groupmap.length > 0) {
        await Promise.all(
          groupmap.map(async (item) => {
            var groupmap1 = [];
            if (item.is_main_group == 1) {
              item.name = item.AssestName;
              let where1 = ' where G.groupId = "' + item.id + '"';
              groupmap1 = await getSelectedColumn(
                "`dbo.groupmapping` G",
                where1,
                " G.facilityId"
              );
            }
            else {
              item.name = item.AssestName;
              let where1 = ' where G.sub_group_id = "' + item.id + '"';
              groupmap1 = await getSelectedColumn(
                "`dbo.groupmapping` G",
                where1,
                " G.facilityId"
              );
            }
            item.ID = groupmap1?.map((item) => String(item.facilityId));
          })
        );
      }
      let array = [...groupmap];

      if (array) {
        return res.json(array);
      } else {
        return res.json({
          success: false,
          message: "data not found!",
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

exports.financedashboardemission = async (req, res) => {
  try {
    const { sub_group_id, year } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        sub_group_id: [Joi.string().empty().required()],
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
      let array3 = [];

      //  if(facilities){
      let facilitiesdata = "";

      if (sub_group_id != "0") {
        facilitiesdata = sub_group_id.replace(/\[|\]/g, "");
      } else {
        facilitiesdata = "0";
      }

      // investmentEmissionsFinance ------- facilities,year,finalyeardata,investement_type

      let categorydata8 = await investmentEmissionsFinance(
        facilitiesdata,
        year,
        "Debt investments"
      );
      let investement1 = categorydata8[0]?.emission
        ? parseFloat(categorydata8[0].emission / 1000).toFixed(4)
        : 0;

      let categorydata9 = await investmentEmissionsFinance(
        facilitiesdata,
        year,
        "Equity investments"
      );
      let investement2 = categorydata9[0]?.emission
        ? parseFloat(categorydata9[0].emission / 1000).toFixed(4)
        : 0;

      let categorydata10 = await investmentEmissionsFinance(
        facilitiesdata,
        year,
        "Project finance"
      );
      let investement3 = categorydata10[0]?.emission
        ? parseFloat(categorydata10[0].emission / 1000).toFixed(4)
        : 0;

      array3.push(
        parseFloat(investement1),
        parseFloat(investement2),
        parseFloat(investement3)
      );

      const sum =
        parseFloat(investement1) +
        parseFloat(investement2) +
        parseFloat(investement3);
      if (array3) {
        return res.json({
          success: true,
          message: "Succesfully fetched category",
          series: array3,
          categories: ["Debt", "Equity", "Project Finance"],
          totalEmssion: sum,
          status: 200,
        });
      } else {
        return res.json({
          success: false,
          message: "data not found!",
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

exports.financedashboardtop5emission = async (req, res) => {
  try {
    const { sub_group_id, year } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        sub_group_id: [Joi.string().empty().required()],
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
      let array3 = [];
      let array = [];

      let categorydata15 = "";
      let sum1 = 0;
      let sum = 0;

      let facilitiesdata = "";
      if (sub_group_id != "0") {
        facilitiesdata = sub_group_id.replace(/\[|\]/g, "");
      } else {
        facilitiesdata = "0";
      }
      categorydata15 = await investmentAllEmissionsFinance(
        facilitiesdata,
        year
      );
      if (categorydata15) {
        await Promise.all(
          categorydata15.map(async (item) => {
            sum1 = parseFloat(item.emission / 1000);
            array.push({ emission: parseFloat(sum1), industry: item.category });
          })
        );
      }

      array.sort((a, b) => b.emission - a.emission);
      // Select the top 5 emissions
      const top5Emissions = array.slice(0, 5);
      const totalEmission = top5Emissions.reduce(
        (sum, item) => sum + item.emission,
        0
      );

      return res.json({
        success: true,
        message: "Succesfully fetched category",
        //  top5Emissions:formattedEmissions,
        totalEmission: parseFloat(totalEmission).toFixed(3),
        series: Object.values(top5Emissions).map((item) =>
          parseFloat(item.emission).toFixed(4)
        ),
        label: Object.values(top5Emissions).map((item) => item.industry),
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
