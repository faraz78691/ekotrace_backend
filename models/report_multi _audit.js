const db = require("../utils/database");
const config = require("../config");
const baseurl = config.base_url;

module.exports = {
  getPurchaseGoodsReportMultiAudit: async (facility, year, month) => {
    // return db.query(`select 'Scope3' as scope, 'Purchase Goods' as category, top.typesofpurchasename as DataPoint1, pgcef.product as DataPoint2, \
    //                  sum(pgc.emission) as Emission, pgc.emission_factor_used AS emission_factor, CONCAT('kg CO2e/',pgc.unit) AS emission_factor_name,  pgc.year as Years, pgc.month as Months, pgc.unit, pgcef.EFkgC02e_kg, pgcef.EFkgC02e_ccy, pgcef.EFkgC02e_tonnes, pgcef.EFkgC02e_litres, pgcef.reference, \
    //                  f.AssestName as facility from  purchase_goods_categories pgc, \`dbo.facilities\` f, \`dbo.typesofpurchase\`   top, \
    //                  purchase_goods_categories_ef pgcef where   pgc.facilities in (${facility}) and \
    //                  pgc.year =${year} and pgc.month in (${month}) and pgc.status ='S' and \
    //                  pgc.facilities= f.ID 
    //                 and pgc.product_category = pgcef.id and top.id = pgc.typeofpurchase group by DataPoint2,  Years 
    //                 ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
    //                 'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
    return db.query(`SELECT 
    'Scope3' AS scope,
    pc.name AS category,          -- from productCategory
    sc.name AS DataPoint1,     -- from subCategory
    pgcef.product AS DataPoint2,
    SUM(pgc.emission) AS Emission,
    pgc.emission_factor_used AS emission_factor,
    CONCAT('kg CO2e/', pgc.unit) AS emission_factor_name,
    pgc.year AS Years,
    pgc.month AS Months,
    pgc.unit,
    pgcef.EFkgC02e_kg,
    pgcef.EFkgC02e_ccy,
    pgcef.EFkgC02e_tonnes,
    pgcef.EFkgC02e_litres,
    pgcef.reference,
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

  getConpanyOwnedVehiclesMultiAudit: async (facility, year, month) => {
    return db.query(`select 'Scope1' as scope, 'Company Owned Vehicles' as category,cov.Item as DataPoint1,cov.ItemType  as DataPoint2, \
                     f.AssestName as facility,   sum(vd.GHGEmission) as Emission,  vd.year as Years, vd.months as Months, cov.kgCO2e_km, cov.kgCO2e_litre, cov.kgCO2e_kg, cov.reference  \
                     from  \`dbo.vehiclede\` vd, \`dbo.facilities\` f,  \`companyownedvehicles\`   cov   \
                     where   vd.facilities in (${facility}) and   \
                     vd.year ='${year}' and vd.months in (${month}) and vd.vehicleTypeID = cov.id and    \
                     vd.facilities= f.ID  group by DataPoint2,  Years     \
                     ORDER BY FIELD(vd.MONTHS,'Jan','Feb','Mar','Apr', 'May','Jun',     \
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getDownStreamVehicleReportMultiAudit: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Downstream Vehicles' as category, vs.vehicle_type as DataPoint1, dvse.sub_category as DataPoint2,  \
                     sum(dvse.emission) as Emission, dvse.emission_factor_value AS emisison_factor1, dvse.emission_factor_value_unit AS emission_factor_name1, dvse.emission_factor_storage AS emisison_factor2, dvse.emission_factor_storage_unit AS emission_factor_name2, dvse.year as Years, dvse.month as Months, vs.reference,  \
                     f.AssestName as facility from  downstream_vehicle_storage_emissions dvse, \`dbo.facilities\`  f, vehicle_subcategory vs \
                     where   dvse.facility_id in (${facility}) and  \
                     dvse.year =${year} and dvse.month in (${month}) and dvse.status='S' \
                     and dvse.facility_id= f.ID and vs.vehicle_type = dvse.sub_category\
                    group by DataPoint2, Years ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getUpStreamVehicleReportMultiAudit: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Upstream Vehicles' as category, vs.vehicle_type as DataPoint1, uvse.sub_category as DataPoint2, uvse.emission_factor_value AS emisison_factor1, uvse.emission_factor_value_unit AS emission_factor_name1, uvse.emission_factor_storage AS emission_factor2, uvse.emission_factor_storage_unit AS emission_factor_name2, \
                     sum(uvse.emission) as Emission,  uvse.year as Years, uvse.month as Months, vs.reference, \
                     f.AssestName as facility from  upstream_vehicle_storage_emissions uvse, \`dbo.facilities\`  f, vehicle_subcategory vs  \
                     where   uvse.facility_id in (${facility}) and  \
                     uvse.year =${year} and uvse.month in (${month}) and uvse.status ='S' \
                     and uvse.facility_id= f.ID and vs.vehicle_type = uvse.sub_category \
                     group by DataPoint2, Years ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getFranchiseEmissionReportMultiAudit: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Franchise Emissions' as category, franchise_type as DataPoint1, sub_category as DataPoint2, fcs.ef as emission_factor, 'kgCO2e_kg' as emission_factor_name, \
                     sum(fce.emission) as Emission, fcs.ef AS emission_factor, CONCAT("kg CO2e/",fce.unit) AS emission_factor_name, fce.year as Years, fce.month as Months, fcs.reference, \
                    f.AssestName as facility from  franchise_categories_emission fce, \`dbo.facilities\`  f, franchise_categories_subcategories fcs\
                    where   fce.facility_id in (${facility}) and \
                    fce.year =${year} and fce.month in (${month}) and  fce.status ='S' and \
                    fce.facility_id= f.ID   and fce.sub_category  = fcs.sub_categories\
                    group by DataPoint2, Years 
                    ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getInvestmentEmissionReportMultiAudit: async (facility, year, month) => {
    return db.query(` select 'Scope3' as scope, 'Investment Emissions' as category, category as Industry_Sector, sub_category as Sub_Sector, ie.investement_type as Type_of_Investment,ie.calculation_method as data_type, ie.emission as emission_factor, 'sq ft' as emission_factor_name,\
                      sum(ie.emission) as Emission,  ie.year as Years, ie.month as Months, ie.reference, \
                      f.groupname as sub_group from  investment_emissions ie, \`dbo.group\`  f, investment_types it \
                      where   ie.sub_group_id in (${facility}) and  \
                      ie.year =${year} and ie.month in (${month}) and  ie.status ='S' and \
                      ie.sub_group_id= f.ID  and ie.sub_category = it.broad_categories \
                      group by Sub_Sector, Years ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getStationaryCombustionReportMultiAudit: async (facility, year, month) => {
    return db.query(` select 'Scope1' as scope, 'Stationary Combustions' as category, scsd.Item as DataPoint1, TypeName as DataPoint2, sc.GHGEmissionFactor AS emission_factor_used, sc.Unit AS emission_factor_unit,  scef.kgCO2e_kg, scef.kgCO2e_kwh, scef.kgCO2e_litre, scef.kgCO2e_tonnes, \
                      sum(sc.GHGEmission) as Emission,  sc.year as Years, sc.month as Months,  scef.Unit as unit, scef.reference, \
                      f.AssestName as facility from  stationarycombustionde sc, \`dbo.facilities\`  f,  stationarycombustion scef, \
                      subcategoryseeddata scsd   \
                      where   sc.facility_id in (${facility}) and  \
                      sc.year =${year}  and sc.month in (${month}) and  sc.status='S' and  \
                      sc.facility_id= f.ID  and sc.TypeID = scef.SubCatTypeID and  scsd.Id = sc.SubCategoriesID \
                      group by DataPoint2, Years ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },


  getUpstreamLeaseEmissionReportMultiAudit: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Upstream Lease Emissions' as category, category as DataPoint1, sub_category as DataPoint2, ule.emission_factor_lease AS emission_factor1, ule.emission_factor_lease_unit AS emission_factor_name1, ule.emission_factor_vehichle AS emission_factor2, ule.emission_factor_vehicle_unit AS emission_factor_name2, \
                     sum(ule.emission) as Emission,  ule.year as Years, ule.month as Months, fcs.reference, \
                     f.AssestName as facility from  upstreamLease_emission ule, \`dbo.facilities\`  f, franchise_categories_subcategories fcs  \
                     where   ule.facility_id in (${facility}) and   \
                     ule.year =${year}  and ule.month in (${month}) and  ule.status='S' and \
                     ule.facility_id= f.ID and ule.sub_category = fcs.sub_categories  \
                     group by DataPoint2, Years ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getDownstreamLeaseEmissionReportMultiAudit: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Downstream Lease Emissions' as category, category as DataPoint1, sub_category as DataPoint2,   ule.emission_factor_lease as emission_factor,ule.emission_factor_lease_unit as emission_factor_name,  \
                     sum(ule.emission) as Emission, CONCAT(ule.emission_factor_lease,',',ule.emission_factor_vehichle) AS emission_factor, CONCAT(ule.emission_factor_lease_unit,',',ule.emission_factor_vehicle_unit) AS emission_factor_name, ule.year as Years, ule.month as Months, fcs.reference, \
                     f.AssestName as facility from  downstreamLease_emission ule, \`dbo.facilities\`  f , franchise_categories_subcategories fcs \
                     where   ule.facility_id in (${facility}) and   \
                     ule.year =${year}  and ule.month in (${month}) and  ule.status='S' and \
                     ule.facility_id= f.ID and ule.sub_category = fcs.sub_categories  \
                     group by DataPoint2, Years ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getWasteGeneratedEmissionReportMultiAudit: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Waste Generated' as category, ewts.waste_type as DataPoint1, method as DataPoint2,  \
                     sum(wge.emission) as Emission, wge.emission_factor_used AS emission_factor, wge.emission_factor_unit AS emission_factor_name,  wge.year as Years, wge.month as Months, ewts.reference,  \
                    f.AssestName as facility from  waste_generated_emissions wge, \`dbo.facilities\`  f, endoflife_waste_type_subcategory ewts \
                    where   wge.facility_id in (${facility}) and  \
                    wge.year =${year} and wge.month in (${month}) and  wge.status ='S' and \
                    wge.facility_id= f.ID  and wge.waste_type = ewts.type\
                    group by DataPoint2, Years ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getFlightTravelReportMultiAudit: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Flight Travel' as category, ft.flight_Type as DataPoint1, ft.flight_Class as DataPoint2,  'kgCO2e_kg' as emission_factor_name, \
                     sum(ft.emission) as Emission, ft.emission_factor AS emission_factor,  ft.year as Years, ft.month as Months, \
                     f.AssestName as facility from  flight_travel ft, \`dbo.facilities\`  f  \
                     where   ft.facilities in (${facility}) and  \
                     ft.year =${year} and ft.month in (${month}) and  ft.status='S' and \
                     ft.facilities= f.ID   \
                     group by Months, Years ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getOtherTransportReportMultiAudit: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Other Modes of Transport' as category, omot.mode_of_trasport as DataPoint1, omot.type as DataPoint2, omotef.ef AS emission_factor, SUM(omot.emission) AS Emission, omot.emission_factor_unit AS emission_factor_name, \
                     omot.year as Years, omot.month as Months, omotef.reference, \
                     f.AssestName as facility from  other_modes_of_transport omot, \`dbo.facilities\`  f, other_modes_of_transport_ef omotef\
                     where   omot.facilities in (${facility}) and  omot.status ='S' and \ 
                     omot.year =${year} and omot.month in (${month}) and ((omot.mode_of_trasport = omotef.type_name) or (omot.mode_of_trasport = omotef.type_name and omot.fuel_type= omotef.mode_type))\
                     and omot.facilities= f.ID  \
                     group by DataPoint2, Years ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getHotelStayReportMultiAudit: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Hotel Stay' as category, hs.country_of_stay as DataPoint1, hs.type_of_hotel as DataPoint2, hb.star_2, hb.star_3, hb.star_4, hb.star_5, hb.star_green, \
                     sum(hs.emission) as Emission, hb.star_2 AS emission_factor, hs.emission_factor_unit AS emission_factor_name, hs.year as Years, hs.month as Months, hb.reference,  \
                     f.AssestName as facility from  hotel_stay hs, \`dbo.facilities\`  f, hotel_booking hb \
                     where   hs.facilities in (${facility}) and  \
                     hs.year =${year} and hs.month in (${month}) and  hs.status ='S' and \
                     hs.facilities= f.ID  and hs.country_of_stay = hb.country \
                     group by DataPoint2, Months, Years ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getEmployeeCommutingReportMultiAudit: async (facility, start_year, end_year) => {
    //return db.query(`select * from employee_commuting_category where status  ='S'  and facilities in (${facility})and year ='${year}' and month in (${month}) ORDER BY created_at ASC`);
    return db.query(
      `select 'Scope3' as scope, 'Employee Commuting' as category, ectt.category AS DataPoint1, ectt.type AS DataPoint2, ecc.EFs as emission_factor, ectt.unit, ecc.unit as emission_factor_name, \
                     sum(ecc.emission) as Emission,  ecc.year as Years, ecc.month as Months, ectt.reference,  \
                     f.AssestName as facility from  employee_commuting_category ecc, \`dbo.facilities\`  f,  \
                     employee_community_typeoftransport ectt \
                     where   ecc.facilities in (${facility}) and  \
                     ecc.year <=${start_year}  and  ecc.year <=${end_year} and ecc.status ='S' \
                     and  ecc.facilities= f.ID AND ecc.subtype = ectt.id  \
                     group by DataPoint1, DataPoint2 , Months, Years ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',    \              
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`
    );
  },

  getHomeOfficeReportMultiAudit: async (
    facility,
    start_year,
    end_year
  ) => {

    return db.query(`select hef.typeof_homeoffice as category,hoc.year AS Years, hoc.month AS Months, hoc.emission_factor, hoc.emission_factor_unit AS emission_factor_name, sum(hoc.emission) as Emission, f.AssestName as facility, hef.reference  \
                    from  homeoffice_category hoc, homeoffice_emission_factors hef, \`dbo.facilities\`  f  where  hoc.facilities in (${facility}) and hoc.year >='${start_year}' and  hoc.year <='${end_year}'  \
                     and hoc.typeofhomeoffice =  hef.id  and hoc.status ='S' and \
                    hoc.facilities= f.ID GROUP BY hef.typeof_homeoffice ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',  \
                    'Jul','Aug','Sep','Oct','Nov', 'Dec') `);
  },

  getSoldProductReportMultiAudit: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Sold Products' as category, scsd.Item as DataPoint1, spcef.item as DataPoint2,spcef.tonnes, spcef.kg, spcef.litres,  \
                     sum(spc.emission) as Emission, spc.emission_factor_used AS emission_factor, spc.emission_factor_unit AS emission_factor_name, spc.year as Years, spc.month as Months, spcef.reference,  \
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

  getEndOfLifeTreatmentReportMultiAudit: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'End of Life Treatment' as category, ewt.type as DataPoint1, elc.subcategory as DataPoint2, ewt.kg, ewt.tonnes, ewt.litres,  \
                     sum(elc.emission) as Emission, CONCAT(elc.emission_factor_lan,',',elc.emission_factor_combustion,',',elc.emission_factor_recycling,',', elc.emission_factor_composing) AS emission_factor, elc.emission_factor_unit AS emission_factor_name, elc.year as Years, elc.month as Months, ewt.reference,  \
                     f.AssestName as facility from  endof_lifetreatment_category elc, \`dbo.facilities\`  f,    \
                     endoflife_waste_type ewt    \
                     where   elc.facilities in (${facility}) and    \
                     elc.year =${year} and elc.month in (${month}) and  elc.status='S' and \ 
                     elc.facilities= f.ID   \
                     and elc.waste_type = ewt.id    \
                     group by DataPoint2, Years ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },


  getProOfSoldGoodsReportMultiAudit: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Processing of Sold Products' as category, pspc.intermediate_category as DataPoint1, pspc.processing_acitivity as DataPoint2, pspc.unit,  pspef.efkgco2_kg,  pspef.efkgco2_ccy,   pspef.efkgco2_litres,  pspef.efkgco2_tonnes,   \
                     sum(pspc.emission) as Emission, pspc.emission_factor_used AS emission_factor, pspc.emission_factor_unit AS emission_factor_name, pspc.year as Years, pspc.month as Months, pspef.reference,  \
                     f.AssestName as facility from  processing_of_sold_products_category pspc, \`dbo.facilities\`  f , processing_of_sold_products_ef pspef \
                     where   pspc.facilities in  (${facility}) and  \
                     pspc.year =${year} and pspc.month in (${month})  and  \
                     pspc.facilities= f.ID   and  pspc.processing_acitivity= pspef.sector and pspc.sub_activity = pspef.sub_sector\
                     group by DataPoint2, Years ORDER BY FIELD(MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getRefrigerantReportMultiAudit: async (facility, year, month) => {
    return db.query(`select 'Scope1' as scope, 'Refrigerants' as category, scsd.Item as DataPoint1, re.Item as DataPoint2, dbr.Unit, re.kgCO2e_kg AS emission_factor,
    CONCAT("kg CO2e/",refr.Unit) AS emission_factor_name,  \
                    sum(refr.GHGEmission) as Emission,  refr.year as Years, refr.months as Months, dbr.reference,  \
                    f.AssestName as facility from  \`dbo.refrigerantde\`  refr, \`dbo.facilities\`  f,  \`dbo.refrigents\`  dbr, \
                    \`dbo.refrigents\` re, subcategoryseeddata scsd \
                    where   refr.facilities in (${facility}) and  \
                    refr.year =${year} and refr.months in (${month}) \ 
                    and  refr.facilities= f.ID   and refr.subCategoryTypeId = dbr.id\
                    and refr.SubCategorySeedID = scsd.id and refr.subCategoryTypeId = re.subCatTypeID \
                    group by DataPoint2, Years ORDER BY FIELD(MONTHS,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },



  getFireExtinguisherReportMultiAudit: async (facility, year, month) => {
    return db.query(`select 'Scope1' as scope, 'Fire Extinguisher' as category, scsd.Item as DataPoint1, fire.Item as DataPoint2, fire.Unit , fire.kgCO2e_kg AS emission_factor, CONCAT("kg CO2e/", firde.Unit) AS emission_factor_name,   \
                     sum(firde.GHGEmission) as Emission,  firde.year as Years, firde.months as Months, fire.reference,  \
                     f.AssestName as facility from  \`dbo.fireextinguisherde\`  firde, \`dbo.facilities\`  f,  \
                     \`dbo.fireextinguisher\` fire, subcategoryseeddata scsd \
                     where   firde.facilities in (${facility}) and  \
                     firde.year =${year}  and firde.months in (${month})  \
                     and  firde.facilities= f.ID  \
                     and firde.SubCategorySeedID = scsd.id and firde.subCategoryTypeId = fire.id \
                    group by DataPoint2, Years ORDER BY FIELD(MONTHS,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getElecricityReportMultiAudit: async (facility, year, month) => {
    return db.query(`select 'Scope' as scope,  scsd.Item as category, rende.typeID as DataPoint1, rende.SourceName as DataPoint2,  \
                     sum(rende.GHGEmission) as Emission, rende.emission_factor, CONCAT('kg CO2e/',rende.Unit) AS emission_factor_name, rende.year as Years, rende.months as Months,  \
                     f.AssestName as facility from  \`dbo.renewableelectricityde\`  rende, \`dbo.facilities\`  f, subcategoryseeddata scsd \
                      where   rende.facilities in (${facility})   \
                      and rende.year =${year}  and rende.months in (${month})  and rende.status ='S' \
                      and  rende.facilities= f.ID  \
                      and  rende.SubCategorySeedID = scsd.id   \
                      group by category, DataPoint1, Months, Years ORDER BY FIELD(MONTHS,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getHeatandSteamReportMultiAudit: async (facility, year, month) => {
    return db.query(`select 'Scope1' as scope, scsd.Item as category, hns.Item as DataPoint1, hns.Unit, hns.kgCO2e_kwh AS emission_factor, CONCAT('kgCO2e/', hnsde.Unit) AS emission_factor_name,\
                     sum(hnsde.GHGEmission) as Emission,  hnsde.year as Years, hnsde.months as Months, hns.reference ,  \
                     f.AssestName as facility from  \`dbo.heatandsteamde\`  hnsde, \`dbo.facilities\`  f,   \
                     \`dbo.heatandsteam\` hns, subcategoryseeddata scsd   \
                     where   hnsde.facilities in (${facility})   \
                     and hnsde.year =${year} and hnsde.months in (${month})   \
                     and  hnsde.facilities= f.ID   \
                     and  hnsde.SubCategorySeedID = scsd.id and hnsde.typeID = hns.id  \
                     group by DataPoint1, Years ORDER BY FIELD(MONTHS,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getWaterSupplyAudit: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Water Supply and Treatment' as category, 'Water Supply' as DataPoint1, '-' as DataPoint2, SUM(hnsde.withdrawn_emission) AS Emission, CONCAT(hnsde.withdrawn_emission_factor_used,',',hnsde.treatment_emission_factor_used) AS emission_factor, hnsde.emission_factor_unit AS emission_factor_name, hnsde.year as Years, hnsde.month as Months,    \
                     f.AssestName as facility from  water_supply_treatment_category  hnsde, \`dbo.facilities\`  f   \
                     WHERE hnsde.facilities in (${facility})   \
                     and hnsde.year =${year} and hnsde.month in (${month}) and hnsde.status ='S'  \
                     and  hnsde.facilities= f.ID   \
                     group by withdrawn_emission, Months, Years ORDER BY FIELD(MONTHS,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getWaterTreatmentAudit: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Water Supply and Treatment' as category, 'Water Treatment' as DataPoint1, '-' as DataPoint2, SUM(hnsde.treatment_emission) AS Emission, CONCAT(hnsde.withdrawn_emission_factor_used,',',hnsde.treatment_emission_factor_used) AS emission_factor, hnsde.emission_factor_unit AS emission_factor_name, hnsde.year as Years, hnsde.month as Months,    \
                     f.AssestName as facility from  water_supply_treatment_category  hnsde, \`dbo.facilities\`  f   \
                     WHERE hnsde.facilities in (${facility})   \
                     and hnsde.year =${year} and hnsde.month in (${month}) and hnsde.status ='S'  \
                     and  hnsde.facilities= f.ID   \
                     group by treatment_emission, Months, Years ORDER BY FIELD(MONTHS,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getWaterDischargeAudit: async (facility, year, month) => {
    return db.query(`SELECT sum(wdd.withthtreatment) as treatper, wdd.water_supply_treatment_id, wdd.water_discharge, wdd.leveloftreatment, wdd.month, wdd.year, f.AssestName, wstg.water_supply, wstg.water_treatment, ((sum(wdd.withthtreatment)* 100)/wstg.water_treatment) as water_treated
                     FROM \`water_discharge_by_destination\` wdd, \`dbo.facilities\`  f, water_supply_treatment_category wstg
                     WHERE wdd.month in (${month}) and wdd.year=${year} and wstg.facilities = f.ID and wstg.id = wdd.water_supply_treatment_id and wstg.facilities in (${facility})
                     GROUP BY wdd.water_supply_treatment_id, wdd.water_discharge, wdd.leveloftreatment,  wdd.year 
                     ORDER BY FIELD(wdd.MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getWaterWithdrawalAudit: async (facility, year, month) => {
    return db.query(`SELECT sum(wwbs.totalwaterwithdrawl) as totalwaterwithdrawl, wwbs.water_supply_treatment_id,   wwbs.month, wwbs.year, f.AssestName, wwbs.water_withdrawl, wstg.water_supply
                     FROM \`water_withdrawl_by_source\` wwbs, \`dbo.facilities\`  f, water_supply_treatment_category wstg 
                     WHERE wwbs.month in (${month}) and wwbs.year=${year} and wstg.facilities = f.ID and wstg.id = wwbs.water_supply_treatment_id and wstg.facilities in (${facility})
                     GROUP BY wwbs.water_supply_treatment_id, wwbs.water_withdrawl,  wwbs.year 
                     ORDER BY FIELD(wwbs.MONTH,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },

  getCompanyOwnedVehiclesMultiAudit: async (facility, year, month) => {
    return db.query(`select 'Scope3' as scope, 'Company Owned Vehicle' as category, vt.vehicle_type as DataPoint1, vs.vehicle_type as DataPoint2, vde.Unit, vs.emission_factor, CONCAT('kg CO2e/',vde.Unit) AS emission_factor_name,\
                     sum(vde.GHGEmission) as Emission,  vde.year as Years, vde.months as Months, vs.reference,  \
                     f.AssestName as facility from  \`dbo.vehiclede\` vde, \`dbo.facilities\`  f,   \
                     vehicletypes vt, vehicle_subcategory vs   \
                     where   vde.facilities in (${facility})   \
                     and vde.year = ${year} and vde.months in (${month})   \
                     and  vde.facilities= f.ID  \
                     and  vs.vehicle_category_id = vt.id and vde.vehicleTypeID = vs.id   \
                     group by DataPoint2, Years ORDER BY FIELD(MONTHS,'Jan','Feb','Mar','Apr', 'May','Jun',                  
                    'Jul','Aug','Sep','Oct','Nov', 'Dec')`);
  },


};
