const Joi = require("joi");
const config = require("../config");
const xlsx = require("xlsx");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const { checkNUllUnD, checkNUllUnDString } = require("../services/helper");

const {
  fetchVehicleByTypeId,
  uplaodTemplate,
  fetchPurchaseGood,
  fetchEFPurchaseGoods,
  updateEmissionStatus,
  insertFranchiseEmission,
  insertInvestmentEmission, fetchPurchase_categories, fetchPurchase_subcategories, fetchPurchase_categoriesproduct, fetchPurchaseGoodData, findVendorByName, addVendorName, fetchPurchaseGoodCountryData, fetchVendorCountryById,
  fetchVendorCountry,fetchPurchaseGoodDataBulk
} = require("../models/purchasedgood");

const {
  fetchVehicleId,
  fetchVehicleEmission,
  insertDownStreamVehicleStorageEmission,
  insertUpStreamVehicleStorageEmission,
} = require("../models/downstream_trans");

const {
  getSelectedData,
  getData, country_check,
  countryBysubgroup
} = require("../models/common");


async function readExcelFile(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(sheet);
}

exports.getpurchaseproduct_code = async (req, res) => {
  try {

    const purchase_goods = await getData("purchase_goods_product_code", "");
    if (purchase_goods.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched the purchase_goods",
        categories: purchase_goods,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Some problem occured while selecting the purchase_goods",
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

exports.getTypesofpurchase = async (req, res) => {
  try {

    const { product_code_id } = req.params;
    const schema = Joi.alternatives(
      Joi.object({
        product_code_id: [Joi.string().empty().required()],
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

    let where = "";
    where = ` where product_code_id = '${product_code_id}'`;
    const purchase_goods = await getData("`dbo.typesofpurchase`", where);
    if (purchase_goods.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched the purchase_goods",
        categories: purchase_goods,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Some problem occured while selecting the purchase_goods",
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

exports.purchaseGoodsAllcategories = async (req, res) => {
  try {
    const { product_code_id, typeofpurchase,country_id,year } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        product_code_id: [Joi.string().empty().required()],
        typeofpurchase: [Joi.string().empty().required()],
        country_id: [Joi.string().empty().required()],
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
    }

    const purchase_goods = await fetchPurchase_categories(product_code_id, typeofpurchase);
    if (purchase_goods.length > 0) {

      await Promise.all(
        purchase_goods.map(async (item) => {
          const sub_categories = await fetchPurchase_subcategories(product_code_id, typeofpurchase, item.value);

          if (sub_categories.length > 0) {
            item.children = sub_categories

            await Promise.all(
              sub_categories.map(async (item1) => {
                const categoriesproduct = await fetchPurchase_categoriesproduct(product_code_id, typeofpurchase, item1.value, item.value,country_id,year);
                item1.collapsed = true
                item1.checked = false
                if (categoriesproduct.length > 0) {
                  if (product_code_id == 1) {
                    item1.children = categoriesproduct.map(row => ({ collapsed: true, checked: false, text: row.text + ` HSN ${row.HSN_code}`, value: row.value }));
                  } else if (product_code_id == 2) {
                    item1.children = categoriesproduct.map(row => ({ collapsed: true, checked: false, text: row.text + ` NAIC ${row.NAIC_code}`, value: row.value }));
                  } else {
                    item1.children = categoriesproduct.map(row => ({ collapsed: true, checked: false, text: row.text + ` ISIC ${row.ISIC_code}`, value: row.value }));
                  }
                } else {
                  item1.children = []
                }
              }));
          } else {
            item.children = [];
            item.checked = false
          }
          item.collapsed = true
          item.checked = false
        }));

      return res.json({
        success: true,
        message: "Succesfully fetched the purchase_goods",
        categories: purchase_goods,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Some problem occured while selecting the purchase_goods",
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

exports.uploadTemplate = async (req, res) => {
  try {
    const { batch, facilities, year, month } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        batch: [Joi.number().empty().required()],
        facilities: [Joi.string().empty().required()],
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
      console.log(user_id)
      // const user = await getData('`dbo.aspnetusers`',` where  Email= '${token11}'` );
      let data = 0;
      let filename = "";
      if (req.file) {
        const file = req.file;
        filename = file.filename;
        data = await readExcelFile(req.file.path);
      }

      console.log("data>>>>", data);

      // Insert data into the database
      var array = [];
      if (data?.length > 0) {
        await Promise.all(
          data.map(async (item) => {

            let months = JSON.parse(month);
            for (let monthdata of months) {
              if (item["Product Code Standard"] !== '') {
                console.log("print here ")
                const rowData = {
                  businessunit: item["Business Unit"] ? item["Business Unit"] : "",
                  typeofpurchase: item["Type of purchase"]
                    ? item["Type of purchase"]
                    : "",
                  productcode: item["Product Code"] ? item["Product Code"] : "",
                  productcodestandard: item["Product Code Standard"]
                    ? item["Product Code Standard"]
                    : "",
                  productdescription: item["Product Description"]
                    ? item["Product Description"]
                    : "",
                  valuequantity: item["Value / Quantity"]
                    ? item["Value / Quantity"]
                    : "",
                  unit: item["Unit"] ? item["Unit"] : "",
                  supplier: item["Vendor"] ? item["Vendor"] : "",
                  supplierspecificEF: item["Vendor Specific EF"]
                    ? item["Vendor Specific EF"]
                    : "",
                  supplierunit: item["Unit_1"] ? item["Unit_1"] : "",
                  user_id: user_id,
                  batch: batch,
                  status: 'P',
                  facilities: facilities,
                  year: year,
                  month: monthdata

                };
                array.push(rowData);
              }

            }

          })
        );

        if (array.length !== 0) {

          console.log("array", array);
          console.log('aaray lenght', array.length)

          const datainfo = await uplaodTemplate(array);

          return res.json({
            message: "Upload completed successfully.",
            status: 200,
            success: true,
          });
        } else {
          return res.json({
            messgae: "data not found",
            status: 400,
            success: false,
          });
        }
      } else {
        return res.json({
          messgae: "data not found",
          status: 400,
          success: false,
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

exports.getpruchaseProductCode = async (req, res) => {
  try {
    const { product_id } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        product_id: [Joi.string().empty().required()],
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

    let where = "";
    where = ` where id = '${product_id}'`;
    const purchase_goods = await getSelectedData("purchase_goods_categories_ef", where, 'HSN_code');
    if (purchase_goods.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched the purchase_goods",
        categories: purchase_goods,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Some problem occured while selecting the purchase_goods",
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

exports.calculatePurchaseGood = async (req, res) => {
  try {
    const { batch } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        batch: [Joi.number().empty().required()],
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
    var resultGoods = await fetchPurchaseGood(user_id, batch);

    if (resultGoods.length) {
      for (let i = 0; i < resultGoods.length; i++) {
        let item = resultGoods[i];
        var EFDetails = await fetchEFPurchaseGoods(item.productcode);
        if (EFDetails.length > 0) {
          if (EFDetails[0].unit.toUpperCase() === item.unit.toUpperCase()) {
            let emission = item.valuequantity * EFDetails[0].emission_factor;
            const updatedRows = await updateEmissionStatus(
              item.id,
              emission,
              "S"
            );
            if (updatedRows.affectedRows > 0) {
              resultGoods[i].emission = emission;
              resultGoods[i].status = "S";
            } else {
              return res.json({
                success: false,
                message:
                  "Some problem occured during update of status and emission in purchase_goods_categories",
                status: 500,
              });
            }
          } else {
            const updatedRows = await updateEmissionStatus(item.id, "0", "P");
            resultGoods[i].emission = 0;
            resultGoods[i].status = "S";
          }
        } else {
          const updatedRows = await updateEmissionStatus(item.id, "0", "P");
          resultGoods[i].emission = 0;
          resultGoods[i].status = "S";
        }
      }

      //Standard Service Calculation
      standardServices = resultGoods
        .filter(
          (item) =>
            item.typeofpurchase === "Standard Services" && item.status == "S"
        )
        .map((elem) => elem.emission);
      var standardServicesEmmision = 0;
      if (standardServices.length > 0)
        standardServices.forEach(
          (num) => (standardServicesEmmision += Number(num))
        );

      //Planned Service Calculation
      standardGoods = resultGoods
        .filter(
          (item) =>
            item.typeofpurchase === "Standard goods" && item.status == "S"
        )
        .map((elem) => elem.emission);
      var standardGoodsEmission = 0;
      if (standardGoods.length > 0)
        standardGoods.forEach((num) => (standardGoodsEmission += Number(num)));

      //Contract Service Calculation
      capitalGoods = resultGoods
        .filter(
          (item) =>
            item.typeofpurchase === "Capital goods" && item.status == "S"
        )
        .map((elem) => elem.emission);
      var capitalGoodsEmission = 0;
      if (capitalGoods.length > 0)
        capitalGoods.forEach((num) => (capitalGoodsEmission += Number(num)));

      return res.json({
        success: true,
        message: "Emissions Updated Succesfully",
        status: 200,
        resultGoods: resultGoods,
        standardServicesEmmision: standardServicesEmmision,
        standardGoodsEmission: standardGoodsEmission,
        capitalGoodsEmission: capitalGoodsEmission,
      });
    } else {
      return res.json({
        success: false,
        message: "Could not find the batch uploaded by User",
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

exports.purchaseGoods = async (req, res) => {
  try {
    const { facilities, jsonData, is_annual, productcodestandard, year, month } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facilities: [Joi.string().empty().required()],
        jsonData: [Joi.string().empty().required()],
        year: [Joi.string().empty().required()],
        productcodestandard: [Joi.string().empty().required()],
        is_annual: [Joi.string().empty().required()],
        month: [Joi.string().empty().optional().allow("")],
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
      const user_id = req.user.user_id;
      let array = [];


      let countrydata = await country_check(facilities);
      //console.log(countrydata[0].CountryId);
      if (countrydata.length == 0) {
        return res.json({
          success: false,
          message: "EF not Found for this country",
          status: 400,
        });
      }

      const purchasedata = await fetchPurchaseGoodData(user_id, facilities);
      if (purchasedata.length > 0) {

        if (purchasedata[0].is_annual == 1 && purchasedata[0].year == year) {
          return res.json({
            message: "Data Already Exits for this year",
            status: 400,
            success: false,
          });
        }
      }

      let arrrymessgae = [];
      let data = JSON.parse(jsonData);
      if (data?.length > 0) {
        await Promise.all(
          data.map(async (item) => {
            let emission = '';
            let EFVRes;
            if (item.vendorId == "" || item.vendorId == null || item.vendorId == undefined) {
              EFVRes = await fetchPurchaseGoodCountryData(item.product_category, countrydata[0].CountryId);
            } else if (item.vendorspecificEF == "" || item.vendorspecificEF == null || item.vendorspecificEF == undefined) {
              const EFVC = await fetchVendorCountryById(item.vendorId);
              if (EFVC.length > 0) {
                EFVRes = await fetchPurchaseGoodCountryData(item.product_category, countrydata[0].CountryId);
              }
            } else {
              EFVRes = await fetchPurchaseGoodCountryData(item.product_category, countrydata[0].CountryId);
            }

            if (EFVRes.length == 0) {
              arrrymessgae.push("No country found for this EF")
            } else {
              let yearRange = EFVRes[0]?.Fiscal_Year; // The string representing the year range
              let [startYear, endYear] = yearRange.split('-').map(Number);
              console.log(year, startYear, endYear);
              if (year >= startYear && year <= endYear) {
                if (item.unit == 'kg') {
                  emission = item.vendorspecificEF == "" || '' ? EFVRes[0]?.EFkgC02e_kg : item.vendorspecificEF;
                } else if (item.unit == 'tonnes') {
                  emission = item.vendorspecificEF == "" || '' ? EFVRes[0]?.EFkgC02e_tonnes : item.vendorspecificEF;
                } else if (item.unit == 'litres') {
                  emission = item.vendorspecificEF == "" || '' ? EFVRes[0]?.EFkgC02e_litres : item.vendorspecificEF;
                } else {
                  emission = item.vendorspecificEF == "" || '' ? EFVRes[0]?.EFkgC02e_ccy : item.vendorspecificEF;
                }
              } else if (year == startYear) {
                if (item.unit == 'kg') {
                  emission = item.vendorspecificEF == "" || '' ? EFVRes[0]?.EFkgC02e_kg : item.vendorspecificEF;
                } else if (item.unit == 'tonnes') {
                  emission = item.vendorspecificEF == "" || '' ? EFVRes[0]?.EFkgC02e_tonnes : item.vendorspecificEF;
                } else if (item.unit == 'litres') {
                  emission = item.vendorspecificEF == "" || '' ? EFVRes[0]?.EFkgC02e_litres : item.vendorspecificEF;
                } else {
                  emission = item.vendorspecificEF == "" || '' ? EFVRes[0]?.EFkgC02e_ccy : item.vendorspecificEF;
                }
              } else {
                arrrymessgae.push("EF not Found for this year")
              }
            }
            let purchasegoods = "";
            let productcode = "";
            if (item.product_category) {
              where = ` where id = '${item.product_category}'`;
              purchasegoods = await getSelectedData("purchase_goods_categories_ef", where, 'HSN_code');

              productcode = purchasegoods[0]?.HSN_code;
            } else {
              productcode = "";
            }

            if (is_annual == '0') {

              let months = JSON.parse(month);
              for (let monthdata of months) {

                const rowData = {
                  typeofpurchase: item.typeofpurchase ? item.typeofpurchase : "",
                  product_category: item.product_category ? item.product_category : "",
                  is_annual: is_annual ? is_annual : "",
                  productcodestandard: productcodestandard ? productcodestandard : "",
                  productcode: productcode ? productcode : "",
                  valuequantity: item.valuequantity ? item.valuequantity : "",
                  unit: item.unit ? item.unit : "",
                  vendor_id: item.vendorId ? item.vendorId : null,
                  supplier: item.vendor ? item.vendor : null,
                  supplierspecificEF: item.vendorspecificEF ? item.vendorspecificEF : null,
                  supplierunit: item.vendorunit ? item.vendorunit : "",
                  emission: emission ? (emission * item.valuequantity) : 0,
                  emission_factor_used: emission ? emission : 0,
                  FileName: req.file != undefined ? req.file.filename : null,
                  user_id: user_id,
                  status: 'P',
                  facilities: facilities,
                  year: year,
                  month: monthdata
                };
                array.push(rowData);
              }
            } else {

              const rowData = {
                typeofpurchase: item.typeofpurchase ? item.typeofpurchase : "",
                product_category: item.product_category ? item.product_category : "",
                is_annual: is_annual ? is_annual : "",
                productcodestandard: productcodestandard ? productcodestandard : "",
                productcode: productcode ? productcode : "",
                valuequantity: item.valuequantity ? item.valuequantity : "",
                unit: item.unit ? item.unit : "",
                vendor_id: item.vendorId ? item.vendorId : null,
                supplier: item.vendor ? item.vendor : null,
                supplierspecificEF: item.vendorspecificEF ? item.vendorspecificEF : null,
                supplierunit: item.vendorunit ? item.vendorunit : "",
                emission: emission ? (emission * item.valuequantity) : 0,
                emission_factor_used: emission ? emission : 0,
                FileName: req.file != undefined ? req.file.filename : null,
                user_id: user_id,
                status: 'P',
                facilities: facilities,
                year: year,
                month: item.month
              };
              array.push(rowData);
            }


          })
        );
      }

      if (arrrymessgae.length > 0) {
        return res.json({
          message: arrrymessgae[0],
          status: 400,
          success: false,
        });
      }

      // let months = JSON.parse(month);
      // for (let monthdata of months) {
      //     const rowData = {
      //       typeofpurchase: typeofpurchase?typeofpurchase: "",
      //       product_category:product_category? product_category : "",
      //       product_subcategory:product_subcategory? product_subcategory : "",
      //       productcodestandard: productcodestandard  ? productcodestandard: "",
      //       valuequantity: valuequantity ? valuequantity : "",
      //       unit:unit ? unit : "",
      //       supplier: vendor? vendor: "",
      //       supplierspecificEF:vendorspecificEF ? vendorspecificEF : "",
      //       supplierunit:vendorunit ? vendorunit : "",
      //       emission:vendorspecificEF?vendorspecificEF:"",
      //       user_id: user_id,
      //       status: 'P',
      //       facilities: facilities,
      //       year: year,
      //       month: monthdata
      //     };
      //     array.push(rowData);
      //   }

      if (array.length !== 0) {
        const datainfo = await uplaodTemplate(array);
        return res.json({
          message: "Data inserted successfully.",
          status: 200,
          success: true,
        });
      } else {
        return res.json({
          messgae: "data not found",
          status: 400,
          success: false,
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

exports.bulkPurchaseGoodsUpload = async (req, res) => {
  try {
    const { facilities, jsonData, is_annual, productcodestandard, tenant_id, super_tenant_id } = req.body;
    console.log("jsonData", jsonData);
    const schema = Joi.object({
      facilities: Joi.string().allow('').required(),
      jsonData: Joi.string().allow('').required(),
      is_annual: Joi.string().allow('').required(),
      productcodestandard: Joi.string().allow('').required(),
      tenant_id: Joi.number().required(),
      super_tenant_id: Joi.number().required(),
      file: Joi.string().optional()
    });
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

      let countrydata = await country_check(facilities);
      if (countrydata.length == 0) {
        return res.json({
          success: false,
          message: "EF not Found for this country",
          status: 400,
        });
      }

      let arrrymessgae = [];
      let data = JSON.parse(jsonData);

      if (data?.length > 0) {
        await data.reduce(async (previousPromise, item) => {
          await previousPromise;

          if (item.is_find == true) {
            let emission = '';
            let EFVRes;

            const parsedDate = moment(item.purchase_date, "DD-MM-YYYY");
            item.year = parsedDate.year();
            item.month = parsedDate.format("MMM");

            if (!item.vendor && !item.vendorspecificEF) {
              EFVRes = await fetchPurchaseGoodDataBulk(item.product_name, countrydata[0].CountryId, item.year);
            } else {
              const findVendor = await findVendorByName(item.vendor, super_tenant_id);
              let vendorId;
              if (findVendor.length > 0) {
                vendorId = findVendor[0].id;
              } else {
                const now = new Date();
                const yearMonth = now.getFullYear().toString() + String(now.getMonth() + 1).padStart(2, '0');
                const uniqueNumber = yearMonth + Math.floor(1000 + Math.random() * 9000);
                const vendorInsert = await addVendorName(item.vendor, uniqueNumber, super_tenant_id, countrydata[0].CountryId);
                vendorId = vendorInsert.insertId;
              }
              item.vendorId = vendorId;

              EFVRes = await fetchPurchaseGoodDataBulk(item.product_name, countrydata[0].CountryId, item.year);
            }

            if (EFVRes.length > 0) {
              if (item.unit == 'Kg') {
                emission = item.vendorspecificEF == "" || '' ? EFVRes[0]?.EFkgC02e_kg : item.vendorspecificEF;
              } else if (item.unit == 'Tonnes') {
                emission = item.vendorspecificEF == "" || '' ? EFVRes[0]?.EFkgC02e_tonnes : item.vendorspecificEF;
              } else if (item.unit == 'Litres') {
                emission = item.vendorspecificEF == "" || '' ? EFVRes[0]?.EFkgC02e_litres : item.vendorspecificEF;
              } else {
                emission = item.vendorspecificEF == "" || '' ? EFVRes[0]?.EFkgC02e_ccy : item.vendorspecificEF;
              }
            }

            let purchasegoods = "";
            let productcode = "";

            if (item.product_category) {
              where = ` where id = '${item.product_category}'`;
              purchasegoods = await getSelectedData("purchase_goods_categories_ef", where, 'HSN_code');
              productcode = purchasegoods[0]?.HSN_code;
            } else {
              productcode = "";
            }

            if (is_annual == '0' && item.month != 'Invalid date') {
              const rowData = {
                typeofpurchase: item.typeofpurchase ? item.typeofpurchase : "",
                product_category: item.product_category ? item.product_category : "",
                is_annual: is_annual ? is_annual : "",
                productcodestandard: productcodestandard ? productcodestandard : "",
                productcode: item.productcode ? item.productcode : "",
                valuequantity: item.valuequantity ? item.valuequantity : "",
                unit: item.unit ? item.unit : "",
                vendor_id: item.vendorId ? item.vendorId : null,
                supplier: item.vendor ? item.vendor : null,
                supplierspecificEF: item.vendorspecificEF ? item.vendorspecificEF : null,
                supplierunit: item.vendorunit ? item.vendorunit : "",
                emission: emission ? (emission * item.valuequantity) : 0,
                emission_factor_used: emission ? emission : 0,
                FileName: req.file != undefined ? req.file.filename : null,
                user_id: user_id,
                status: 'P',
                facilities: facilities,
                year: item.year,
                month: item.month
              };
              array.push(rowData);
            }
          }
        }, Promise.resolve());
      }


      if (arrrymessgae.length > 0) {
        return res.json({
          message: arrrymessgae[0],
          status: 400,
          success: false,
        });
      }

      // let months = JSON.parse(month);
      // for (let monthdata of months) {
      //     const rowData = {
      //       typeofpurchase: typeofpurchase?typeofpurchase: "",
      //       product_category:product_category? product_category : "",
      //       product_subcategory:product_subcategory? product_subcategory : "",
      //       productcodestandard: productcodestandard  ? productcodestandard: "",
      //       valuequantity: valuequantity ? valuequantity : "",
      //       unit:unit ? unit : "",
      //       supplier: vendor? vendor: "",
      //       supplierspecificEF:vendorspecificEF ? vendorspecificEF : "",
      //       supplierunit:vendorunit ? vendorunit : "",
      //       emission:vendorspecificEF?vendorspecificEF:"",
      //       user_id: user_id,
      //       status: 'P',
      //       facilities: facilities,
      //       year: year,
      //       month: monthdata
      //     };
      //     array.push(rowData);
      //   }

      if (array.length !== 0) {
        const datainfo = await uplaodTemplate(array);
        return res.json({
          message: "Data inserted successfully.",
          status: 200,
          success: true,
        });
      } else {
        return res.json({
          message: "data not found",
          status: 400,
          success: false,
        });
      }
    }
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: "Internal server error " + err.message,
      error: true
    });
  }
};

// exports.downStreamTransportation = async (req, res) => {
//   try {
//     const {
//       vehicle_type,
//       sub_category,
//       noOfVehicles,
//       mass_of_products,
//       distanceInKms,
//       storagef_type,
//       area_occupied,
//       averageNoOfDays,
//       facility_id, year, month
//     } = req.body;
//     const schema = Joi.alternatives(
//       Joi.object({
//         vehicle_type: [Joi.string().optional().empty()],
//         sub_category: [Joi.string().optional().empty()],
//         noOfVehicles: [Joi.number().optional().empty()],
//         mass_of_products: [Joi.number().optional().empty()],
//         distanceInKms: [Joi.number().optional().empty()],
//         storagef_type: [Joi.string().optional().empty()],
//         area_occupied: [Joi.number().optional().empty()],
//         averageNoOfDays: [Joi.number().optional().empty()],
//         facility_id: [Joi.string().required().empty()],
//         year: [Joi.string().empty().required()],
//         month: [Joi.string().empty().required()],
//       })
//     );
//     const result = schema.validate(req.body);
//     if (result.error) {
//       const message = result.error.details.map((i) => i.message).join(",");
//       return res.json({
//         message: result.error.details[0].message,
//         error: message,
//         missingParams: result.error.details[0].message,
//         status: 200,
//         success: false,
//       });
//     }
//     let array = [];
//     const user_id = req.user.user_id;
//     let downStreamData = {};
//     var EFV = 0;

//     let countrydata = await country_check(facility_id);
//     //console.log(countrydata[0].CountryId);
//     if (countrydata.length == 0) {
//       return res.json({
//         success: false,
//         message: "EF not Found for this country",
//         status: 400,
//       });
//     }
//     downStreamData.emissionStorage = 0;
//     downStreamData.emissionVehicle = 0;
//     if (checkNUllUnDString(vehicle_type)) {

//       const vehicleIdRes = await fetchVehicleId(vehicle_type);
//       let vehicleId = vehicleIdRes[0]?.id;
//       const EFVRes = await fetchVehicleEmission(vehicleId, sub_category, countrydata[0].CountryId);
//       if (EFVRes.length == 0) {
//         return res.json({
//           success: false,
//           message: "No country found for this EF",
//           status: 400,
//         });
//       } else {

//         let yearRange = EFVRes[0]?.Fiscal_Year; // The string representing the year range
//         let [startYear, endYear] = yearRange.split('-').map(Number);

//         if (year >= startYear && year <= endYear) {
//           EFV = EFVRes[0]?.emission_factor;
//         } else if (year == startYear) {
//           EFV = EFVRes[0]?.emission_factor;
//         } else {
//           return res.json({
//             success: false,
//             message: "EF not Found for this year",
//             status: 400,
//           });
//         }
//       }

//       if (checkNUllUnD(EFV)) {
//         let totalEmission = noOfVehicles * mass_of_products * distanceInKms * EFV;
//         downStreamData.vehicleType = vehicle_type;
//         downStreamData.subCategory = sub_category;
//         downStreamData.noOfVehicles = noOfVehicles;
//         downStreamData.massOfProducts = mass_of_products;
//         downStreamData.distanceInKms = distanceInKms;
//         downStreamData.emissionVehicle = totalEmission;
//         downStreamData.emission_factor_value = EFV;
//         downStreamData.emission_factor_value_unit = "kg co2e/km.tonnes";
//         downStreamData.userId = user_id;
//         downStreamData.status = "P";
//         downStreamData.storageFType = "";
//         downStreamData.areaOccupied = 0;
//         downStreamData.averageNoOfDays = 0;
//         downStreamData.facility_id = facility_id;

//       }
//     }
//     if (checkNUllUnDString(storagef_type)) {
//       const vehicleIdRes = await fetchVehicleId(storagef_type);
//       const vehicleId = vehicleIdRes[0].id;
//       const EFSRes = await fetchVehicleEmission(vehicleId, storagef_type, countrydata[0].CountryId);

//       if (EFSRes.length == 0) {
//         return res.json({
//           success: false,
//           message: "No country found for this EF",
//           status: 400,
//         });
//       } else {
//         let yearRange = EFSRes[0]?.Fiscal_Year; // The string representing the year range
//         let [startYear, endYear] = yearRange.split('-').map(Number);
//         var EFS = 0;

//         if (year >= startYear && year <= endYear) {
//           EFS = EFSRes[0]?.emission_factor;
//         } else if (year == startYear) {
//           EFS = EFSRes[0]?.emission_factor;
//         } else {
//           return res.json({
//             success: false,
//             message: "EF not Found for this year",
//             status: 400,
//           });
//         }
//       }

//       let totalEmission = area_occupied * averageNoOfDays * EFS;
//       downStreamData.storageFType = storagef_type;
//       downStreamData.areaOccupied = area_occupied;
//       downStreamData.averageNoOfDays = averageNoOfDays;
//       downStreamData.emissionStorage = totalEmission;
//       downStreamData.emission_factor_storage = EFS;
//       downStreamData.emission_factor_storage_unit = "co2e tonnes/m2.day";
//       downStreamData.userId = user_id;
//       downStreamData.status = "P";
//       downStreamData.facility_id = facility_id;
//     }
//     if (Object.keys(downStreamData).length != 0) {


//       let months = JSON.parse(month);
//       for (let monthdata of months) {
//         downStreamData.month = monthdata;
//         downStreamData.year = year;
//         let resultInsert = await insertDownStreamVehicleStorageEmission(downStreamData)
//         array.push(resultInsert.insertId);
//       }


//       if (array.length > 0) {
//         return res.json({
//           success: true,
//           message: "Emissions Updated Succesfully",
//           status: 200,
//           downStreamData: downStreamData,
//           insertId: array,
//         });
//       } else {
//         return res.json({
//           success: false,
//           message: "Some Problem in Inserting the emission data by user",
//           error: "Error Occured",
//           status: 500,
//         });
//       }
//     }
//   } catch (err) {
//     console.log(err);
//     return res.json({
//       success: false,
//       message: "Internal server error",
//       error: err,
//       status: 500,
//     });
//   }
// };

exports.downStreamTransportation = async (req, res) => {
  try {
    const {
      vehicle_type,
      sub_category,
      noOfVehicles,
      mass_of_products,
      distanceInKms,
      storagef_type,
      area_occupied,
      averageNoOfDays,
      facility_id, year, month, mass_unit, distance_unit, area_occupied_unit
    } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        vehicle_type: [Joi.string().optional().empty()],
        sub_category: [Joi.string().optional().empty()],
        noOfVehicles: [Joi.number().optional().empty()],
        mass_of_products: [Joi.number().optional().empty()],
        distanceInKms: [Joi.number().optional().empty()],
        storagef_type: [Joi.string().optional().empty()],
        area_occupied: [Joi.number().optional().empty()],
        averageNoOfDays: [Joi.number().optional().empty()],
        facility_id: [Joi.string().optional().empty()],
        month: [Joi.string().optional().empty()],
        year: [Joi.string().optional().empty()],
        mass_unit: [Joi.string().optional().empty()],
        distance_unit: [Joi.string().optional().empty()],
        area_occupied_unit: [Joi.string().optional().empty()],
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
    let mass = "";
    let distancekm = ""
    let areaoccp = "";
    const user_id = req.user.user_id;
    let downStreamData = {};
    downStreamData.emissionStorage = 0;
    downStreamData.emissionVehicle = 0;
    var EFV = 0;

    let countrydata = await country_check(facility_id);
    if (countrydata.length == 0) return res.json({ success: false, message: "EF not Found for this country", status: 400 });
    if (checkNUllUnDString(vehicle_type)) {
      const vehicleIdRes = await fetchVehicleByTypeId(vehicle_type);
      let vehicleId = vehicleIdRes[0]?.id;
      const EFVRes = await fetchVehicleEmission(vehicleId, sub_category, countrydata[0].CountryId , year);
      if (EFVRes.length == 0) {
        return res.json({ success: false, message: "No country found for this EF", status: 400 });
      } else {
        let yearRange = EFVRes[0]?.Fiscal_Year;
        let [startYear, endYear] = yearRange.split('-').map(Number);
        if (year >= startYear && year <= endYear) {
          EFV = EFVRes[0]?.emission_factor;
        } else if (year == startYear) {
          EFV = EFVRes[0]?.emission_factor;
        } else {
          return res.json({
            success: false,
            message: "EF not Found for this year",
            status: 400,
          });
        }
      }

      downStreamData.emission_factor_unit = '';

      if (mass_unit == 'tonnes' && mass_of_products) {
        mass = parseFloat(mass_of_products);
        downStreamData.emission_factor_unit = "";
      } else {
        mass = mass_of_products;
        downStreamData.emission_factor_unit = "";
      }

      if (distance_unit == 'miles' && distanceInKms) {
        distancekm = parseFloat(distanceInKms * 1.60934);
        downStreamData.emission_factor_unit = "";
      } else {
        distancekm = distanceInKms;
        downStreamData.emission_factor_unit = "";
      }

      if (checkNUllUnD(EFV)) {
        let totalEmission = parseFloat(noOfVehicles * mass * distancekm * EFV).toFixed(2);
        downStreamData.vehicleType = vehicle_type;
        downStreamData.subCategory = sub_category;
        downStreamData.noOfVehicles = noOfVehicles;
        downStreamData.massOfProducts = mass;
        downStreamData.distanceInKms = distancekm;
        downStreamData.emissionVehicle = totalEmission;
        downStreamData.emission_factor_value = EFV;
        downStreamData.emission_factor_value_unit = "kg co2e/km.tonnes";
        downStreamData.userId = user_id;
        downStreamData.status = "P";
        downStreamData.storageFType = "";
        downStreamData.areaOccupied = 0;
        downStreamData.averageNoOfDays = 0;
        downStreamData.facility_id = facility_id;
        downStreamData.unit_of_mass = mass_unit ? mass_unit : "";
        downStreamData.distance_unit = distance_unit;

      }
    }

    if (area_occupied_unit == 'm2') {
      areaoccp = parseFloat(area_occupied)
    } else {
      areaoccp = area_occupied
    }

    if (checkNUllUnDString(storagef_type)) {
      const vehicleIdRes = await fetchVehicleId(storagef_type);
      const vehicleId = vehicleIdRes[0].id;
      const EFSRes = await fetchVehicleEmission(vehicleId, storagef_type, countrydata[0].CountryId , year);

      if (EFSRes.length == 0) {
        return res.json({
          success: false,
          message: "No country found for this EF",
          status: 400,
        });
      }
      else {
        let yearRange = EFSRes[0]?.Fiscal_Year;
        let [startYear, endYear] = yearRange.split('-').map(Number);
        var EFS = 0;
        if (year >= startYear && year <= endYear) {
          EFS = EFSRes[0]?.emission_factor;
        } else if (year == startYear) {
          EFS = EFSRes[0]?.emission_factor;
        } else {
          return res.json({
            success: false,
            message: "EF not Found for this year",
            status: 400,
          });
        }
      }

      let totalEmission = parseFloat(areaoccp * averageNoOfDays * EFS).toFixed(2);
      downStreamData.storageFType = storagef_type;
      downStreamData.areaOccupied = areaoccp;
      downStreamData.averageNoOfDays = averageNoOfDays;
      downStreamData.emissionStorage = totalEmission;
      downStreamData.unit_of_mass = mass_unit ? mass_unit : "";
      downStreamData.emission_factor_storage = EFS;
      downStreamData.emission_factor_storage_unit = "co2e tonnes/m2.day";
      downStreamData.userId = user_id;
      downStreamData.status = "P";
      downStreamData.facility_id = facility_id;
    }
    let array = [];
    if (Object.keys(downStreamData).length != 0) {

      let months = JSON.parse(month);
      for (let monthdata of months) {
        downStreamData.month = monthdata;
        downStreamData.year = year;
        let resultInsert = await insertDownStreamVehicleStorageEmission(downStreamData)
        array.push(resultInsert.insertId);
      }
      // const resultInsert = await insertDownStreamVehicleStorageEmission(
      //   downStreamData
      // );
      if (array.length > 0) {
        return res.json({
          success: true,
          message: "Emissions Updated Succesfully",
          status: 200,
          downStreamData: downStreamData,
          insertId: array,
        });
      } else {
        return res.json({
          success: false,
          message: "Some Problem in Inserting the emission data by user",
          error: "Error Occured",
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

exports.upStreamTransportation = async (req, res) => {
  try {
    const {
      vehicle_type,
      sub_category,
      noOfVehicles,
      mass_of_products,
      distanceInKms,
      storagef_type,
      area_occupied,
      averageNoOfDays,
      facility_id, year, month, mass_unit, distance_unit, area_occupied_unit
    } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        vehicle_type: [Joi.string().optional().empty()],
        sub_category: [Joi.string().optional().empty()],
        noOfVehicles: [Joi.number().optional().empty()],
        mass_of_products: [Joi.number().optional().empty()],
        distanceInKms: [Joi.number().optional().empty()],
        storagef_type: [Joi.string().optional().empty()],
        area_occupied: [Joi.number().optional().empty()],
        averageNoOfDays: [Joi.number().optional().empty()],
        facility_id: [Joi.string().optional().empty()],
        month: [Joi.string().optional().empty()],
        year: [Joi.string().optional().empty()],
        mass_unit: [Joi.string().optional().empty()],
        distance_unit: [Joi.string().optional().empty()],
        area_occupied_unit: [Joi.string().optional().empty()],
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
    let mass = "";
    let distancekm = ""
    let areaoccp = "";
    const user_id = req.user.user_id;
    let downStreamData = {};
    downStreamData.emissionStorage = 0;
    downStreamData.emissionVehicle = 0;
    var EFV = 0;

    let countrydata = await country_check(facility_id);
    if (countrydata.length == 0) return res.json({ success: false, message: "EF not Found for this country", status: 400 });
    if (checkNUllUnDString(vehicle_type)) {
      const vehicleIdRes = await fetchVehicleByTypeId(vehicle_type);
      let vehicleId = vehicleIdRes[0]?.id;
      const EFVRes = await fetchVehicleEmission(vehicleId, sub_category, countrydata[0].CountryId, year);
      if (EFVRes.length == 0) {
        return res.json({ success: false, message: "EF not found", status: 400 });
      } else {
        let yearRange = EFVRes[0]?.Fiscal_Year;
        let [startYear, endYear] = yearRange.split('-').map(Number);
        if (year >= startYear && year <= endYear) {
          EFV = EFVRes[0]?.emission_factor;
        } else if (year == startYear) {
          EFV = EFVRes[0]?.emission_factor;
        } else {
          return res.json({
            success: false,
            message: "EF not Found for this year",
            status: 400,
          });
        }
      }

      downStreamData.emission_factor_unit = '';

      if (mass_unit == 'tonnes' && mass_of_products) {
        mass = parseFloat(mass_of_products);
        downStreamData.emission_factor_unit = "";
      } else {
        mass = mass_of_products;
        downStreamData.emission_factor_unit = "";
      }
      if (distance_unit == 'miles' && distanceInKms) {
        distancekm = parseFloat(distanceInKms * 1.60934);
        downStreamData.emission_factor_unit = "";
      } else {
        distancekm = distanceInKms;
        downStreamData.emission_factor_unit = "";
      }

      if (checkNUllUnD(EFV)) {
        let totalEmission = parseFloat(noOfVehicles * mass * distancekm * EFV).toFixed(2);
        downStreamData.vehicleType = vehicle_type;
        downStreamData.subCategory = sub_category;
        downStreamData.noOfVehicles = noOfVehicles;
        downStreamData.massOfProducts = mass;
        downStreamData.distanceInKms = distancekm;
        downStreamData.emissionVehicle = totalEmission;
        downStreamData.emission_factor_value = EFV;
        downStreamData.emission_factor_value_unit = "kg co2e/km.tonnes";
        downStreamData.userId = user_id;
        downStreamData.status = "P";
        downStreamData.storageFType = "";
        downStreamData.areaOccupied = 0;
        downStreamData.averageNoOfDays = 0;
        downStreamData.facility_id = facility_id;
        downStreamData.unit_of_mass = mass_unit ? mass_unit : '';
        downStreamData.distance_unit = distance_unit;

      }
    }

    if (area_occupied_unit == 'm2') {
      areaoccp = parseFloat(area_occupied)
    } else {
      areaoccp = area_occupied
    }

    if (checkNUllUnDString(storagef_type)) {
      const vehicleIdRes = await fetchVehicleId(storagef_type);
      const vehicleId = vehicleIdRes[0].id;
      const EFSRes = await fetchVehicleEmission(vehicleId, storagef_type, countrydata[0].CountryId, year);

      if (EFSRes.length == 0) {
        return res.json({
          success: false,
          message: "No country found for this EF",
          status: 400,
        });
      }
      else {
        let yearRange = EFSRes[0]?.Fiscal_Year;
        let [startYear, endYear] = yearRange.split('-').map(Number);
        var EFS = 0;
        if (year >= startYear && year <= endYear) {
          EFS = EFSRes[0]?.emission_factor;
        } else if (year == startYear) {
          EFS = EFSRes[0]?.emission_factor;
        } else {
          return res.json({
            success: false,
            message: "EF not Found for this year",
            status: 400,
          });
        }
      }

      let totalEmission = parseFloat(areaoccp * averageNoOfDays * EFS).toFixed(2);
      downStreamData.storageFType = storagef_type;
      downStreamData.areaOccupied = areaoccp;
      downStreamData.averageNoOfDays = averageNoOfDays;
      downStreamData.emissionStorage = totalEmission;
      downStreamData.unit_of_mass = mass_unit ? mass_unit : "";
      downStreamData.emission_factor_storage = EFS;
      downStreamData.emission_factor_storage_unit = "co2e tonnes/m2.day";
      downStreamData.userId = user_id;
      downStreamData.status = "P";
      downStreamData.facility_id = facility_id;
    }
    let array = [];
    if (Object.keys(downStreamData).length != 0) {

      let months = JSON.parse(month);
      for (let monthdata of months) {
        downStreamData.month = monthdata;
        downStreamData.year = year;
        let resultInsert = await insertUpStreamVehicleStorageEmission(downStreamData)
        array.push(resultInsert.insertId);
      }
      // const resultInsert = await insertUpStreamVehicleStorageEmission(
      //   downStreamData
      // );
      if (array.length > 0) {
        return res.json({
          success: true,
          message: "Emissions Updated Succesfully",
          status: 200,
          downStreamData: downStreamData,
          insertId: array,
        });
      } else {
        return res.json({
          success: false,
          message: "Some Problem in Inserting the emission data by user",
          error: "Error Occured",
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

exports.getAllBatches = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    let where = `where user_id = '${user_id}'`;
    const vehicleIdRes = await getSelectedData(
      "purchasegood_batchno",
      where,
      "distinct batch_id"
    );
    if (vehicleIdRes.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched the batch ids",
        batchIds: vehicleIdRes,
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

exports.vehicleCategories = async (req, res) => {
  try {
    let where = " where id NOT IN('8','9','10') and  status = '1'";
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
    return res.json({ success: false, message: "Internal server error", error: err, status: 500, });
  }
};

exports.vehicleSubCategories = async (req, res) => {
  try {
    const { id, facility_id } = req.query;
    let countrydata = await country_check(facility_id);
    let where = `where vehicle_category_id = ${id} AND country_id = ${countrydata[0].CountryId}`;
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

exports.franchiseSubCategories = async (req, res) => {
  try {
    const category = req.query.category;
    const facility_id = req.query.facility_id;
    const year = req.query.year;
    let countrydata = await country_check(facility_id);
    let where = `where categories = '${category}' AND country_id = '${countrydata[0].CountryId}' and Right(Fiscal_Year,4) = '${year}'`;
    const vehicleDetails = await getData(
      "franchise_categories_subcategories",
      where
    );
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
        message: "Subcategory not found",
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

exports.franchiseCategories = async (req, res) => {
  try {
    const category = req.query.category;
    let where = "";
    const franchiseDetails = await getSelectedData(
      "franchise_categories_subcategories",
      where,
      "distinct categories"
    );
    if (franchiseDetails.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched the batch ids",
        categories: franchiseDetails,
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

exports.franchiseEmissionCalculate = async (req, res) => {
  try {
    const {
      franchise_type,
      sub_category,
      calculation_method,
      franchise_space,
      scope1_emission,
      scope2_emission,
      unit,
      facility_id,
      month, year
    } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        franchise_type: [Joi.string().required().empty()],
        sub_category: [Joi.string().required().empty()],
        calculation_method: [Joi.string().required().empty()],
        franchise_space: [Joi.number().optional().empty()],
        scope1_emission: [Joi.number().optional().empty()],
        scope2_emission: [Joi.number().optional().empty()],
        facility_id: [Joi.string().required().empty()],
        unit: [Joi.string().required().empty()],
        month: [Joi.string().required().empty()],
        year: [Joi.string().required().empty()],
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

    let franchiseData = {
      user_id: user_id,
      franchise_type: franchise_type,
      sub_category: sub_category,
      calculation_method: calculation_method,
      franchise_space:
        franchise_space === undefined || franchise_space === null
          ? 0
          : Number(franchise_space),
      scope1_emission:
        scope1_emission === undefined || scope1_emission === null
          ? 0
          : scope1_emission,
      scope2_emission:
        scope2_emission === undefined || scope2_emission === null
          ? 0
          : scope2_emission,
      emission: 0,
      unit: unit,
      facility_id: facility_id
    };

    let countrydata = await country_check(facility_id);
    //console.log(countrydata[0].CountryId);
    if (countrydata.length == 0) {
      return res.json({
        success: false,
        message: "EF not Found for this facility_id",
        status: 400,
      });
    }
    if (
      calculation_method === "Average data method" ||
      calculation_method === "Franchise Specific method"
    ) {
      let where = `where categories = '${franchise_type}' and sub_categories = '${sub_category}' and country_id = '${countrydata[0].CountryId}'`;
      const franchiseDetails = await getSelectedData(
        "franchise_categories_subcategories",
        where,
        "*"
      );
      if (franchiseDetails.length > 0) {

        let yearRange = franchiseDetails[0]?.Fiscal_Year; // The string representing the year range
        let [startYear, endYear] = yearRange.split('-').map(Number);

        if (year >= startYear && year <= endYear) {
          const ef = franchiseDetails[0].ef;
          let totalEmission = ef * franchise_space;
          franchiseData.emission = totalEmission;
        } else if (year == startYear) {
          const ef = franchiseDetails[0].ef;
          let totalEmission = ef * franchise_space;
          franchiseData.emission = totalEmission;
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
    }
    else if (calculation_method === "Investment Specific method") {
      franchiseData.emission = Number(scope1_emission) + Number(scope2_emission);
    }
    else {
      return res.json({
        status: false,
        msg: "Please select a valid calculation method",
        error: "Incorrect parameter passed",
        status: 500,
      });
    }

    let array = [];
    let months = JSON.parse(month);
    for (let monthdata of months) {
      franchiseData.month = monthdata;
      franchiseData.year = year;
      let resultInserted = await insertFranchiseEmission(franchiseData);
      array.push(resultInserted.insertId);
    }



    if (array.length > 0) {
      return res.json({
        success: true,
        message: "Emissions Updated Succesfully",
        status: 200,
        franchiseData: franchiseData,
        insertId: array,
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

exports.getFranchiseEmission = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    let where = `where user_id = '${user_id}'`;
    const franchiseDetails = await getData(
      "franchise_categories_emission",
      where
    );
    if (franchiseDetails.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched the Franchise Emissions",
        categories: franchiseDetails,
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

exports.getUpstreamEmissions = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    let where = `where user_id = '${user_id}'`;
    const franchiseDetails = await getData(
      "upstream_vehicle_storage_emissions",
      where
    );
    if (franchiseDetails.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched the Upstream  Emissions",
        categories: franchiseDetails,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "No data found for this Upstream Emissions",
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

exports.getDownstreamEmissions = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    let where = `where user_id = '${user_id}'`;
    const franchiseDetails = await getData(
      "downstream_vehicle_storage_emissions",
      where
    );
    if (franchiseDetails.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched the Downstream  Emissions",
        categories: franchiseDetails,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "No data found for this Downstream Emissions",
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

exports.getPurchaseGoodEmissions = async (req, res) => {
  try {
    const { batch } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        batch: [Joi.number().empty().required()],
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

    let where = `where user_id = '${user_id}' and batch = '${batch}';`;
    const purchaseGoodsDetails = await getData(
      "purchase_goods_categories",
      where
    );
    if (purchaseGoodsDetails.length > 0) {
      return res.json({
        message:
          "Fetched the Purchase Goods and Categories according to the batch",
        error: "Some Error Occured",
        categories: purchaseGoodsDetails,
        status: 200,
        success: true,
      });
    } else {
      return res.json({
        message: "Internal Server Error",
        error: "Some Error Occured",
        status: 200,
        success: false,
      });
    }
  } catch (err) {
    console.log(err);
    return res.json({
      message: "Internal Server Error",
      error: "Some Error Occured",
      status: 200,
      success: false,
    });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    let where = "";
    const investmentRes = await getSelectedData(
      "investment_types",
      where,
      "distinct investment_type"
    );
    if (investmentRes.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched the investment types",
        categories: investmentRes,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Some problem occured while fetching the investment types",
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

exports.getInvestmentSubCategory = async (req, res) => {
  try {
    const category = req.query.category;
    let where = `where investment_type = '${category}'`;
    const subCategoriesDetails = await getSelectedData(
      "investment_types",
      where,
      "broad_categories, broad_categoriesId"
    );
    if (subCategoriesDetails.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched the batch ids",
        sub_categories: subCategoriesDetails,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Some problem occured while selecting the batch ids",
        error: "Error while fetching subcategory, check the JWT token",
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

exports.calculateInvestmentEmission = async (req, res) => {
  try {
    const {
      category,
      sub_category_id,
      investment_type,
      calculation_method,
      equity_share,
      equity_project_cost,
      scope1_emission,
      scope2_emission,
      scope1_year,
      scope2_year,
      investee_company_total_revenue,
      project_construction_cost,
      project_phase,
      facilities,
      unit, month, year, sub_group_id, tenant_id
    } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        category: [Joi.string().required().empty()],
        sub_category_id: [Joi.number().required().empty()],
        investment_type: [Joi.string().required().empty()],
        calculation_method: [Joi.string().required().empty()],
        equity_share: [Joi.number().optional().empty()],
        equity_project_cost: [Joi.number().optional().empty()],
        scope1_emission: [Joi.number().optional().empty()],
        scope2_emission: [Joi.number().optional().empty()],
        scope1_year: [Joi.number().optional().empty()],
        scope2_year: [Joi.number().optional().empty()],
        investee_company_total_revenue: [Joi.number().optional().empty()],
        project_construction_cost: [Joi.number().optional().empty()],
        project_phase: [Joi.string().optional().empty()],
        facilities: [Joi.string().optional().allow("")],
        unit: [Joi.string().optional().empty()],
        month: [Joi.string().optional().empty()],
        year: [Joi.string().required().empty()],
        sub_group_id: [Joi.string().optional().allow("")],
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
      });
    }


    //  const strWithBrackets = JSON.stringify(facilities); // Convert array to string with brackets
    const strWithoutBrackets = facilities.slice(1, -1); // Remove the first and last characters (the brackets)

    const user_id = req.user.user_id;

    // let where2 = `where user_id = '${user_id}' and status !='R' and  sub_group_id = '${sub_group_id}'  `;
    // const investmentDetails = await getData("investment_emissions", where2);
    // if (investmentDetails.length > 0) {
    //   return res.json({
    //     status: false,
    //     message: "Investment emissions already exists for this year",
    //     status: 400,
    //   });

    // }

    let investementData = {
      user_id: tenant_id ? tenant_id : user_id,
      category: category,
      sub_category: "",
      investment_type: investment_type,
      calculation_method: calculation_method,
      equity_share:
        equity_share === undefined || equity_share === null
          ? 0
          : Number(equity_share),
      equity_project_cost:
        equity_project_cost === undefined || equity_project_cost === null
          ? 0
          : Number(equity_project_cost),
      scope1_emission:
        scope1_emission === undefined || scope1_emission === null
          ? 0
          : scope1_emission,
      scope2_emission:
        scope2_emission === undefined || scope2_emission === null
          ? 0
          : scope2_emission,
      emission: 0,
      scope1_year: scope1_year,
      scope2_year: scope2_year,
      investee_company_total_revenue: investee_company_total_revenue === undefined || investee_company_total_revenue === null
        ? 0
        : investee_company_total_revenue,
      project_construction_cost: project_construction_cost === undefined || project_construction_cost === null ? 0 : project_construction_cost,
      project_phase: project_phase,

      unit: unit === undefined || unit === null ? "" : unit,
    };
    let countrydata = await countryBysubgroup(sub_group_id);

    if (countrydata.length == 0) {
      return res.json({
        success: false,
        message: "EF not Found for this country",
        status: 400,
      });
    }
    // let stringcountry = [];
    // if(countrydata.length > 0){
    //   countrydata.map(async (item) =>{
    //     stringcountry.push(item.CountryId);
    //   })
    // }
    // let stringcountrydata = stringcountry.slice(1, -1);

    let where = `where investment_type = '${category}' and 	broad_categoriesId = '${sub_category_id}' and country_id ='${countrydata[0].country_id}'`;
    const franchiseDetails = await getSelectedData(
      "investment_types",
      where,
      "emission_factor,broad_categories,Fiscal_Year"
    );

    if (franchiseDetails.length > 0) {
      let ef = "";
      investementData.sub_category = franchiseDetails[0].broad_categories;

      let yearRange = franchiseDetails[0]?.Fiscal_Year; // The string representing the year range
      let [startYear, endYear] = yearRange.split('-').map(Number);

      if (year >= startYear && year <= endYear) {
        ef = franchiseDetails[0].emission_factor;
      } else if (year == startYear) {
        ef = franchiseDetails[0].emission_factor;
      } else {
        return res.json({
          success: false,
          message: "EF not Found for this year",
          status: 400,
        });
      }

      if (calculation_method === "Average data method") {
        if (investment_type.includes("Equity investments")) {
          let totalEmission =
            ef * investee_company_total_revenue * (equity_share / 100);
          investementData.emission = totalEmission;
          investementData.emissionFactorUsed = ef;
          investementData.emission_factor_unit = "kg CO2e/" + unit;
        } else if (
          investment_type === "Debt investments" ||
          investment_type === "Project finance"
        ) {
          let totalEmission = ef * project_construction_cost * (equity_project_cost / 100);
          investementData.emission = totalEmission;
          investementData.emissionFactorUsed = ef;
          investementData.emission_factor_unit = "kg CO2e/" + unit;
        } else {
          return res.json({
            status: false,
            message: " Please select a valid investment type",
            status: 500,
          });
        }
      }
      else if (calculation_method === "Investment Specific method") {
        if (investment_type.includes("Equity investments")) {
          let totalEmission = (Number(equity_share) / 100) * (Number(scope1_emission) + Number(scope2_emission));
          investementData.emission = totalEmission * 1000;
          investementData.emissionFactorUsed = "";
          investementData.emission_factor_unit = "";
        }
        else if (
          investment_type === "Debt investments" ||
          investment_type === "Project finance"
        ) {
          let totalEmission = (Number(equity_project_cost) / 100) * (Number(scope1_emission) + Number(scope2_emission));
          investementData.emission = totalEmission * 1000;
          investementData.emissionFactorUsed = "";
          investementData.emission_factor_unit = "";
        }
        else {
          return res.json({
            status: false,
            message: " Please select a valid investment type",
            status: 500,
          });
        }
      }
    } else {
      return res.json({
        status: false,
        message: "EF not found for this country",
        status: 500,
      });
    }


    let array = [];
    if (month) {
      let months = JSON.parse(month);
      for (let monthdata of months) {
        investementData.month = monthdata;
        investementData.year = year;
        // let facilitiesdata = JSON.parse(facilities);
        investementData.facilities = "";
        investementData.sub_group_id = sub_group_id;
        let resultInserted = await insertInvestmentEmission(investementData);
        array.push(resultInserted.insertId);


      }

    } else {
      investementData.month = "";
      investementData.year = year;
      investementData.facilities = "";
      investementData.sub_group_id = sub_group_id;
      let resultInserted = await insertInvestmentEmission(investementData);
      array.push(resultInserted.insertId);
    }

    if (array.length > 0) {
      return res.json({
        success: true,
        message: "Emissions Updated Succesfully",
        status: 200,
        investementData: investementData,
        insertId: array,
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

// exports.calculateInvestmentEmission = async (req, res) => {
//   try {
//     const {
//       category,
//       sub_category_id,
//       investment_type,
//       calculation_method,
//       equity_share,
//       equity_project_cost,
//       scope1_emission,
//       scope2_emission,
//       scope1_year,
//       scope2_year,
//       investee_company_total_revenue,
//       project_construction_cost,
//       project_phase,
//       facilities,
//       unit, month, year
//     } = req.body;
//     const schema = Joi.alternatives(
//       Joi.object({
//         category: [Joi.string().required().empty()],
//         sub_category_id: [Joi.number().required().empty()],
//         investment_type: [Joi.string().required().empty()],
//         calculation_method: [Joi.string().required().empty()],
//         equity_share: [Joi.number().optional().empty()],
//         equity_project_cost: [Joi.number().optional().empty()],
//         scope1_emission: [Joi.number().optional().empty()],
//         scope2_emission: [Joi.number().optional().empty()],
//         scope1_year: [Joi.number().optional().empty()],
//         scope2_year: [Joi.number().optional().empty()],
//         investee_company_total_revenue: [Joi.number().optional().empty()],
//         project_construction_cost: [Joi.number().optional().empty()],
//         project_phase: [Joi.string().optional().empty()],
//         facilities: [Joi.string().required().empty()],
//         unit: [Joi.string().optional().empty()],
//         month: [Joi.string().optional().empty()],
//         year: [Joi.string().required().empty()],

//       })
//     );
//     const result = schema.validate(req.body);
//     if (result.error) {
//       const message = result.error.details.map((i) => i.message).join(",");
//       return res.json({
//         message: result.error.details[0].message,
//         error: message,
//         missingParams: result.error.details[0].message,
//         status: 200,
//         success: false,
//       });
//     }
//     const authHeader = req.headers.auth;
//     const jwtToken = authHeader.replace("Bearer ", "");
//     const decoded = jwt.decode(jwtToken);
//     const user_id = decoded.user_id;

//     let where2 = `where user_id = '${user_id}' and year = '${year}' and status !='R' and facilities = '${facilities}' `;
//     const investmentDetails = await getData("investment_emissions", where2);
//     if(investmentDetails.length > 0){
//       return res.json({
//         status: false,
//         message: "Investment emissions already exists for this year",
//         status: 400,
//       });

//     }

//     let investementData = {
//       user_id: user_id,
//       category: category,
//       sub_category: "",
//       investment_type: investment_type,
//       calculation_method: calculation_method,
//       equity_share:
//         equity_share === undefined || equity_share === null
//           ? 0
//           : Number(equity_share),
//       equity_project_cost:
//         equity_project_cost === undefined || equity_project_cost === null
//           ? 0
//           : Number(equity_project_cost),
//       scope1_emission:
//         scope1_emission === undefined || scope1_emission === null
//           ? 0
//           : scope1_emission,
//       scope2_emission:
//         scope2_emission === undefined || scope2_emission === null
//           ? 0
//           : scope2_emission,
//       emission: 0,
//       scope1_year: scope1_year,
//       scope2_year: scope2_year,
//       investee_company_total_revenue: investee_company_total_revenue === undefined || investee_company_total_revenue === null
//         ? 0
//         : investee_company_total_revenue,
//       project_construction_cost: project_construction_cost === undefined || project_construction_cost === null ? 0 : project_construction_cost,
//       project_phase: project_phase,
//       facilities: facilities,
//       unit: unit === undefined || unit === null ? 0 : unit,
//     };
//     let countrydata = await country_check(facilities);
//     //console.log(countrydata[0].CountryId);
//     if(countrydata.length == 0){
//       return res.json({
//         success: false,
//         message: "EF not Found for this country",
//         status: 400,
//         });
//     }
//     let where = `where investment_type = '${category}' and 	broad_categoriesId = '${sub_category_id}' and country_id = '${countrydata[0].CountryId}' `;
//     const franchiseDetails = await getSelectedData(
//       "investment_types",
//       where,
//       "emission_factor,broad_categories"
//     );
//     if (franchiseDetails.length > 0) {
//       investementData.sub_category = franchiseDetails[0].broad_categories;
//       const ef = franchiseDetails[0].emission_factor;
//       if (calculation_method === "Average data method") {
//         if (investment_type.includes("Equity investments")) {
//           let totalEmission =
//             ef * investee_company_total_revenue * (equity_share / 100);
//           investementData.emission = totalEmission;
//         } else if (
//           investment_type === "Debt investments" ||
//           investment_type === "Project finance"
//         ) {
//           let totalEmission = ef * project_construction_cost * (equity_project_cost / 100);
//           investementData.emission = totalEmission;
//         } else {
//           return res.json({
//             status: false,
//             msg: " Please select a valid investment type",
//             error: "Incorrect parameter passed",
//             status: 500,
//           });
//         }
//       }
//       else if (calculation_method === "Investment Specific method") {
//         if (iinvestment_type.includes("Equity investments")) {
//           let totalEmission = (Number(equity_share) / 100) * (Number(scope1_emission) + Number(scope2_emission));
//           investementData.emission = totalEmission;
//         }
//         else if (
//           investment_type === "Debt investments" ||
//           investment_type === "Project finance"
//         ) {
//           let totalEmission = (Number(equity_project_cost) / 100) * (Number(scope1_emission) + Number(scope2_emission));
//           investementData.emission = totalEmission;
//         }
//         else {
//           return res.json({
//             status: false,
//             msg: " Please select a valid investment type",
//             error: "Incorrect parameter passed",
//             status: 500,
//           });
//         }
//       }
//     } else {
//       return res.json({
//         status: true,
//         msg: "Some problem occured while selecting categories and sub-ctegories , Please check the input params category and sub_category_id",
//         error: "Parameters Incorrect",
//         status: 500,
//       });
//     }


//     let array = [];
//     if (month) {
//       let months = JSON.parse(month);
//       for (let monthdata of months) {
//         investementData.month = monthdata;
//         investementData.year = year;
//         let resultInserted = await insertInvestmentEmission(investementData);
//         array.push(resultInserted.insertId);
//       }

//     } else {
//       investementData.month = "";
//       investementData.year = year;
//       let resultInserted = await insertInvestmentEmission(investementData);
//       array.push(resultInserted.insertId);
//     }

//     if (array.length > 0) {
//       return res.json({
//         success: true,
//         message: "Emissions Updated Succesfully",
//         status: 200,
//         investementData: investementData,
//         insertId: array,
//       });
//     } else {
//       return res.json({
//         success: false,
//         message: "Some Problem in Inserting the emission data by user",
//         error: "Error Occured",
//         status: 500,
//       });
//     }
//   } catch (err) {
//     console.log(err);
//     return res.json({
//       success: false,
//       message: "Internal server error",
//       error: err,
//       status: 500,
//     });
//   }
// };

exports.getInvestmentEmission = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    let where = `where user_id = '${user_id}'`;
    const investmentDetails = await getData("investment_emissions", where);
    if (investmentDetails.length > 0) {
      return res.json({
        success: true,
        message: "Succesfully fetched the Investement Emissions",
        categories: investmentDetails,
        status: 200,
      });
    } else {
      return res.json({
        success: false,
        message: "Node data found for this user's Investement Emissions",
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
