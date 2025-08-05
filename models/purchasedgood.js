const db = require("../utils/database");
const config = require("../config");
const baseurl = config.base_url;

module.exports = {
  fetchUserById: async (id) => {
    return db.query(" select * from aspnetusers where id= ?", [id]);
  },
  updateToken: async (token, email, act_token) => {
    return db.query("Update aspnetusers set RefreshToken= ? where Email=?", [
      token,
      email,
      act_token,
    ]);
  },
  fetchUserByEmail: async (email) => {
    return db.query("select * from aspnetusers where Email = ?", [email]);
  },

  fetchPurchaseGood: async (user_id, batch_no) => {
    return db.query("select * from purchase_goods_categories where user_id = ? and batch= ? and status = 'P'", [user_id, batch_no])
  },

  fetchPurchaseGoodData: async (user_id, facilities) => {
    return db.query("select * from purchase_goods_categories where user_id = ? and facilities= ?  order by id DESC", [user_id, facilities])
  },

  findVendorByName: async (vendor_name, tenant_id) => {
    return await db.query('SELECT id AS insertId, vendor.* FROM `vendor` WHERE name LIKE ? AND user_id = ?', [`%${vendor_name}%`, tenant_id]);
  },

  addVendorName: async (vendor_name, uniqueNumber, tenant_id, country_id) => {
    return await db.query('INSERT INTO `vendor`(`name`, refer_id, `user_id`, `country_id`) VALUES (?,?,?,?)', [vendor_name, uniqueNumber, tenant_id, country_id])
  },

  fetchVendorCountry: async (vendor) => {
    return db.query("select country_id from vendor where name =?", [vendor])
  },

  fetchVendorCountryById: async (vendorid) => {
    return db.query("select country_id from vendor where id =?", [vendorid])
  },


  fetchPurchaseGoodCountryData: async (id, country_id) => {
    return db.query("select * from purchase_goods_categories_ef where id = ?  and country_id = ? order by id DESC", [id, country_id])
  },
  fetchPurchaseGoodDataBulk: async (product_name, country_id, year) => {
    return db.query("select * from purchase_goods_categories_ef where product = ?  and country_id = ? and Right(Fiscal_Year, 4) = ? order by id DESC", [product_name, country_id, year])
  },

  fetchPurchase_categoriesproduct: async (product_code_id, typesofpurchase, sub_category, category,country_id,year) => {
    return db.query("select  A.product as text , A.id as value, A.HSN_code, A.NAIC_code, A.ISIC_code, B.code  from purchase_goods_categories_ef A LEFT JOIN purchase_goods_product_code B ON B.id = A.product_code_id where A.typeofpurchase= ? and  A.sub_category = ? and A.category = ? and A.country_id = ? and Right(A.Fiscal_Year,4) = ? ", [typesofpurchase, sub_category, category,country_id,year])
  },

  fetchPurchase_subcategories: async (product_code_id, typesofpurchase, category_id) => {
    return db.query("select  name as text , id as value  from `dbo.purchase_subcategory`  where typeofpurchase= ?  and category_id = ?", [typesofpurchase, category_id])
  },

  fetchPurchase_categories: async (product_code_id, typesofpurchase) => {
    return db.query("select  name as text , id as value  from `dbo.purchase_category`  where typeofpurchase= ? ", [typesofpurchase])
  },

  fetchEFPurchaseGoods: async (product_id) => {
    return db.query("select emission_factor, unit from pgoodscategories_ef where product_id = ?", [product_id]);
  },

  updateEmissionStatus: async (id, emission, status) => {
    return db.query("update purchase_goods_categories set emission=? , status = ? where id= ?", [emission, status, id]);
  },

  insertFranchiseEmission: async (data) => {
    return db.query(
      "INSERT INTO   `franchise_categories_emission` (franchise_type, sub_category,calculation_method,franchise_space,scope1_emission,scope2_emission,emission,user_id,status,unit,facility_id,month,year) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        data.franchise_type,
        data.sub_category,
        data.calculation_method,
        data.franchise_space,
        data.scope1_emission,
        data.scope2_emission,
        data.emission,
        data.user_id,
        'P',
        data.unit,
        data.facility_id,
        data.month,
        data.year,
      ]
    );
  },

  insertInvestmentEmission: async (data) => {
    return db.query(
      "INSERT INTO   `investment_emissions` (category, sub_category, investement_type, calculation_method, equity_share, equity_of_projectcost, emission, emission_factor_used, emission_factor_unit, scope1_emission, scope2_emission, scope1_year, scope2_year, investee_company_total_revenue, project_construction_cost, user_id, status,project_phase,facilities,month,year,sub_group_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        data.category,
        data.sub_category,
        data.investment_type,
        data.calculation_method,
        data.equity_share,
        data.equity_project_cost,
        data.emission,
        data.emissionFactorUsed,
        data.emission_factor_unit,
        data.scope1_emission,
        data.scope2_emission,
        data.scope1_year,
        data.scope2_year,
        data.investee_company_total_revenue,
        data.project_construction_cost,
        data.user_id,
        'P',
        data.project_phase,
        data.facilities,
        data.month,
        data.year,
        data.sub_group_id

      ]
    );
  },

  fetchVehicleByTypeId: async (id) => {
    return db.query("select id from vehicletypes where id  = ?", [
      id,
    ]);
  },

  //updated code
  uplaodTemplate: async (data) => {
    return db.query("INSERT INTO  `purchase_goods_categories`(typeofpurchase,productcodestandard,product_category,productcode,valuequantity,unit,vendor_id, supplier,supplierspecificEF,supplierunit,emission,emission_factor_used,FileName,user_id,status,facilities,year,month,is_annual) VALUES ?",
      [data.map((item) => [
        item.typeofpurchase,
        item.productcodestandard,
        item.product_category,
        item.productcode,
        item.valuequantity,
        item.unit,
        item.vendor_id,
        item.supplier,
        item.supplierspecificEF,
        item.supplierunit,
        item.emission,
        item.emission_factor_used,
        item.FileName,
        item.user_id,
        item.status,
        item.facilities,
        item.year,
        item.month,
        item.is_annual

      ])]);
  },

};
