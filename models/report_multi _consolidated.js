const db = require("../utils/database");
const config = require("../config");
const baseurl = config.base_url;

module.exports = {
  getPurchaseGoodsReportMultiConsole: async (facility, year, month) => {
    return db.query(`SELECT 
    'Scope3' AS scope,
    'Purchase Goods & Services' AS category,          -- from productCategory
    sc.name AS DataPoint1,     -- from subCategory
    pgcef.product AS DataPoint2,
    SUM(pgc.emission) AS Emission,
    pgc.year AS Years,
    pgc.month AS Months,
    f.AssestName AS facility
FROM 
    purchase_goods_categories pgc
JOIN 
    \`dbo.facilities\` f 
    ON pgc.facilities = f.ID
JOIN 
    purchase_goods_categories_ef pgcef 
    ON pgc.product_category = pgcef.id
JOIN 
    \`dbo.purchase_category\` pc 
    ON pgcef.category = pc.id
JOIN 
    \`dbo.purchase_subcategory\` sc 
    ON pgcef.sub_category = sc.id
WHERE 
    pgc.facilities IN (${facility})
    AND pgc.year = ${year}
    AND pgc.month IN (${month})
    AND pgc.status = 'S'
GROUP BY 
    DataPoint2, Years
ORDER BY 
    FIELD(Months, 'Jan','Feb','Mar','Apr','May','Jun',
          'Jul','Aug','Sep','Oct','Nov','Dec');
`);
  },

  getConpanyOwnedVehiclesMultiConsole: async (facility, year, month) => {
    return db.query(`select 'Scope1' as scope, 'Company Owned Vehicles' as category,cov.Item as DataPoint1,cov.ItemType  as DataPoint2, \
                     f.AssestName as facility,   sum(vd.GHGEmission) as Emission,  vd.year as Years, vd.months as Months   \
                     from  \`dbo.vehiclede\` vd, \`dbo.facilities\` f,  \`companyownedvehicles\`   cov   \
                     where   vd.facilities in (${facility}) and   \
                     vd.year =${year} and vd.months in (${month}) and vd.vehicleTypeID = cov.id and    \
                     vd.facilities= f.ID  group by DataPoint2,  Years     \
                     ORDER BY FIELD(vd.MONTHS,'Jan','Feb','Mar','Apr', 'May','Jun',     \
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getDownStreamVehicleReportMultiConsole: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Downstream Vehicles' as category, vehicle_type as DataPoint1, sub_category as DataPoint2,  \
                     sum(dvse.emission) as Emission,  dvse.year as Years, dvse.month as Months,  \
                     f.AssestName as facility from  downstream_vehicle_storage_emissions dvse, \`dbo.facilities\`  f  \
                     where   dvse.facility_id in (${facility}) and  \
                     dvse.year =${year} and dvse.month in (${month}) and dvse.status ='S'  \
                     and dvse.facility_id= f.ID \
                    group by DataPoint2, Years ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getUpStreamVehicleReportMultiConsole: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Upstream Vehicles' as category, vehicle_type as DataPoint1, sub_category as DataPoint2,  \
                     sum(uvse.emission) as Emission,  uvse.year as Years, uvse.month as Months,  \
                     f.AssestName as facility from  upstream_vehicle_storage_emissions uvse, \`dbo.facilities\`  f  \
                     where   uvse.facility_id in (${facility}) and uvse.status ='S' and \
                     uvse.year =${year} and uvse.month in (${month}) \
                     and uvse.facility_id= f.ID \
                    group by DataPoint2, Years ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getFranchiseEmissionReportMultiConsole: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Franchise Emissions' as category, franchise_type as DataPoint1, sub_category as DataPoint2,  \
                     sum(fce.emission) as Emission,  fce.year as Years, fce.month as Months, \
                    f.AssestName as facility from  franchise_categories_emission fce, \`dbo.facilities\`  f \
                    where   fce.facility_id in (${facility}) and \
                    fce.year =${year} and fce.month in (${month}) and  fce.status='S' and \
                    fce.facility_id= f.ID   \
                    group by DataPoint2, Years 
                    ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getInvestmentEmissionReportMultiConsole: async (facility, year, month) => {
    return db.query(` select 'Scope3' as scope, 'Investment Emissions' as category, ie.category as Industry_Sector,  ie.sub_category as Sub_Sector, ie.investement_type as Type_of_Investment, ie.calculation_method as Data_Type,  
                      sum(ie.emission) as Emission,  ie.year as Years, ie.month as Months, 
                      f.groupname as sub_group from  investment_emissions ie, \`dbo.group\`  f  
                      where  ie.sub_group_id in (${facility}) and  
                      ie.year = ${year} and ie.month in (${month}) and  ie.status ='S' and 
                      ie.sub_group_id= f.ID  
                      group by Sub_Sector, Years ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getStationaryCombustionReportMultiConsole: async (facility, year, month) => {
    return db.query(` select 'Scope1' as scope, 'Stationary Combustions' as category, scsd.Item as DataPoint1, TypeName as DataPoint2,  \
                      sum(sc.GHGEmission) as Emission,  sc.year as Years, sc.month as Months,  \
                      f.AssestName as facility from  stationarycombustionde sc, \`dbo.facilities\`  f,  \
                      subcategoryseeddata scsd   \
                      where   sc.facility_id in (${facility}) and  \
                      sc.year =${year}  and sc.month in (${month}) and  sc.status ='S' and \
                      sc.facility_id= f.ID   and  scsd.Id = sc.SubCategoriesID \
                      group by DataPoint2, Years ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },


  getUpstreamLeaseEmissionReportMultiConsole: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Upstream Lease Emissions' as category, category as DataPoint1, sub_category as DataPoint2,   \
                     sum(ule.emission) as Emission,  ule.year as Years, ule.month as Months,  \
                     f.AssestName as facility from  upstreamLease_emission ule, \`dbo.facilities\`  f   \
                     where   ule.facility_id in (${facility}) and   \
                     ule.year =${year}  and ule.month in (${month}) and  ule.status='S' and \
                     ule.facility_id= f.ID  \
                     group by DataPoint2, Years ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getDownstreamLeaseEmissionReportMultiConsole: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Downstream Lease Emissions' as category, category as DataPoint1, sub_category as DataPoint2,   \
                     sum(ule.emission) as Emission,  ule.year as Years, ule.month as Months,  \
                     f.AssestName as facility from  downstreamLease_emission ule, \`dbo.facilities\`  f   \
                     where   ule.facility_id in (${facility}) and   \
                     ule.year =${year}  and ule.month in (${month}) and  ule.status='S' and \
                     ule.facility_id= f.ID  \
                     group by DataPoint2, Years ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getWasteGeneratedEmissionReportMultiConsole: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Waste Generated' as category, waste_type as DataPoint1, method as DataPoint2,   \
                     sum(wge.emission) as Emission,  wge.year as Years, wge.month as Months,   \
                    f.AssestName as facility from  waste_generated_emissions wge, \`dbo.facilities\`  f  \
                    where   wge.facility_id in (${facility}) and  \
                    wge.year =${year} and wge.month in (${month}) and  wge.status ='S' and \
                    wge.facility_id= f.ID   \
                    group by DataPoint2, Years ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getFlightTravelReportMultiConsole: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Flight Travel' as category, ft.flight_Type as DataPoint1, ft.flight_Class as DataPoint2,  \
                     sum(ft.emission) as Emission,  ft.year as Years, ft.month as Months, \
                     f.AssestName as facility from  flight_travel ft, \`dbo.facilities\`  f  \
                     where   ft.facilities in (${facility}) and  \
                     ft.year =${year} and ft.month in (${month}) and  ft.status = 'S' and \
                     ft.facilities= f.ID   \
                     group by Months, Years ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },
  getOtherTransportReportMultiConsole: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Other Modes of Transport' as category, omot.mode_of_trasport as DataPoint1, omot.type as DataPoint2,  \
                     sum(omot.emission) as Emission,  omot.year as Years, omot.month as Months, \
                     f.AssestName as facility from  other_modes_of_transport omot, \`dbo.facilities\`  f \
                     where   omot.facilities in (${facility}) and  \ 
                     omot.year =${year} and omot.month in (${month}) and omot.status ='S' and  \
                     omot.facilities= f.ID  \
                     group by DataPoint2, Years ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },
  getHotelStayReportMultiConsole: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Hotel Stay' as category, hs.country_of_stay as DataPoint1, hs.type_of_hotel as DataPoint2,  \
                     sum(hs.emission) as Emission,  hs.year as Years, hs.month as Months,  \
                     f.AssestName as facility from  hotel_stay hs, \`dbo.facilities\`  f  \
                     where   hs.facilities in (${facility}) and  \
                     hs.year =${year} and hs.month in (${month}) and  hs.status ='S' and \
                     hs.facilities= f.ID   \
                     group by DataPoint2, Months, Years ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getEmployeeCommutingReportMultiConsole: async (facility, start_year, end_year) => {
    //return db.query(`select * from employee_commuting_category where status  ='S'  and facilities in (${facility})and year ='${year}' and month in (${month}) ORDER BY created_at ASC`);
    return db.query(
      `select 'Scope3' as scope, 'Employee Commuting' as category, ectt.category as DataPoint1, ectt.type as DataPoint2,   \
                     sum(ecc.emission) as Emission,  ecc.year as Years, ecc.month as Months,  \
                     f.AssestName as facility from  employee_commuting_category ecc, \`dbo.facilities\`  f,  \
                     employee_community_typeoftransport ectt \
                     where   ecc.facilities in (${facility}) and  ecc.status ='S' and \
                     ecc.year >=${start_year}  and  ecc.year <=${end_year}\
                     and  ecc.facilities= f.ID   \
                     and ecc.subtype = ectt.id  \
                     group by DataPoint1 , DataPoint2, Months, Years ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',    \              
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`
    );
  },

  getHomeOfficeReportMultiConsole: async (
    facility,
    start_year,
    end_year
  ) => {

    return db.query(`select 'Scope3' as scope, 'Home Office' as category, hef.typeof_homeoffice as DataPoint1,hc.year, hc.month, sum(hc.emission) as Emission,  f.AssestName  as facility   \
                     from  \`dbo.facilities\`  f ,homeoffice_category hc, homeoffice_emission_factors hef where hc.facilities= f.ID and hc.typeofhomeoffice = hef.id and hc.status  ='S'  and hc.facilities in (${facility}) and hc.year >=${start_year}  and hc.year <=${end_year}  \
                     GROUP BY DataPoint1,facility ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun','Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getSoldProductReportMultiConsole: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Sold Products' as category, scsd.Item as DataPoint1, spcef.item as DataPoint2,   \
                     sum(spc.emission) as Emission,  spc.year as Years, spc.month as Months,   \
                     f.AssestName as facility from  sold_product_category spc, \`dbo.facilities\`  f, \
                     subcategoryseeddata scsd, sold_product_category_ef spcef \
                     where   spc.facilities in (${facility}) and   \
                     spc.year =${year} and spc.month in (${month}) and  spc.status ='S' and  \
                     spc.facilities= f.ID   \
                     and spc.type = scsd.id and   \
                     spc.productcategory = spcef.id   \
                    group by DataPoint2, Years ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },
  getSoldProductbyId: async (id) => {
    return db.query("select item from sold_product_category_ef where id = ?", [
      id,
    ]);
  },

  getEndOfLifeTreatmentReportMultiConsole: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'End of Life Treatment' as category, ewt.type as DataPoint1, elc.subcategory as DataPoint2,   \
                     sum(elc.emission) as Emission,  elc.year as Years, elc.month as Months,   \
                     f.AssestName as facility from  endof_lifetreatment_category elc, \`dbo.facilities\`  f,    \
                     endoflife_waste_type ewt    \
                     where   elc.facilities in (${facility}) and    \
                     elc.year =${year} and elc.month in (${month}) and  elc.status='S' and \ 
                     elc.facilities= f.ID   \
                     and elc.waste_type = ewt.id    \
                     group by DataPoint2, Years ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },


  getProOfSoldGoodsReportMultiConsole: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Processing of Sold Products' as category, pspc.intermediate_category as DataPoint1, pspc.processing_acitivity as DataPoint2,   \
                     sum(pspc.emission) as Emission,  pspc.year as Years, pspc.month as Months,  \
                     f.AssestName as facility from  processing_of_sold_products_category pspc, \`dbo.facilities\`  f  \
                     where   pspc.facilities in  (${facility}) and  \
                     pspc.year =${year} and pspc.month in (${month})  and  pspc.status ='S' and \
                     pspc.facilities= f.ID   \
                     group by DataPoint2, Years ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getRefrigerantReportMultiConsole: async (facility, year, month) => {
    return db.query(`select 'Scope1' as scope, 'Refrigerants' as category, scsd.Item as DataPoint1, re.Item as DataPoint2,  \
                    sum(refr.GHGEmission) as Emission,  refr.year as Years, refr.months as Months,  \
                    f.AssestName as facility from  \`dbo.refrigerantde\`  refr, \`dbo.facilities\`  f,  \
                    \`dbo.refrigents\` re, subcategoryseeddata scsd \
                    where   refr.facilities in (${facility}) and  \
                    refr.year =${year} and refr.months in (${month}) and refr.status ='S'  \ 
                    and  refr.facilities= f.ID    \
                    and refr.SubCategorySeedID = scsd.id and refr.subCategoryTypeId = re.subCatTypeID \
                    group by DataPoint2, Years ORDER BY FIELD(MONTHS,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },



  getFireExtinguisherReportMultiConsole: async (facility, year, month) => {
    return db.query(`select 'Scope1' as scope, 'Fire Extinguisher' as category, scsd.Item as DataPoint1, fire.Item as DataPoint2,  \
                     sum(firde.GHGEmission) as Emission,  firde.year as Years, firde.months as Months,  \
                     f.AssestName as facility from  \`dbo.fireextinguisherde\`  firde, \`dbo.facilities\`  f,  \
                     \`dbo.fireextinguisher\` fire, subcategoryseeddata scsd \
                     where   firde.facilities in (${facility}) and  \
                     firde.year =${year}  and firde.months in (${month})  and firde.status ='S' \
                     and  firde.facilities= f.ID  \
                     and firde.SubCategorySeedID = scsd.id and firde.subCategoryTypeId = fire.id \
                    group by DataPoint2, Years ORDER BY FIELD(MONTHS,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  /*getElecricityReportMultiConsole: async (facility, year, month) => {
    return db.query(`select 'Scope' as scope, 'Renewable Electricity' as DataPoint1, scsd.Item as category, rens.SourceName as DataPoint2,  \
                     sum(rende.GHGEmission) as Emission,  rende.year as Years, rende.months as Months,  \
                     f.AssestName as facility from  \`dbo.renewableelectricityde\`  rende, \`dbo.facilities\`  f,  \
                      \`dbo.renewableelectricitysource\` rens, subcategoryseeddata scsd \ 
                      where   rende.facilities in (${facility})   \
                      and rende.year =${year}  and rende.months in (${month}) and rende.status ='S' \
                      and  rende.facilities= f.ID  \
                      and  rende.SubCategorySeedID = scsd.id and rende.typeID = rens.id   \
                      group by DataPoint2, Years ORDER BY FIELD(MONTHS,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },*/

  getElecricityReportMultiConsole: async (facility, year, month) => {
    return db.query(`select 'Scope' as scope, scsd.Item as category, rende.typeID as DataPoint1, rens.SourceName as DataPoint2,  
                     sum(rende.GHGEmission) as Emission,  rende.year as Years, rende.months as Months,  
                     f.AssestName as facility from  \`dbo.renewableelectricityde\`  rende, \`dbo.facilities\`  f,  
                      \`dbo.renewableelectricitysource\` rens, subcategoryseeddata scsd 
                      where   rende.facilities in (${facility})   
                      and rende.year =${year}  and rende.months in (${month}) and rende.status ='S' 
                      and  rende.facilities= f.ID  
                      and  rende.SubCategorySeedID = 1002 and  rende.SubCategorySeedID = scsd.id and rende.typeID = rens.id 
                      group by category, DataPoint2, Years ORDER BY FIELD(MONTHS,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

    getElecricityLocationReportMultiConsole: async (facility, year, month) => {
    return db.query(`select 'Scope' as scope, scsd.Item as category, rende.typeID as DataPoint1, "" as DataPoint2,rende.RegionID as region,
                     sum(rende.GHGEmission) as Emission,  rende.year as Years, rende.months as Months,  
                     f.AssestName as facility from  \`dbo.renewableelectricityde\`  rende, \`dbo.facilities\`  f,  
                      subcategoryseeddata scsd 
                      where   rende.facilities in (${facility})   
                      and rende.year =${year}  and rende.months in (${month}) and rende.status ='S' 
                      and  rende.facilities= f.ID  
                      and  rende.SubCategorySeedID = 9 and  rende.SubCategorySeedID = scsd.id
                      group by  region, DataPoint2, Years ORDER BY FIELD(MONTHS,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getHeatandSteamReportMultiConsole: async (facility, year, month) => {
    return db.query(`select 'Scope1' as scope, scsd.Item as category, hns.Item as DataPoint1,    \
                     sum(hnsde.GHGEmission) as Emission,  hnsde.year as Years, hnsde.months as Months,    \
                     f.AssestName as facility from  \`dbo.heatandsteamde\`  hnsde, \`dbo.facilities\`  f,   \
                     \`dbo.heatandsteam\` hns, subcategoryseeddata scsd   \
                     where   hnsde.facilities in (${facility})   \
                     and hnsde.year =${year} and hnsde.months in (${month})  and hnsde.status ='S'  \
                     and  hnsde.facilities= f.ID   \
                     and  hnsde.SubCategorySeedID = scsd.id and hnsde.typeID = hns.id  \
                     group by DataPoint1, Years ORDER BY FIELD(MONTHS,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getWaterSupplyConsole: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Water Supply and Treatment' as category, 'Water Supply' as DataPoint1, '-' as DataPoint2, SUM(hnsde.withdrawn_emission) AS Emission, hnsde.year as Years, hnsde.month as Months,    \
                     f.AssestName as facility from  water_supply_treatment_category  hnsde, \`dbo.facilities\`  f   \
                     WHERE hnsde.facilities in (${facility})   \
                     and hnsde.year =${year} and hnsde.month in (${month}) and hnsde.status ='S'  \
                     and  hnsde.facilities= f.ID   \
                     group by withdrawn_emission ORDER BY FIELD(MONTHS,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },
  getWaterTreatmentConsole: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Water Supply and Treatment' as category, 'Water Treatment' as DataPoint1, '-' as DataPoint2, SUM(hnsde.treatment_emission) AS Emission, hnsde.year as Years, hnsde.month as Months,    \
                     f.AssestName as facility from  water_supply_treatment_category  hnsde, \`dbo.facilities\`  f   \
                     WHERE hnsde.facilities in (${facility})   \
                     and hnsde.year =${year} and hnsde.month in (${month}) and hnsde.status ='S'  \
                     and  hnsde.facilities= f.ID   \
                     group by treatment_emission ORDER BY FIELD(MONTHS,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getWaterDischargeConsole: async (facility, year, month) => {
    return db.query(`SELECT sum(wdd.withthtreatment) as treatper, wdd.water_supply_treatment_id, wdd.water_discharge, wdd.leveloftreatment, wdd.month, wdd.year, f.AssestName, wstg.water_supply, wstg.water_treatment, ((sum(wdd.withthtreatment)* 100)/wstg.water_treatment) as water_treated
                     FROM \`water_discharge_by_destination\` wdd, \`dbo.facilities\`  f, water_supply_treatment_category wstg
                     WHERE wdd.month in (${month}) and wdd.year=${year} and wstg.facilities = f.ID and wstg.id = wdd.water_supply_treatment_id and wstg.facilities in (${facility})
                     GROUP BY wdd.water_supply_treatment_id, wdd.water_discharge, wdd.leveloftreatment,  wdd.year 
                     ORDER BY FIELD(wdd.MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getWaterDischargeOnlyConsole: async (facility, year, month) => {
    return db.query(`SELECT sum(wdd.totaldischarge) as totaldischarge, wdd.water_supply_treatment_id, wdd.water_discharge,  wdd.month, wdd.year, f.AssestName, wstg.water_supply, wstg.water_treatment, ((sum(wdd.totaldischarge)* 100)/wstg.water_treatment) as water_treated
                     FROM \`water_discharge_by_destination_only\` wdd, \`dbo.facilities\`  f, water_supply_treatment_category wstg
                     WHERE wdd.month in (${month})and wdd.year=${year} and wstg.facilities = f.ID and wstg.id = wdd.water_supply_treatment_id and wstg.facilities in (${facility})
                     GROUP BY wdd.water_supply_treatment_id, wdd.water_discharge,   wdd.year 
                     ORDER BY FIELD(wdd.MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getWaterWithdrawalConsole: async (facility, year, month) => {
    return db.query(`SELECT sum(wwbs.totalwaterwithdrawl) as totalwaterwithdrawl, wwbs.water_supply_treatment_id,   wwbs.month, wwbs.year, f.AssestName, wwbs.water_withdrawl, wstg.water_supply
                     FROM \`water_withdrawl_by_source\` wwbs, \`dbo.facilities\`  f, water_supply_treatment_category wstg 
                     WHERE wwbs.month in (${month}) and wwbs.year=${year} and wstg.facilities = f.ID and wstg.id = wwbs.water_supply_treatment_id and wstg.facilities in (${facility})
                     GROUP BY wwbs.water_supply_treatment_id, wwbs.water_withdrawl,  wwbs.year 
                     ORDER BY FIELD(wwbs.MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getCompanyOwnedVehiclesMultiConsole: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Company Owned Vehicle' as category, vt.vehicle_type as DataPoint1, vs.vehicle_type as DataPoint2,   \
                     sum(vde.GHGEmission) as Emission,  vde.year as Years, vde.months as Months,   \
                     f.AssestName as facility from  \`dbo.vehiclede\` vde, \`dbo.facilities\`  f   \
                     vehicletypes vt, vehicle_subcategory vs   \
                     where   vde.facilities in (${facility})   \
                     and vde.year =${year} and vde.months in (${month}) and vde.status ='S'  \
                     and  vde.facilities= f.ID  \
                     and  vs.vehicle_category_id = vt.id and vde.vehicleTypeID = vs.id   \
                     group by DataPoint2, Years ORDER BY FIELD(MONTHS,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },


};
