const db = require("../utils/database");
const config = require("../config");
const baseurl = config.base_url;

module.exports = {

getCombustionEmission : async (facilities,year) => {
    let where = "";
    let year1 = parseInt(year) + 1;
    where  =  ` where  A.Year Between '${year}' and '${year1}' `;

    if(facilities != '0'){
        where += `  and A.facility_id IN (${facilities})`
    }
    where += ` and  A.Month IN ("Apr","May","Jun","July","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.Month !="" GROUP BY A.Month`

    return db.query(`select    SUM(A.GHGEmission) as emission, COALESCE('Stationary Combustion', '')  as  category ,A.Month AS month_number from stationarycombustionde A ${where}`); 
    },

Allrefrigerants: async (facilities,year) => {
    let where = "";
       where  =  ` where  A.Year = '${year}'`;
    if(facilities != '0'){
        where += `  and  A.facilities IN (${facilities})`
    }
    where += ` and A.months IN ("Apr","May","Jun","July","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and A.months !="" GROUP BY A.months`
    return db.query("select  SUM(A.GHGEmission) as emission,A.months AS month_number,COALESCE('Refrigerants', '')  as  category   from `dbo.refrigerantde` A "+where);
    },

Allfireextinguisher: async (facilities,year) => {
    let where = "";
        where  =  ` where  A.Year = '${year}'`;
    if(facilities != '0'){
        where += `  and  A.facilities IN (${facilities})`
    }
    where += `and A.months IN ("Apr","May","Jun","July","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and A.months !="" GROUP BY A.months`
    return db.query("select  SUM(A.GHGEmission) as emission,A.months AS month_number,COALESCE('Fire Extinguisher', '')  as  category    from `dbo.fireextinguisherde` A "+where);
   },

getAllcompanyownedvehicles: async (facilities,year) => {
    let where = "";
        where  =  ` where  A.Year = '${year}'`;
    if(facilities != '0'){
        where += `  and  A.facilities IN (${facilities})`
    }
    where += ` and A.months IN ("Apr","May","Jun","July","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and A.months !="" GROUP BY A.months`
    return db.query("select  SUM(A.GHGEmission) as emission,A.months AS month_number,COALESCE('Company Owned Vehicles', '')  as  category    from `dbo.vehiclede` A  "+where);
   },
  
   getAllelectricity: async (facilities,year) => {
    let where = "";
    where  =  ` where  A.Year = '${year}'`;
    if(facilities != '0'){
        where += `  and  A.facilities IN (${facilities})` //
    }
    where += ` and A.months IN ("Apr","May","Jun","July","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and A.months !="" GROUP BY A.months`
    return db.query("select SUM(A.GHGEmission) as emission,A.months AS month_number,COALESCE('Electricity', '')  as  category   from `dbo.renewableelectricityde` A "+where);
   },

   getAllheatandsteam: async (facilities,year) => {
    let where = "";
    where  =  ` where  A.Year = '${year}'`;
    if(facilities != '0'){
        where += `  and  A.facilities IN (${facilities})`
    }
    where += `and A.months IN ("Apr","May","Jun","July","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and A.months !="" GROUP BY A.months`
    return db.query("select  SUM(A.GHGEmission) as emission,A.months AS month_number,COALESCE('Heat and Steam', '')  as  category  from `dbo.heatandsteamde` A "+where);
   },

   purchaseGoodsDetails: async (facilities,year) => {
    let where = "";
    where  =  ` where  A.year = '${year}'`;
    if(facilities != '0'){
        where += `  and  A.facilities IN (${facilities})` //
    }
    where += `and A.month IN ("Apr","May","Jun","July","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and A.month !="" GROUP BY A.month`
    return db.query("select SUM(A.emission) as emission,A.month AS month_number,COALESCE('Purchased goods and services', '')  as  category from purchase_goods_categories A "+where);
   },

   flight_travelDetails: async (facilities,year) => {
    let where = "";
    where  =  ` where  A.year = '${year}'`;
    if(facilities != '0'){
        where += `  and  A.facilities IN (${facilities})`
    }
    where += `and A.month IN ("Apr","May","Jun","July","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and A.month !="" GROUP BY A.month`

    return db.query("select  SUM(A.emission) as emission,A.month AS month_number,COALESCE('Business Travel', '')  as  category  from flight_travel A "+where);
   },

   hotel_stayDetails: async (facilities,year) => {
    let where = "";
    where  =  ` where  A.year = '${year}'`;
    if(facilities != '0'){
        where += `  and  A.facilities IN (${facilities})`
    }
    where += `and A.month IN ("Apr","May","Jun","July","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and A.month !="" GROUP BY A.month`

    return db.query("select   SUM(A.emission) as emission,A.month AS month_number,COALESCE('Business Travel', '')  as  category  from hotel_stay A "+where);
   },

   other_modes_of_transportDetails: async (facilities,year) => {
    let where = "";
    where  =  ` where  A.year = '${year}'`;
    if(facilities != '0'){
        where += `  and  A.facilities IN (${facilities})`
    }
    where += `and A.month IN ("Apr","May","Jun","July","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and A.month !="" GROUP BY A.month`

    return db.query("select SUM(A.emission) as emission,A.month AS month_number,COALESCE('Business Travel', '')  as  category from other_modes_of_transport A "+where);
   },

   sold_product_categoryDetails: async (facilities,year) => {
    let where = "";
    where  =  ` where  A.year = '${year}'`;
    if(facilities != '0'){
        where += `  and  A.facilities IN (${facilities})`
    }
    where += `and A.month IN ("Apr","May","Jun","July","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and A.month !="" GROUP BY A.month`

    return db.query("select SUM(A.emission) as emission,A.month AS month_number,COALESCE('Use of Sold Products', '')  as  category   from sold_product_category A "+where);
   },

   processing_of_sold_products_categoryDetails: async (facilities,year) => {
    let where = "";
    where  =  ` where  A.year = '${year}'`;
    if(facilities != '0'){
        where += `  and  A.facilities IN (${facilities})`
    }
    
    where += `and A.month IN ("Apr","May","Jun","July","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and A.month !="" GROUP BY A.month,A.unit`

    return db.query("select  SUM(A.emission) as emission,A.month AS month_number,COALESCE('Processing of Sold Products', '')  as  category, A.unit from processing_of_sold_products_category A "+where);
   },

   endoflife_waste_typeDetails: async (facilities,year) => {
    let where = "";
    where  =  ` where  A.year = '${year}'`;
    if(facilities != '0'){
        where += `  and  A.facilities IN (${facilities})`
    }
    where += `and A.month IN ("Apr","May","Jun","July","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and A.month !="" GROUP BY A.month`

    return db.query("select SUM(A.emission) as emission,A.month AS month_number,COALESCE('End-of-Life Treatment of Sold Products', '')  as  category from endof_lifetreatment_category A "+where);
   },

   water_supply_treatment_categoryDetails: async (facilities,year) => {
    let where = "";
    where  =  ` where  A.year = '${year}'`;
    if(facilities != '0'){
        where += `  and  A.facilities IN (${facilities})`
    }
    where += `and A.month IN ("Apr","May","Jun","July","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and A.month !="" GROUP BY A.month`

    return db.query("select SUM(A.emission) as emission,A.month AS month_number,COALESCE('Water Supply and Treatment', '')  as  category from water_supply_treatment_category A "+where);
   },

   employee_commuting_categoryDetails: async (facilities,year) => {
    let where = "";
    where  =  ` where  A.year = '${year}'`;
    if(facilities != '0'){
        where += `  and  A.facilities IN (${facilities})`
    }
    where += `and A.month IN ("Apr","May","Jun","July","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and A.month !="" GROUP BY A.month`

    return db.query("select  SUM(A.emission) as emission,A.month AS month_number,COALESCE('Employee Commuting', '')  as  category from employee_commuting_category A "+where);
   },

   homeoffice_categoryDetails: async (facilities,year) => {
    let where = "";
    where  =  ` where  A.year = '${year}'`;
    if(facilities != '0'){
        where += `  and  A.facilities IN (${facilities})`
    }
    where += `and A.month IN ("Apr","May","Jun","July","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and A.month !="" GROUP BY A.month`

    return db.query("select SUM(A.emission) as emission,A.month AS month_number,COALESCE('Home Office', '')  as  category from homeoffice_category A "+where);
   },


   waste_generated_emissionsDetails: async (facilities,year) => {
    let where = "";
    where  =  ` where  A.year = '${year}'`;
    if(facilities != '0'){
        where += `  and  A.facility_id IN (${facilities})`
    }
    where += `and A.month IN ("Apr","May","Jun","July","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and A.month !="" GROUP BY A.month`

    return db.query("select SUM(A.emission) as emission,A.month AS month_number,COALESCE('Waste generated in operations', '')  as  category from waste_generated_emissions A "+where);
   },

   
   upstreamLease_emissionDetails: async (facilities,year) => {
    let where = "";
    where  =  ` where  A.year = '${year}'`;
    if(facilities != '0'){
        where += `  and  A.facilities IN (${facilities})`
    }
    where += `and A.month IN ("Apr","May","Jun","July","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and A.month !="" GROUP BY A.month`

    return db.query("select  SUM(A.emission) as emission,A.month AS month_number,COALESCE('Upstream Leased Assets', '')  as  category  from upstreamLease_emission A "+where);
   },

   downstreamLease_emissionDetails: async (facilities,year) => {
    let where = "";
    where  =  ` where  A.year = '${year}'`;
    if(facilities != '0'){
        where += `  and  A.facility_id IN (${facilities})`
    }
    where += `and A.month IN ("Apr","May","Jun","July","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and A.month !="" GROUP BY A.month`

    return db.query("select SUM(A.emission) as emission,A.month AS month_number,COALESCE('Downstream Leased Assets', '')  as  category from downstreamLease_emission A "+where);
   },

   franchise_categories_emissionDetails: async (facilities,year) => {
    let where = "";
    where  =  ` where  A.year = '${year}'`;
    if(facilities != '0'){
        where += `  and  A.facility_id IN (${facilities})`
    }
    where += `and A.month IN ("Apr","May","Jun","July","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and A.month !="" GROUP BY A.month`

    return db.query("select SUM(A.emission) as emission,A.month AS month_number,COALESCE('Franchises', '')  as  category  from franchise_categories_emission A  "+where);
   },

   investment_emissionsDetails: async (facilities,year) => {
    let where = "";
    where  =  ` where  A.year = '${year}'`;
    if(facilities != '0'){
        where += `  and  A.facilities IN (${facilities})`
    }
    where += `and A.month IN ("Apr","May","Jun","July","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and A.month !="" GROUP BY A.month`

    return db.query("select SUM(A.emission) as emission,A.month AS month_number,COALESCE('Investments', '')  as  category  from investment_emissions A  "+where);
   },

   upstream_vehicle_storage_emissions: async (facilities,year) => {
    let where = "";
    where  =  ` where  A.year = '${year}'`;
    if(facilities != '0'){
        where += `  and  A.facility_id IN (${facilities})`
    }
    where += `and A.month IN ("Apr","May","Jun","July","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and A.month !="" GROUP BY A.month`

    return db.query("select  SUM(A.emission) as emission,A.month AS month_number,COALESCE('Upstream Transportation and Distribution', '')  as  category from upstream_vehicle_storage_emissions A  "+where);
   },

   downstream_vehicle_storage_emissions: async (facilities,year) => {
    let where = "";
    where  =  ` where  A.year = '${year}'`;
    if(facilities != '0'){
        where += `  and  A.facility_id IN (${facilities})`
    }
    where += `and A.month IN ("Apr","May","Jun","July","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and A.month !="" GROUP BY A.month`

    return db.query("select SUM(A.emission) as emission,A.month AS month_number,COALESCE('Downstream Transportation and Distribution', '')  as  category from downstream_vehicle_storage_emissions A  "+where);
   },


   purchaseGoodsBySupplier: async (facilities) => {
    let where = " where  status = 'S'";
   
    if(facilities != '0'){
        where += ` and A.facilities IN (${facilities})` //
    }
    where += `   GROUP BY A.supplier,A.unit`;
    //where += `and A.month IN ("Apr","May","Jun","July","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and A.month !="" GROUP BY A.month`
    return db.query("select SUM(A.emission) as emission,A.unit,A.supplier,COALESCE('Purchased goods and services', '')  as  category from purchase_goods_categories A "+where);
   },



   
   flight_travelDetailsByemssion: async (facilities,year,flight_type,flight_class) => {
    let where = "";
    where  =  ` where  A.year = '${year}'`;
    if(facilities != '0'){
        where += `  and  A.facilities IN (${facilities})`
    }
    if(flight_type){
        where += `  and  A.flight_Type LIKE '%${flight_type}%'`
    }

    if(flight_class){
        where += `  and  A.flight_Class = '${flight_class}'`
    }
    return db.query("select  SUM(A.emission) as emission from flight_travel A "+where);
   },


   hotel_stayDetailsemssion: async (facilities,year) => {
    let where = "";
    where  =  ` where  A.year = '${year}'`;
    if(facilities != '0'){
        where += `  and  A.facilities IN (${facilities})`
    }

    return db.query("select   SUM(A.emission) as emission from hotel_stay A "+where);
   },

   other_modes_of_transportDetailsemssion: async (facilities,year,other) => {
    let where = "";
    where  =  ` where  A.year = '${year}'`;
    if(facilities != '0'){
        where += `  and  A.facilities IN (${facilities})`
    }
    if(other){
        where += `  and  A.mode_of_trasport ='${other}'`
    }else{
        where += `  and A.mode_of_trasport !='Car'`
    }

    return db.query("select SUM(A.emission) as emission from other_modes_of_transport A "+where);
   },


   waste_generated_emissionsDetailsEmssion: async (facilities,year) => {
    let where = "";
    where  =  ` where  A.year = '${year}'`;
    if(facilities != '0'){
        where += `  and  A.facility_id IN (${facilities})`
    }

    return db.query("select A.* from waste_generated_emissions A "+where);
   },



   waste_generated_emissionsDetailsEmssionByMethod: async (facilities,year,method) => {
    let where = "";
    where  =  ` where  A.year = '${year}'`;
    if(facilities != '0'){
        where += `  and  A.facility_id IN (${facilities})`
    }
    where += ` and A.method = '${method}' GROUP BY A.year, A.facility_id, A.method`
    return db.query("select SUM(A.total_waste) as emission,A.year,A.facility_id,A.method from waste_generated_emissions A "+where);
   },


   

   waste_generated_emissionsDetailsEmssionByloop: async (facilities,year,loop) => {
    let where = "";
    where  =  ` where  A.year = '${year}'`;
    if(facilities != '0'){
        where += `  and  A.facility_id IN (${facilities})`
    }
    where += ` and A.waste_loop = '${loop}' GROUP BY A.year, A.facility_id, A.waste_loop`
    return db.query("select SUM(A.total_waste) as emission,A.waste_loop,A.year,A.facility_id from waste_generated_emissions A "+where);
   },


   water_supply_treatment_categoryDetailsemission: async (facilities,year) => {
    let where = "";
    where  =  ` where  A.year = '${year}' `;
    if(facilities != '0'){
        where += `  and  A.facilities IN (${facilities})`
    }
   
    return db.query("select A.* from water_supply_treatment_category A "+where);
   },

   water_supply_treatment_graph: async (facilities,year) => {
    let where = "";
    where  =  ` where  A.year = '${year}'`;
    if(facilities != '0'){
        where += `  and  A.facilities IN (${facilities})`
    }
    where += `and A.month IN ("Apr","May","Jun","July","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and A.month !="" `

    return db.query("select A.month AS month_number,A.emission,A.id from water_supply_treatment_category A "+where);
   },


   getCombustionEmissionDetail : async (facilities,year,SubCategoriesID) => {
    let where = "";
    where  =  ` where  A.Year = '${year}' `;

    if(facilities != '0'){
        where += `  and A.facility_id IN (${facilities})`
    }

    where += ` and  A.SubCategoriesID = '${SubCategoriesID}'`

    return db.query(`select  SUM(A.GHGEmission) as emission from stationarycombustionde A ${where}`); 
    },
  
    getAllelectricityDetail: async (facilities,year,SubCategorySeedID) => {
        let where = "";
        where  =  ` where  A.Year = '${year}' `;
        if(facilities != '0'){
            where += `  and  A.facilities IN (${facilities})` //
        }
        if(SubCategorySeedID == 1002){
            where += ` and A.SubCategorySeedID ="${SubCategorySeedID}" `
        }else{
            where += ` and A.SubCategorySeedID !="1002" `
        }
        return db.query("select SUM(A.GHGEmission) as emission from `dbo.renewableelectricityde` A "+where);
       },

       getAllelectricityDetailByCat: async (facilities,year) => {
        let where = "";
        where  =  ` where  A.Year = '${year}' `;
        if(facilities != '0'){
            where += `  and  A.facilities IN (${facilities})` //
        }
        
        //  where += ` and A.SubCategorySeedID ="${SubCategorySeedID}" `
        
        return db.query("select SUM(A.GHGEmission) as emission from `dbo.renewableelectricityde` A "+where);
       },
    
  /////////////////////////////////newwwwwwwwwww//////////////////////////////
  waste_generated_emissionsDetailsEmssionByMethodemission: async (facilities,year,method) => {
    let where = "";
    where  =  ` where  A.year = '${year}'`;
    if(facilities != '0'){
        where += `  and  A.facility_id IN (${facilities})`
    }
    where += ` and A.method = '${method}' GROUP BY A.year, A.facility_id, A.method`
    return db.query("select SUM(A.emission) as emission,A.year,A.facility_id,A.method from waste_generated_emissions A "+where);
   },

   offsetemission: async (user_id) => {
    where = ` where user_id = '${user_id}' GROUP BY A.offset`
    return db.query("select SUM(A.offset) as offset,A.user_id from user_offseting A "+where);
   },

   actionsEmission: async (user_id) => {
    where = ` where user_id = '${user_id}' and status = 'Achieved' GROUP BY A.co2_savings_tcoe`
    return db.query("select SUM(A.co2_savings_tcoe) as emission,A.user_id from actions A "+where);
   },



   waste_generated_emissionsByproduct: async (facilities,year,product) => {
    let where = "";
    where  =  ` where  A.year = '${year}'`;
    if(facilities != '0'){
        where += `  and  A.facility_id IN (${facilities})`
    }
    const productsplit = product.split(',');
    let joinproduct = productsplit.join("','");

    where += ` and A.product IN ('${joinproduct}') GROUP BY A.year, A.facility_id, A.product`
    return db.query("select SUM(A.emission) as emission,A.year,A.facility_id,A.product from waste_generated_emissions A "+where);
   },

}
