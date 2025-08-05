const db = require("../utils/database");
const config = require("../config");
const baseurl = config.base_url;

module.exports = {
  getPurchaseGoodsReportMultiNew: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Purchase Goods' as category,top.typesofpurchasename as DataPoint1, pgcef.product as DataPoint2, \
                     sum(pgc.emission) as Emission,  pgc.year as Years, pgc.month as Months, \
                     f.AssestName as facility from  purchase_goods_categories pgc, \`dbo.facilities\` f,  \`dbo.typesofpurchase\`   top, \
                     purchase_goods_categories_ef pgcef where   pgc.facilities in (${facility}) and \
                     pgc.year =${year} and pgc.month in (${month}) and pgc.status ='S' and \
                     pgc.facilities= f.ID  and pgc.productcode = pgcef.HSN_code \
                     and pgc.product_category = pgcef.id  and top.id = pgc.typeofpurchase group by DataPoint1, DataPoint2, Months, Years 
                     ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getConpanyOwnedVehiclesMultiNew: async (facility, year, month) => {
    return db.query(`select 'Scope1' as scope, 'Company Owned Vehicles' as category,cov.Item as DataPoint1,cov.ItemType  as DataPoint2, \
                     f.AssestName as facility,   sum(vd.GHGEmission) as Emission,  vd.year as Years, vd.months as Months   \
                     from  \`dbo.vehiclede\` vd, \`dbo.facilities\` f,  \`companyownedvehicles\`   cov   \
                     where   vd.facilities in (${facility}) and  vd.status = 'S' and \
                     vd.year =${year} and vd.months in (${month}) and vd.vehicleTypeID = cov.id and    \
                     vd.facilities= f.ID  group by DataPoint1, DataPoint2, Months, Years     \
                     ORDER BY FIELD(vd.MONTHS,'Jan','Feb','Mar','Apr', 'May','Jun',     \
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getDownStreamVehicleReportMultiNew: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Downstream Vehicles' as category, vehicletypes.vehicle_type AS DataPoint1, sub_category as DataPoint2,  \
                     sum(dvse.emission) as Emission,  dvse.year as Years, dvse.month as Months,  \
                     f.AssestName as facility from  downstream_vehicle_storage_emissions dvse, \`dbo.facilities\`  f , vehicletypes \
                     where   dvse.facility_id in (${facility}) and  \
                     dvse.year =${year} and dvse.month in (${month}) and dvse.status = 'S' \
                     and dvse.facility_id= f.ID AND vehicletypes.id = dvse.vehicle_type \
                    group by DataPoint1, DataPoint2, Months, Years 
                    ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getUpStreamVehicleReportMultiNew: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Upstream Vehicles' as category, vehicletypes.vehicle_type AS DataPoint1, sub_category as DataPoint2,  \
                     sum(uvse.emission) as Emission,  uvse.year as Years, uvse.month as Months,  \
                     f.AssestName as facility from  upstream_vehicle_storage_emissions uvse, \`dbo.facilities\`  f , vehicletypes  \
                     where   uvse.facility_id in (${facility}) and  \
                     uvse.year =${year} and uvse.month in (${month})  and uvse.status = 'S' \
                     and uvse.facility_id= f.ID AND vehicletypes.id = uvse.vehicle_type \
                    group by DataPoint1, DataPoint2, Months, Years
                    ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getFranchiseEmissionReportMultiNew: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Franchise Emissions' as category, franchise_type as DataPoint1, sub_category as DataPoint2,  \
                     sum(fce.emission) as Emission,  fce.year as Years, fce.month as Months, \
                    f.AssestName as facility from  franchise_categories_emission fce, \`dbo.facilities\`  f \
                    where   fce.facility_id in (${facility}) and \
                    fce.year =${year} and fce.month in (${month}) and fce.status = 'S' and \
                    fce.facility_id= f.ID   \
                    group by DataPoint1, DataPoint2, Months, Years 
                    ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getInvestmentEmissionReportMultiNew: async (facility, year, month) => {
    return db.query(`  select 'Scope3' as scope, 'Investment Emissions' as category, ie.category as Industry_Sector,  ie.sub_category as Sub_Sector, ie.investement_type as Type_of_Investment, ie.calculation_method as Data_Type,  \
                      sum(ie.emission) as Emission,  ie.year as Years, ie.month as Months, \
                      f.groupname as sub_group from  investment_emissions ie, \`dbo.group\`  f  \
                      where  ie.sub_group_id in (${facility}) and  \
                      ie.year = ${year} and ie.month in (${month}) and  ie.status ='S' and  \
                      ie.sub_group_id= f.ID   \
                      group by Industry_Sector, Sub_Sector, Type_of_Investment, Data_Type, Months, Years  \
                      ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',     \             
                      'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getStationaryCombustionReportMultiNew: async (facility, year, month) => {
    return db.query(` select 'Scope1' as scope, 'Stationary Combustions' as category, scsd.Item as DataPoint1, TypeName as DataPoint2,  \
                      sum(sc.GHGEmission) as Emission,  sc.year as Years, sc.month as Months,  \
                      f.AssestName as facility from  stationarycombustionde sc, \`dbo.facilities\`  f,  \
                      subcategoryseeddata scsd   \
                      where   sc.facility_id in (${facility}) and  \
                      sc.year =${year}  and sc.month in (${month}) and   sc.status = 'S' and \
                      sc.facility_id= f.ID   and  scsd.Id = sc.SubCategoriesID \
                      group by DataPoint1, DataPoint2, Months, Years
                      ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                     'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getUpstreamLeaseEmissionReportMultiNew: async (facility, year, month) => {
    return db.query(`SELECT "Scope3" AS scope, "Upstream Lease Emissions" AS category, CASE WHEN no_of_vehicles = "0" THEN category ELSE vehicle_type END AS DataPoint1, CASE WHEN no_of_vehicles = "0" THEN sub_category ELSE vehicle_subtype END AS DataPoint2, SUM(CASE WHEN no_of_vehicles = "0" THEN emission - vehicle_emission ELSE vehicle_emission END) AS Emission, ule.year AS Years, ule.month AS Months, f.AssestName AS facility FROM upstreamLease_emission ule, \`dbo.facilities\` f WHERE ule.facility_id IN(${facility}) AND ule.year = ${year} AND ule.month IN(${month}) AND ule.status = "S" AND ule.facility_id = f.ID GROUP BY DataPoint1, DataPoint2, Months, Years ORDER BY FIELD( MONTH, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' );`);
  },

  getDownstreamLeaseEmissionReportMultiNew: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Downstream Lease Emissions' as category, category as DataPoint1, sub_category as DataPoint2,   \
                     sum(ule.emission) as Emission,  ule.year as Years, ule.month as Months,  \
                     f.AssestName as facility from  downstreamLease_emission ule, \`dbo.facilities\`  f   \
                     where   ule.facility_id in (${facility}) and   \
                     ule.year =${year}  and ule.month in (${month}) and  ule.status = 'S' and \
                     ule.facility_id= f.ID  \
                     group by DataPoint1, DataPoint2, Months, Years 
                     ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getWasteGeneratedEmissionReportMultiNew: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Waste Generated' as category, waste_type as DataPoint1, method as DataPoint2, wge.total_waste as quantity, wge.unit,   \
                     sum(wge.emission) as Emission,  wge.year as Years, wge.month as Months,   \
                    f.AssestName as facility from  waste_generated_emissions wge, \`dbo.facilities\`  f \
                    where   wge.facility_id in (${facility}) and  \
                    wge.year =${year} and wge.month in (${month}) and  wge.status = 'S' and \
                    wge.facility_id= f.ID   \
                    group by DataPoint1, DataPoint2, Months, Years 
                    ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getFlightTravelReportMultiNew: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Flight Travel' as category, ft.flight_Type as DataPoint1, ft.flight_Class as DataPoint2,  \
                     sum(ft.emission) as Emission,  ft.year as Years, ft.month as Months, \
                     f.AssestName as facility from  flight_travel ft, \`dbo.facilities\`  f  \
                     where   ft.facilities in (${facility}) and  \
                     ft.year =${year} and ft.month in (${month}) and  ft.status ='S' and \
                     ft.facilities= f.ID   \
                     group by DataPoint1, DataPoint2, Months, Years 
                     ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },
  getOtherTransportReportMultiNew: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Other Modes of Transport' as category, omot.mode_of_trasport as DataPoint1, omot.type as DataPoint2,  \
                     sum(omot.emission) as Emission,  omot.year as Years, omot.month as Months, \
                     f.AssestName as facility from  other_modes_of_transport omot, \`dbo.facilities\`  f \
                     where   omot.facilities in (${facility}) and  \ 
                     omot.year =${year} and omot.month in (${month}) and  omot.status ='S' and \
                     omot.facilities= f.ID  \
                     group by DataPoint1, DataPoint2, Months, Years 
                     ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },
  getHotelStayReportMultiNew: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Hotel Stay' as category, hs.country_of_stay as DataPoint1, hs.type_of_hotel as DataPoint2,  \
                     sum(hs.emission) as Emission,  hs.year as Years, hs.month as Months,  \
                     f.AssestName as facility from  hotel_stay hs, \`dbo.facilities\`  f  \
                     where   hs.facilities in (${facility}) and  \
                     hs.year =${year} and hs.month in (${month}) and  hs.status ='S' and \
                     hs.facilities= f.ID   \
                     group by DataPoint1, DataPoint2, Months, Years
                     ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec') `);
  },

  getEmployeeCommutingReportMultiNew: async (facility, year) => {
    //return db.query(`select * from employee_commuting_category where status  ='S'  and facilities in (${facility})and year ='${year}' and month in (${month}) ORDER BY created_at ASC`);
    return db.query(
      `select 'Scope3' as scope, 'Employee Commuting' as category, ectt.type as DataPoint1, ecc.totalnoofcommutes as DataPoint2,  \
                     sum(ecc.emission) as Emission, ecc.year as Years, ecc.month as Months, f.AssestName as facility  \
                     from employee_commuting_category ecc, \`dbo.facilities\` f,   employee_community_typeoftransport ectt  \
                     where ecc.facilities in (${facility}) and ecc.year =${year} and ecc.status ='S' and ecc.facilities= f.ID AND ecc.subtype = ectt.id \
                     group by DataPoint1, DataPoint2 ,Months, Years ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun', 'Jul','Aug','Sep','Oct','Nov', 'Dec')`
    );
  },

  getHomeOfficeReportMultiNew: async (facility, start_year, end_year) => {
    return db.query(`select 'Scope3' as scope, 'Home Office' AS category, homeoffice_emission_factors.typeof_homeoffice AS DataPoint1, "" AS DataPoint2, year, month, sum(emission) as Emission, facilities as facility  \
                    from  homeoffice_category, homeoffice_emission_factors  where status  ='S'  and facilities in (${facility}) and year >='${start_year}' and year <= '${end_year}' AND homeoffice_emission_factors.id = homeoffice_category.typeofhomeoffice GROUP BY facilities, DataPoint1 
                    ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getSoldProductReportMultiNew: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Sold Products' as category, scsd.Item as DataPoint1, spcef.item as DataPoint2,   \
                     sum(spc.emission) as Emission,  spc.year as Years, spc.month as Months,   \
                     f.AssestName as facility from  sold_product_category spc, \`dbo.facilities\`  f,  \
                     subcategoryseeddata scsd, sold_product_category_ef spcef \
                     where   spc.facilities in (${facility}) and   \
                     spc.year =${year} and spc.month in (${month}) and  spc.status ='S' and \
                     spc.facilities= f.ID   \
                     and spc.type = scsd.id and   \
                     spc.productcategory = spcef.id   \
                    group by DataPoint1, DataPoint2, Months, Years
                    ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },
  getSoldProductbyId: async (id) => {
    return db.query("select item from sold_product_category_ef where id = ?", [
      id,
    ]);
  },

  getEndOfLifeTreatmentReportMultiNew: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'End of Life Treatment' as category, ewt.type as DataPoint1, elc.subcategory as DataPoint2,   \
                     sum(elc.emission) as Emission,  elc.year as Years, elc.month as Months,   \
                     f.AssestName as facility from  endof_lifetreatment_category elc, \`dbo.facilities\`  f,    \
                     endoflife_waste_type ewt    \
                     where   elc.facilities in (${facility}) and    \
                     elc.year =${year} and elc.month in (${month}) and  elc.status ='S' and \ 
                     elc.facilities= f.ID   \ 
                     and elc.waste_type = ewt.id    \
                     group by DataPoint1, DataPoint2, Months, Years 
                     ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getProOfSoldGoodsReportMultiNew: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Processing of Sold Products' as category, pspc.intermediate_category as DataPoint1, pspc.processing_acitivity as DataPoint2,   \
                     sum(pspc.emission) as Emission,  pspc.year as Years, pspc.month as Months,  \
                     f.AssestName as facility from  processing_of_sold_products_category pspc, \`dbo.facilities\`  f  \
                     where   pspc.facilities in  (${facility}) and  \
                     pspc.year =${year} and pspc.month in (${month})  and  pspc.status ='S' and \
                     pspc.facilities= f.ID   \
                     group by DataPoint1, DataPoint2, Months, Years 
                     ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getRefrigerantReportMultiNew: async (facility, year, month) => {
    return db.query(`select 'Scope1' as scope, 'Refrigerants' as category, scsd.Item as DataPoint1, re.Item as DataPoint2,  \
                    sum(refr.GHGEmission) as Emission,  refr.year as Years, refr.months as Months,  \
                    f.AssestName as facility from  \`dbo.refrigerantde\`  refr, \`dbo.facilities\`  f,  \
                    \`dbo.refrigents\` re, subcategoryseeddata scsd \
                    where   refr.facilities in (${facility}) and  \
                    refr.year =${year} and refr.months in (${month}) and refr.status ='S' and \ 
                      refr.facilities= f.ID    \
                    and refr.SubCategorySeedID = scsd.id and refr.subCategoryTypeId = re.subCatTypeID \
                    group by DataPoint1, DataPoint2, Months, Years 
                    ORDER BY FIELD(MONTHS,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getFireExtinguisherReportMultiNew: async (facility, year, month) => {
    return db.query(`select 'Scope1' as scope, 'Fire Extinguisher' as category, scsd.Item as DataPoint1, fire.Item as DataPoint2,  \
                     sum(firde.GHGEmission) as Emission,  firde.year as Years, firde.months as Months,  \
                     f.AssestName as facility from  \`dbo.fireextinguisherde\`  firde, \`dbo.facilities\`  f,  \
                     \`dbo.fireextinguisher\` fire, subcategoryseeddata scsd \
                     where   firde.facilities in (${facility}) and  \
                     firde.year =${year}  and firde.months in (${month})  and firde.status = 'S' \
                     and  firde.facilities= f.ID  \
                     and firde.SubCategorySeedID = scsd.id and firde.subCategoryTypeId = fire.id \
                    group by DataPoint1, DataPoint2, Months, Years 
                    ORDER BY FIELD(MONTHS,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getElecricityReportMultiNew: async (facility, year, month) => {
    return db.query(`select 'Scope' as scope,  scsd.Item as category, rende.typeID as DataPoint1, rende.SourceName as DataPoint2,  \
                     sum(rende.GHGEmission) as Emission,  rende.year as Years, rende.months as Months,  \
                     f.AssestName as facility from  \`dbo.renewableelectricityde\`  rende, \`dbo.facilities\`  f, subcategoryseeddata scsd \
                      where   rende.facilities in (${facility})   \
                      and rende.year =${year}  and rende.months in (${month})  and rende.status ='S' \
                      and  rende.facilities= f.ID  \
                      and  rende.SubCategorySeedID = scsd.id   \
                      group by category, DataPoint1, Months, Years ORDER BY FIELD(MONTHS,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getHeatandSteamReportMultiNew: async (facility, year, month) => {
    return db.query(`select 'Scope1' as scope,  scsd.Item as category, hns.Item as DataPoint1,    \
                     sum(hnsde.GHGEmission) as Emission,  hnsde.year as Years, hnsde.months as Months,    \
                     f.AssestName as facility from  \`dbo.heatandsteamde\`  hnsde, \`dbo.facilities\`  f,   \
                     \`dbo.heatandsteam\` hns, subcategoryseeddata scsd   \
                     where   hnsde.facilities in (${facility})   \
                     and hnsde.year =${year} and hnsde.months in (${month}) and hnsde.status ='S'  \
                     and  hnsde.facilities= f.ID   \
                     and  hnsde.SubCategorySeedID = scsd.id and hnsde.typeID = hns.id  \
                     group by DataPoint1, Months, Years ORDER BY FIELD(MONTHS,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getWaterSupplyNew: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Water Supply and Treatment' as category, 'Water Supply' as DataPoint1, '-' as DataPoint2, SUM(hnsde.withdrawn_emission) AS Emission, hnsde.year as Years, hnsde.month as Months,    \
                     f.AssestName as facility from  water_supply_treatment_category  hnsde, \`dbo.facilities\`  f   \
                     WHERE hnsde.facilities in (${facility})   \
                     and hnsde.year =${year} and hnsde.month in (${month}) and hnsde.status ='S'  \
                     and  hnsde.facilities= f.ID   \
                     group by withdrawn_emission, Months, Years ORDER BY FIELD(MONTHS,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getWaterTreatmentNew: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Water Supply and Treatment' as category, 'Water Treatment' as DataPoint1, '-' as DataPoint2, SUM(hnsde.treatment_emission) AS Emission, hnsde.year as Years, hnsde.month as Months,    \
                     f.AssestName as facility from  water_supply_treatment_category  hnsde, \`dbo.facilities\`  f   \
                     WHERE hnsde.facilities in (${facility})   \
                     and hnsde.year =${year} and hnsde.month in (${month}) and hnsde.status ='S'  \
                     and  hnsde.facilities= f.ID   \
                     group by treatment_emission, Months, Years ORDER BY FIELD(MONTHS,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getWaterDischarge: async (facility, year, month) => {
    return db.query(`SELECT sum(wdd.withthtreatment) as treatper, wdd.totalwaterdischarge, wdd.water_supply_treatment_id, wdd.water_discharge, wdd.leveloftreatment, wdd.month, wdd.year, f.AssestName, wstg.water_supply, wstg.water_treatment, ((sum(wdd.withthtreatment)* 100)/wstg.water_treatment) as water_treated
                     FROM \`water_discharge_by_destination\` wdd, \`dbo.facilities\`  f, water_supply_treatment_category wstg
                     WHERE wstg.month in (${month}) and wstg.year=${year} and wstg.facilities = f.ID and wstg.id = wdd.water_supply_treatment_id and wstg.facilities in (${facility})
                     GROUP BY wdd.water_supply_treatment_id, wdd.water_discharge, wdd.leveloftreatment, wstg.month, wstg.year  
                     ORDER BY FIELD(wstg.MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getWaterDischargeOnly: async (facility, year, month) => {
    return db.query(`SELECT sum(wdd.totaldischarge) as treatper, wdd.totaldischarge, wdd.water_supply_treatment_id, wdd.water_discharge,  wdd.month, wdd.year, f.AssestName, wstg.water_supply, wstg.water_treatment, ((sum(wdd.totaldischarge)* 100)/wstg.water_treatment) as water_treated 
                     FROM \`water_discharge_by_destination_only\` wdd, \`dbo.facilities\`  f, water_supply_treatment_category wstg
                     WHERE wstg.month in (${month}) and wstg.year=${year} and wstg.facilities = f.ID and wstg.id = wdd.water_supply_treatment_id and wstg.facilities in (${facility})
                     GROUP BY wdd.water_supply_treatment_id, wdd.water_discharge, wstg.month, wstg.year  
                     ORDER BY FIELD(wstg.MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getWaterWithdrawal: async (facility, year, month) => {
    return db.query(`SELECT sum(wwbs.totalwaterwithdrawl) as sumtotalwaterwithdrawl, wwbs.totalwaterwithdrawl ,wwbs.water_supply_treatment_id,   wwbs.month, wwbs.year, f.AssestName, wwbs.water_withdrawl, wstg.water_supply
                     FROM \`water_withdrawl_by_source\` wwbs, \`dbo.facilities\`  f, water_supply_treatment_category wstg 
                     WHERE wstg.month in (${month}) and wstg.year=${year} and wstg.facilities = f.ID and wstg.id = wwbs.water_supply_treatment_id and wstg.facilities in (${facility})
                     GROUP BY wwbs.water_supply_treatment_id, wwbs.water_withdrawl, wstg.month, wstg.year 
                     ORDER BY FIELD(wstg.MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getCompanyOwnedVehiclesMultiNew: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Company Owned Vehicle' as category, vt.vehicle_type as DataPoint1, vs.vehicle_type as DataPoint2,   \
                     sum(vde.GHGEmission) as Emission,  vde.year as Years, vde.months as Months,   \
                     f.AssestName as facility from  \`dbo.vehiclede\` vde, \`dbo.facilities\`  f,   \
                     vehicletypes vt, vehicle_subcategory vs   \
                     where   vde.facilities in (${facility})   \
                     and vde.year =${year} and vde.months in (${month}) and vde.status ='S'   \
                     and  vde.facilities= f.ID  \
                     and  vs.vehicle_category_id = vt.id and vde.vehicleTypeID = vs.id   \
                     group by DataPoint2, Months, Years ORDER BY FIELD(MONTHS,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getVendorsReportMulti: async (vendors) => {
    return db.query(`SELECT pc.name as Cateogry , psc.name as Sub_category, pgc.supplier as Supplier, pgc.supplierunit as Supplier_Unit,  \
                    pgc.supplierspecificEF as Supplier_EF, sum(pgc.emission) as emission, pgc.productcode, pgc.valuequantity as Quantity,  \
                    pgc.unit as UNIT, pgc.month as Months, pgc.year as Years   \
                    FROM \`purchase_goods_categories\` pgc, vendor v, \`dbo.purchase_subcategory\` psc, \`dbo.purchase_category\` pc, purchase_goods_categories_ef pgcf
                    WHERE pgc.product_category = pgcf.id and pgcf.category = pc.id and pgcf.sub_category = psc.id and pgc.supplier in (${vendors})
                    group by Sub_category, Months, Years ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getVendorsReportConsole: async (vendors) => {
    return db.query(`SELECT pc.name as Cateogry , psc.name as Sub_category, pgc.supplier as Supplier, pgc.supplierunit as Supplier_Unit,  \
                     pgc.supplierspecificEF as Supplier_EF, sum(pgc.emission) as emission, pgc.productcode, pgc.valuequantity as Quantity,  \
                     pgc.unit as UNIT, pgc.month as Months, pgc.year as Years   \
                     FROM \`purchase_goods_categories\` pgc, vendor v, \`dbo.purchase_subcategory\` psc, \`dbo.purchase_category\` pc, purchase_goods_categories_ef pgcf
                     WHERE pgc.product_category = pgcf.id and pgcf.category = pc.id and pgcf.sub_category = psc.id and pgc.supplier in (${vendors})
                     group by Sub_category,  Years ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getVendorsCount: async (facilities) => {
    return db.query(`SELECT count(distinct(supplier)) as count FROM \`purchase_goods_categories\` WHERE facilities in (${facilities})`);
  },

  getFacilitiesFromTenant: async (tenant_id) => {
    return db.query("SELECT ID  from \`dbo.facilities\` where TenantID = ?", [tenant_id]);
  },

  getVendorsEmission: async (facilities, year) => {
    return db.query(
      `SELECT sum(emission) as total_emission FROM \`purchase_goods_categories\` where supplier is not NULL and status ='S' and  facilities in (${facilities}) and year = ${year}`
    );
  },

  // getVendorWiseEmission: async (facilities) => {
  //   return db.query(`SELECT pgc.supplier, sum(pgc.emission) as perVenderEmission, pgc.supplier, top.typesofpurchasename FROM \`purchase_goods_categories\`   pgc , \`dbo.typesofpurchase\` top\
  //                      where pgc.facilities in (${facilities}) and pgc.typeofpurchase=top.id and  pgc.supplier <> \"\" and pgc.status = 'S' and pgc.supplier is not NULL group by supplier`);
  // },
  getVendorWiseEmission: async (facilities, year) => {
    return db.query(`
SELECT 
  pgc.vendor_id, 
  pgc.supplier, 
  pgc.unit,
  top.typesofpurchasename,
  (pgc.emission) AS perVendorEmission, 
  v.*
FROM 
      \`purchase_goods_categories\` pgc
    JOIN 
      \`dbo.typesofpurchase\` top ON pgc.typeofpurchase = top.id
    JOIN 
      \`vendor\` v ON pgc.vendor_id = v.id
WHERE 
  pgc.facilities  IN (${facilities}) and pgc.year = ${year}
  AND pgc.supplier <> "" 
  AND pgc.status = 'S' 
  AND pgc.supplier IS NOT NULL
    `);
  },


  getEmissionByLoc: async (facility, year) => {
    return db.query(`SELECT sum(pgc.emission) as emission,  co.name  \
                     FROM \`purchase_goods_categories\` pgc, \`vendor\` ve, \`dbo.country\` co   \
                     WHERE pgc.supplier = ve.name and ve.country_id = co.ID and pgc.status = 'S' and pgc.facilities in (${facility}) and pgc.year = ${year}  \
                     GROUP BY co.name`);
  },

  getProductGraphVendors: async (facility, year) => {
    return db.query(`select  pgcef.product as Product,
                     sum(pgc.emission) as emission
                     from  purchase_goods_categories pgc, purchase_goods_categories_ef pgcef  
                     where  pgc.status ='S' and  pgc.productcode = pgcef.HSN_code and pgc.facilities in (${facility}) and pgc.year = ${year}
                     and pgc.product_category = pgcef.id  group by Product`);

  }
};
