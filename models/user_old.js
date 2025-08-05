const db = require("../utils/database");
const config = require("../config");
const baseurl = config.base_url;

module.exports = {

fetchEmail : ( async(Email) => {
        return db.query('select * from  `dbo.tenants`  where Email = ?',[Email]);
    }),  
    
fetchEmailUser : ( async(Email) => {
        return db.query('select * from  `dbo.aspnetusers`  where Email = ?',[Email]);
    }), 
fetchUserByEmail : ( async(Email) => {
    return db.query('select A.companyName,A.Email as companyEmail,A.numberOfUserAllowed,A.licenseExpired,B.refreshToken,B.tenantID,A.Id,B.userName,A.licenseType, B.refreshTokenExpiryTime as expiration from `dbo.tenants` A JOIN  `dbo.aspnetusers` B ON B.email = A.Email where A.Email = ? and B.email = "'+Email +'"',[Email]);
}),


fetchfacilitiesBytenants: ( async(tenantID) => {
    return db.query('select facilityID from  `dbo.aspnetuserroles`  where tenant_id = ?  GROUP BY facilityID',[tenantID]);
}), 


getCombustionEmission : async (facilities,year) => {
    return db.query(`select  COALESCE('stationarycombustionde', '')  as  tablename ,B.Id as subcategoryID,B.Item as subcatName,A.ReadingValue as readingValue,A.Unit as unit,A.Status as status,Year as year ,Month as month,
    GHGEmission as emission,BlendType as blendType,
    BlendPercent as blendPercent,A.*,TypeName as typeName,facility_id  from stationarycombustionde A  LEFT JOIN  subcategoryseeddata B ON B.Id  = A.SubCategoriesID   where  A.facility_id= ? and A.year = ? ORDER BY A.id DESC  `,[facilities,year]); 
  },

  Allrefrigerants: async (facilities,year) => {
    return db.query("select  COALESCE('dbo.refrigerantde', '')  as  tablename ,S.Id as subcategoryID,S.Item as subcatName,A.RefAmount as refAmount,A.Unit as unit,A.Status as status ,A.year, A.months as month, A.GHGEmission as emission,A.user_id,A.TypeName as typeName,facilities,A.*, B.Item,B.Item as TypeName,B.kgCO2e_kg from `dbo.refrigerantde` A LEFT JOIN `dbo.refrigents` B ON B.subCatTypeID = A.subCategoryTypeId LEFT JOIN  subcategoryseeddata S ON S.Id = A.SubCategorySeedID where A.facilities=? and A.year = ? ORDER BY A.id DESC ", [facilities,year]);
   },

Allfireextinguisher: async (facilities,year) => {
    return db.query("select COALESCE('dbo.fireextinguisherde', '')  as  tablename ,S.Id as subcategoryID,S.Item as subcatName,A.Unit as unit,A.Status as status,A.months as month,A.GHGEmission as emission,A.*,B.item,B.kgCO2e_kg from `dbo.fireextinguisherde` A LEFT JOIN `dbo.fireextinguisher` B ON B.ID = A.subCategoryTypeId LEFT JOIN  subcategoryseeddata S ON S.Id = A.SubCategorySeedID where A.facilities=? and A.year = ? ORDER BY A.id DESC  ", [facilities,year]);
   },

getAllcompanyownedvehicles: async (facilities,year) => {
    var join = "";
    // if(ModeofDEID == '1'){
    //   join = ' LEFT JOIN  `dbo.passengervehicletypes` B ON A.VehicleTypeID = B.ID';
    // }else{
    //   join = ' LEFT JOIN  `dbo.deliveryvehicletypes` B ON A.VehicleTypeID = B.ID';
    // }
    return db.query("select COALESCE('dbo.vehiclede', '')  as  tablename ,S.Id as subcategoryID,S.Item as subcatName,A.Unit as unit,A.Status as status,A.months as month,A.GHGEmission as emission,A.* from `dbo.vehiclede` A  LEFT JOIN  subcategoryseeddata S ON S.Id = A.SubCategorySeedID where  A.facilities = ? AND A.year = ?   ORDER BY A.id DESC ",[facilities,year]);
   },
  
   getAllelectricity: async (facilities,year) => {
    return db.query("select  COALESCE('dbo.renewableelectricityde', '')  as  tablename ,S.Id as subcategoryID,S.Item as subcatName,A.Unit as unit,A.Status as status,A.months as month,A.GHGEmission as emission,A.TypeName as typeName,A.*,B.RegionName from `dbo.renewableelectricityde` A LEFT JOIN  \`dbo\.\electricity\` B ON B.RegionID = A.RegionID LEFT JOIN  subcategoryseeddata S ON S.Id = A.SubCategorySeedID where A.facilities=? and A.year = ?  ORDER BY A.id DESC", [facilities,year]);
   },

   getAllheatandsteam: async (facilities,year) => {
    return db.query("select COALESCE('dbo.heatandsteamde', '')  as  tablename ,S.Id as subcategoryID,S.Item as subcatName,A.Unit as unit,A.Status as status,A.months as month,A.GHGEmission as emission,A.TypeName as typeName,A.* from `dbo.heatandsteamde` A LEFT JOIN  subcategoryseeddata S ON S.Id = A.SubCategorySeedID where A.facilities=? and A.year = ?   ORDER BY A.id DESC ", [facilities,year]);
   },

   purchaseGoodsDetails: async (facilities,year) => {
    return db.query("select COALESCE('purchase_goods_categories', '')  as  tablename ,A.*,COALESCE('', '')  as  subcatName ,COALESCE('', '')  as subcategoryID from purchase_goods_categories A where A.facilities=? and A.year = ?  ORDER BY A.id DESC", [facilities,year]);
   },

   flight_travelDetails: async (facilities,year) => {
    return db.query("select COALESCE('flight_travel', '')  as  tablename ,A.*,COALESCE('', '')  as  subcatName ,COALESCE('', '')  as subcategoryID from flight_travel A where A.facilities=? and A.year = ?   ORDER BY A.id DESC", [facilities,year]);
   },

   hotel_stayDetails: async (facilities,year) => {
    return db.query("select COALESCE('hotel_stay', '')  as  tablename ,A.*,COALESCE('', '')  as  subcatName ,COALESCE('', '')  as subcategoryID from hotel_stay A where A.facilities=? and A.year = ?  ORDER BY A.id DESC ", [facilities,year]);
   },

   other_modes_of_transportDetails: async (facilities,year) => {
    return db.query("select  COALESCE('other_modes_of_transport', '')  as  tablename ,A.*,COALESCE('', '')  as  subcatName ,COALESCE('', '')  as subcategoryID from other_modes_of_transport A where A.facilities=? and A.year = ?  ORDER BY A.id DESC ", [facilities,year]);
   },

   sold_product_categoryDetails: async (facilities,year) => {
    return db.query("select  COALESCE('sold_product_category', '')  as  tablename ,A.*,COALESCE('', '')  as  subcatName ,COALESCE('', '')  as subcategoryID from sold_product_category A where A.facilities=? and A.year = ?   ORDER BY A.id DESC", [facilities,year]);
   },

   processing_of_sold_products_categoryDetails: async (facilities,year) => {
    return db.query("select COALESCE('processing_of_sold_products_category', '')  as  tablename ,A.*,COALESCE('', '')  as  subcatName ,COALESCE('', '')  as subcategoryID from processing_of_sold_products_category A where A.facilities=? and A.year = ?  ORDER BY A.id DESC ", [facilities,year]);
   },

   endoflife_waste_typeDetails: async (facilities,year) => {
    return db.query("select COALESCE('endof_lifetreatment_category', '')  as  tablename ,A.waste_unit as unit,A.*,COALESCE('', '')  as  subcatName ,COALESCE('', '')  as subcategoryID from endof_lifetreatment_category A where A.facilities= ? and A.year = ?   ORDER BY A.id DESC", [facilities,year]);
   },

   water_supply_treatment_categoryDetails: async (facilities,year) => {
    return db.query("select  COALESCE('water_supply_treatment_category', '')  as  tablename ,A.*,COALESCE('', '')  as  subcatName ,COALESCE('', '')  as subcategoryID from water_supply_treatment_category A where A.facilities= ? and A.year = ?  ORDER BY A.id DESC ", [facilities,year]);
   },

   employee_commuting_categoryDetails: async (facilities,year) => {
    return db.query("select COALESCE('employee_community_typeoftransport', '')  as  tablename ,A.*,B.type,COALESCE('', '')  as  subcatName ,COALESCE('', '')  as subcategoryID from employee_commuting_category A LEFT JOIN  employee_community_typeoftransport B ON B.id = A.typeoftransport where A.facilities= ? and A.year = ?   ORDER BY A.id DESC", [facilities,year]);
   },

   homeoffice_categoryDetails: async (facilities,year) => {
    return db.query("select COALESCE('homeoffice_categoryDetails', '')  as  tablename ,A.*,B.typeof_homeoffice as typeof_homeoffice_name,COALESCE('', '')  as  subcatName ,COALESCE('', '')  as subcategoryID from homeoffice_category A  LEFT JOIN  homeoffice_emission_factors B ON  B.id = A.typeofhomeoffice where A.facilities= ? and  YEAR(A.created_at) = YEAR(CURRENT_DATE())  ORDER BY A.id DESC ", [facilities,year]);
   },


   waste_generated_emissionsDetails: async (facilities,year) => {
    return db.query("select COALESCE('waste_generated_emissions', '')  as  tablename ,A.*,COALESCE('', '')  as  subcatName ,COALESCE('', '')  as subcategoryID from waste_generated_emissions A  where A.facility_id= ? and year = ?   ORDER BY A.id DESC", [facilities,year]);
   },

   
   upstreamLease_emissionDetails: async (facilities,year) => {
    return db.query("select COALESCE('upstreamLease_emission', '')  as  tablename ,A.*,COALESCE('', '')  as  subcatName ,COALESCE('', '')  as subcategoryID from upstreamLease_emission A  where A.facility_id= ? and year = ?   ORDER BY A.id DESC", [facilities,year]);
   },

   downstreamLease_emissionDetails: async (facilities,year) => {
    return db.query("select COALESCE('downstreamLease_emission', '')  as  tablename ,A.*,COALESCE('', '')  as  subcatName ,COALESCE('', '')  as subcategoryID from downstreamLease_emission A  where A.facility_id= ? and year = ?   ORDER BY A.id DESC", [facilities,year]);
   },

   franchise_categories_emissionDetails: async (facilities,year) => {
    return db.query("select  COALESCE('franchise_categories_emission', '')  as  tablename ,A.*,COALESCE('', '')  as  subcatName ,COALESCE('', '')  as subcategoryID from franchise_categories_emission A  where A.facility_id= ? and year = ?  ORDER BY A.id DESC ", [facilities,year]);
   },

   investment_emissionsDetails: async (facilities,year) => {
    return db.query("select  COALESCE('investment_emissions', '')  as  tablename ,A.*,COALESCE('', '')  as  subcatName ,COALESCE('', '')  as subcategoryID from investment_emissions A  where A.facilities= ? and year = ?  ORDER BY A.id DESC ", [facilities,year]);
   },

   upstream_vehicle_storage_emissions: async (facilities,year) => {
    return db.query("select  COALESCE('upstream_vehicle_storage_emissions', '')  as  tablename ,A.*,COALESCE('', '')  as  subcatName ,COALESCE('', '')  as subcategoryID from upstream_vehicle_storage_emissions A  where A.facility_id= ? and year = ?   ORDER BY A.id DESC", [facilities,year]);
   },

   downstream_vehicle_storage_emissions: async (facilities,year) => {
    return db.query("select COALESCE('downstream_vehicle_storage_emissions', '')  as  tablename ,A.*,COALESCE('', '')  as  subcatName ,COALESCE('', '')  as subcategoryID from downstream_vehicle_storage_emissions A  where A.facility_id= ? and year = ?   ORDER BY A.id DESC", [facilities,year]);
   },

   updateAllData: async (tablename,id,status) => {
    return db.query(" UPDATE `"+tablename+"` SET  "+status+" where "+id);
   },

   updateAllDataeject: async (tablename,id,status,reason) => {
    return db.query(" UPDATE `"+tablename+"` SET  "+status+" "+reason+ " where "+id);
   },

   Addgroup: async (data) => {
    return db.query("insert into  `dbo.group`  set ?", [data]);
   },

   Addgroupmapping: async (data) => {
    return db.query("insert into  `dbo.groupmapping` set ?", [data]);
   },


   registerUser: async (data) => {
    return db.query("insert into  `dbo.aspnetusers` set ?", [data]);
   },


   registeruserRoles: async (data) => {
    return db.query("insert into  `dbo.aspnetuserroles` set ?", [data]);
   },




   Addtenants: async (data) => {
    return db.query("insert into  `dbo.tenants` set ?", [data]);
   },
   
   Updategroup : async(GroupName, id) =>{
    return db.query("update `dbo.group` set groupname =? where id= ?", [GroupName,id]);
    },

   getGroups : ( async(tenantID) => {
        return db.query('select * from  `dbo.group` where tenantID = ?',[tenantID]);
    }), 

   Addfacilities: async (data) => {
        return db.query("insert into  `dbo.facilities` set ?", [data]);
       },
    
    getRoles : ( async() => {
        return db.query('select * from  `dbo.aspnetroles` where status = 1');
    }), 
    
    fetchAllusers : ( async(tenantID) => {
        return db.query('select A.user_id,A.email,A.user_id,A.tenantID,A.firstname,A.lastname,A.username,B.tenantName,B.companyName,B.licenseType,B.numberOfUserAllowed,B.Email,B.Id as tenant_id,B.Id as companyEmail from `dbo.aspnetusers` A JOIN  `dbo.tenants` B ON A.email = B.Email  where  A.tenantID = ?',[tenantID]);
    }),
      
    getcountries : ( async() => {
        return db.query('SELECT * FROM `dbo.country`');
    }), 
    Addpackages_user: (async (data) => {
        return db.query("insert into  `packages_users`  set ?", [data]);
    }),
    
    user_offseting: (async (data) => {
        return db.query("insert into  `user_offseting`  set ?", [data]);
    }),

    listuser_offseting: (async (data) => {
        return db.query("SELECT * FROM  `user_offseting`  ");
    }),
    
    addVendor: (async (data) => {
        return db.query("insert into  `vendor`  set ?", [data]);
    }),
}