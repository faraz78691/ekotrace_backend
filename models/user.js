const db = require("../utils/database");
const config = require("../config");
const Fuse = require('fuse.js');
const fuzz = require('fuzzball');

module.exports = {

    fetchUserByEmailOrUsername: async (email) => {
        return await db.query('select * from  `dbo.tenants`  where Email = ? OR userName = ?', [email, email]);
    },

    fetchEmail: (async (Email) => {
        return db.query('select * from  `dbo.tenants`  where Email = ?', [Email]);
    }),

    fetchDatabyId: (async (Id) => {
        return db.query('select * from  `dbo.tenants`  where Id  = ?', [Id]);
    }),


    fetchEmailUser: (async (Email) => {
        return db.query('select * from  `dbo.aspnetusers`  where Email = ?', [Email]);
    }),

    fetchUserByUserName: async (username) => {
        return db.query('select * from  `dbo.aspnetusers`  where username = ?', [username]);
    },

    fetchUserByEmail: (async (Email) => {
        return db.query('select A.logoName, A.companyName,A.Email as companyEmail,A.numberOfUserAllowed,A.licenseExpired,B.refreshToken,B.tenantID,A.Id,B.userName,A.licenseType, B.refreshTokenExpiryTime as expiration from `dbo.tenants` A JOIN  `dbo.aspnetusers` B ON B.email = A.Email where A.Email = "' + Email + '" or A.userName = "' + Email + '"');
    }),


    fetchUserBySuperAdmin: (async () => {
        return db.query('select A.companyName,B.user_id,A.Email as companyEmail,A.numberOfUserAllowed,A.licenseExpired,B.refreshToken,B.tenantID,A.Id,B.userName,A.licenseType, B.refreshTokenExpiryTime as expiration from `dbo.tenants` A JOIN  `dbo.aspnetusers` B ON B.email = A.Email where A.is_super_admin = 1', []);
    }),


    fetchfacilitiesBytenants: (async (tenantID) => {
        return db.query('select facilityID from  `dbo.aspnetuserroles`  where tenant_id = ?  GROUP BY facilityID', [tenantID]);
    }),


    getCombustionEmission: async (facilities, year) => {
        return db.query(`select  COALESCE('stationarycombustionde', '')  as  tablename ,B.Id as subcategoryID,B.Item as subcatName,A.ReadingValue as readingValue,A.Unit as unit,A.Status as status,Year as year ,Month as month, GHGEmission as emission,BlendType as blendType,E.scope3_kgCO2e_kg,E.scope3_kg_CO2e_litres,E.scope3_kgCO2e_kwh,E.scope3_kgCO2e_tonnes,E.kgCO2e_kg,E.kgCO2e_kwh,E.cv_perlitre,E.kgCO2e_litre,E.kgCO2e_tonnes, BlendPercent as blendPercent,A.*,TypeName as typeName,facility_id  from stationarycombustionde A  LEFT JOIN  subcategoryseeddata B ON B.Id  = A.SubCategoriesID JOIN  stationarycombustion E ON E.SubCatTypeID  = A.TypeID  where  A.facility_id= ? and A.year = ? and TRIM(E.Item) = TRIM(A.TypeName) GROUP BY A.id ORDER BY A.id DESC  `, [facilities, year]);
    },

    getCombustionEmissionFuel: async (facilities, year) => {
        return db.query(`select  COALESCE('stationarycombustionde', '')  as  tablename ,B.Id as subcategoryID,B.Item as subcatName,A.ReadingValue as readingValue,A.Unit as unit,A.Status as status,Year as year ,Month as month, Scope3GHGEmission as emission,BlendType as blendType,E.scope3_kgCO2e_kg,E.scope3_kg_CO2e_litres,E.scope3_kgCO2e_kwh,E.scope3_kgCO2e_tonnes,E.kgCO2e_kg,E.kgCO2e_kwh,E.cv_perlitre,E.kgCO2e_litre,E.kgCO2e_tonnes, BlendPercent as blendPercent,A.*,TypeName as typeName,facility_id  from stationarycombustionde A  LEFT JOIN  subcategoryseeddata B ON B.Id  = A.SubCategoriesID JOIN  stationarycombustion E ON E.SubCatTypeID  = A.TypeID  where  A.facility_id= ? and A.year = ? and TRIM(E.Item) = TRIM(A.TypeName) GROUP BY A.id ORDER BY A.id DESC  `, [facilities, year]);
    },

    Allrefrigerants: async (facilities, year) => {
        return db.query("select  COALESCE('dbo.refrigerantde', '')  as  tablename ,S.Id as subcategoryID,S.Item as subcatName,A.RefAmount as refAmount,A.Unit as unit,A.Status as status ,A.year, A.months as month, A.GHGEmission as emission,A.user_id,A.TypeName as typeName,facilities,A.*, B.Item,B.Item as TypeName,B.kgCO2e_kg from `dbo.refrigerantde` A LEFT JOIN `dbo.refrigents` B ON B.ID = A.subCategoryTypeId LEFT JOIN  subcategoryseeddata S ON S.Id = A.SubCategorySeedID where A.facilities=? and A.year = ? ORDER BY A.id DESC ", [facilities, year]);
    },

    Allfireextinguisher: async (facilities, year) => {
        return db.query("select COALESCE('dbo.fireextinguisherde', '')  as  tablename ,S.Id as subcategoryID,S.Item as subcatName,A.Unit as unit,A.Status as status,A.months as month,A.GHGEmission as emission,A.*,B.item,B.kgCO2e_kg from `dbo.fireextinguisherde` A LEFT JOIN `dbo.fireextinguisher` B ON B.ID = A.subCategoryTypeId LEFT JOIN  subcategoryseeddata S ON S.Id = A.SubCategorySeedID where A.facilities=? and A.year = ? ORDER BY A.id DESC  ", [facilities, year]);
    },

    getAllcompanyownedvehicles: async (facilities, year) => {
        var join = "";
        // SELECT COALESCE('dbo.vehiclede', '') AS tablename, S.Id AS subcategoryID, S.Item AS subcatName, A.Unit AS unit, A.Status AS STATUS , E.kgCO2e_km, E.kgCO2e_litre, E.kgCO2e_kg, A.months AS month, A.GHGEmission AS emission, A.* FROM `dbo.vehiclede` A LEFT JOIN subcategoryseeddata S ON S.Id = A.SubCategorySeedID LEFT JOIN companyownedvehicles E ON E.VehicleTypeID = A.vehicleTypeID WHERE A.facilities = 1 AND A.year = 2025 AND E.SubCategorySeedID = A.SubCategorySeedID ORDER BY A.id DESC;
        return db.query("SELECT DISTINCT COALESCE('dbo.vehiclede', '') as tablename, S.Id as subcategoryID, S.Item as subcatName, A.Unit as unit, A.Status as status, E.kgCO2e_km, E.kgCO2e_litre, E.kgCO2e_kg, E.kgCO2e_ccy, A.months as month, A.GHGEmission as emission, A.* FROM `dbo.vehiclede` A LEFT JOIN subcategoryseeddata S ON S.Id = A.SubCategorySeedID LEFT JOIN companyownedvehicles E ON E.ID = A.vehicleTypeID AND E.SubCategorySeedID = A.SubCategorySeedID WHERE A.facilities = ? AND A.year = ? ORDER BY A.id DESC;", [facilities, year]);
    },

    getAllelectricity: async (facilities, year) => {
        return db.query(`
            SELECT 
              'dbo.renewableelectricityde' AS tablename,
              S.Id AS subcategoryID,
              S.Item AS subcatName,
              A.Unit AS unit,
              A.Status AS status,
              A.months AS month,
              A.GHGEmission AS emission,
              A.TypeName AS typeName,
              A.readingValue AS readingValue,
              A.FileName AS FileName,
              A.RegionID AS RegionID,
              A.emission_factor AS emission_factor,
              A.SourceName AS SourceName,
              A.user_id AS user_id,
              A.id AS id,
              B.RegionName
            FROM \`dbo.renewableelectricityde\` A
            LEFT JOIN (
                SELECT RegionID, MIN(RegionName) AS RegionName
                FROM \`dbo.electricity\`
                GROUP BY RegionID
            ) B ON B.RegionID = A.RegionID
            LEFT JOIN \`subcategoryseeddata\` S ON S.Id = A.SubCategorySeedID
            WHERE A.facilities = ?
              AND A.year = ?
            ORDER BY A.id DESC
        `, [facilities, year]);
    },
    

    getAllheatandsteam: async (facilities, year) => {
        return db.query("SELECT COALESCE('dbo.heatandsteamde', '') AS tablename, S.Id AS subcategoryID, S.Item AS subcatName, A.Unit AS unit, CASE WHEN A.Status = 'P' THEN 'Pending' ELSE 'Approved' END AS status, A.months AS month, A.GHGEmission AS emission, B.Item AS typeName, A.* FROM `dbo.heatandsteamde` A LEFT JOIN subcategoryseeddata S ON S.Id = A.SubCategorySeedID LEFT JOIN `dbo.heatandsteam` B ON B.ID = A.typeID WHERE A.facilities = ? AND A.year = ? ORDER BY A.id DESC;", [facilities, year]);
    },

    purchaseGoodsDetails: async (facilities, year) => {
        return db.query("select COALESCE('purchase_goods_categories', '')  as  tablename ,A.*,COALESCE('', '')  as  subcatName ,COALESCE('', '')  as subcategoryID from purchase_goods_categories A where A.facilities=? and A.year = ?  ORDER BY A.id DESC", [facilities, year]);
    },

    flight_travelDetails: async (facilities, year) => {
        return db.query("SELECT COALESCE('flight_travel', '') AS tablename, A.*, COALESCE('', '') AS subcatName, COALESCE('', '') AS subcategoryID, A.distance AS avg_distance FROM flight_travel A WHERE A.facilities = ? AND A.year = ? ORDER BY A.id DESC;", [facilities, year]);
    },

    hotel_stayDetails: async (facilities, year) => {
        return db.query("select COALESCE('hotel_stay', '')  as  tablename ,A.*,COALESCE('', '')  as  subcatName ,COALESCE('', '')  as subcategoryID from hotel_stay A where A.facilities=? and A.year = ?  ORDER BY A.id DESC ", [facilities, year]);
    },

    other_modes_of_transportDetails: async (facilities, year) => {
        return db.query("select  COALESCE('other_modes_of_transport', '')  as  tablename ,A.*,COALESCE('', '')  as  subcatName ,COALESCE('', '')  as subcategoryID from other_modes_of_transport A where A.facilities=? and A.year = ?  ORDER BY A.id DESC ", [facilities, year]);
    },

    sold_product_categoryDetails: async (facilities, year) => {
        return db.query("select  COALESCE('sold_product_category', '')  as  tablename ,A.*,COALESCE('', '')  as  subcatName ,COALESCE('', '')  as subcategoryID from sold_product_category A where A.facilities=? and A.year = ?   ORDER BY A.id DESC", [facilities, year]);
    },

    processing_of_sold_products_categoryDetails: async (facilities, year) => {
        return db.query("select COALESCE('processing_of_sold_products_category', '')  as  tablename ,A.*,COALESCE('', '')  as  subcatName ,COALESCE('', '')  as subcategoryID from processing_of_sold_products_category A where A.facilities=? and A.year = ?  ORDER BY A.id DESC ", [facilities, year]);
    },

    endoflife_waste_typeDetails: async (facilities, year) => {
        return db.query("select COALESCE('endof_lifetreatment_category', '')  as  tablename ,A.waste_unit as unit,A.*,COALESCE('', '')  as  subcatName ,COALESCE('', '')  as subcategoryID from endof_lifetreatment_category A where A.facilities= ? and A.year = ?   ORDER BY A.id DESC", [facilities, year]);
    },

    water_supply_treatment_categoryDetails: async (facilities, year) => {
        return db.query("select  COALESCE('water_supply_treatment_category', '')  as  tablename ,A.*,A.water_treatment as water_discharged_value,COALESCE('', '')  as  subcatName ,COALESCE('', '')  as subcategoryID from water_supply_treatment_category A where A.facilities= ? and A.year = ?  ORDER BY A.id DESC ", [facilities, year]);
    },

    employee_commuting_categoryDetails: async (facilities, year) => {
        return db.query("SELECT COALESCE('employee_commuting_category', '') AS tablename, A.*, B.category AS category_name, C.subcategory AS type, COALESCE('', '') AS subcatName, COALESCE('', '') AS subcategoryID FROM employee_commuting_category A LEFT JOIN employee_community_typeoftransport B ON B.category_id = A.typeoftransport LEFT JOIN employee_community_typeoftransport C ON C.id = A.subtype WHERE A.facilities = ? AND A.year = ? GROUP BY A.id ORDER BY A.id DESC;", [facilities, year]);
    },

    homeoffice_categoryDetails: async (facilities, year) => {
        return db.query("select COALESCE('homeoffice_category', '')  as  tablename ,A.*,B.typeof_homeoffice as typeof_homeoffice_name,COALESCE('', '')  as  subcatName ,COALESCE('', '')  as subcategoryID from homeoffice_category A  LEFT JOIN  homeoffice_emission_factors B ON  B.id = A.typeofhomeoffice where A.facilities= ? and  YEAR(A.created_at) = YEAR(CURRENT_DATE())  ORDER BY A.id DESC ", [facilities, year]);
    },


    waste_generated_emissionsDetails: async (facilities, year) => {
        return db.query("select COALESCE('waste_generated_emissions', '')  as  tablename ,A.*,COALESCE('', '')  as  subcatName ,COALESCE('', '')  as subcategoryID from waste_generated_emissions A  where A.facility_id= ? and year = ?   ORDER BY A.id DESC", [facilities, year]);
    },


    upstreamLease_emissionDetails: async (facilities, year) => {
        return db.query("select COALESCE('upstreamLease_emission', '')  as  tablename ,A.*,COALESCE('', '')  as  subcatName ,COALESCE('', '')  as subcategoryID from upstreamLease_emission A  where A.facility_id= ? and year = ?   ORDER BY A.id DESC", [facilities, year]);
    },

    downstreamLease_emissionDetails: async (facilities, year) => {
        return db.query("select COALESCE('downstreamLease_emission', '')  as  tablename ,A.*,COALESCE('', '')  as  subcatName ,COALESCE('', '')  as subcategoryID from downstreamLease_emission A  where A.facility_id= ? and year = ?   ORDER BY A.id DESC", [facilities, year]);
    },

    franchise_categories_emissionDetails: async (facilities, year) => {
        return db.query("select  COALESCE('franchise_categories_emission', '')  as  tablename ,A.*,COALESCE('', '')  as  subcatName ,COALESCE('', '')  as subcategoryID from franchise_categories_emission A  where A.facility_id= ? and year = ?  ORDER BY A.id DESC ", [facilities, year]);
    },

    investment_emissionsDetails: async (facilities, year) => {
        let yeardata = "";
        if (year) {
            yeardata = `  and year = '${year}' `;
        }
        return db.query(`select  COALESCE('investment_emissions', '')  as  tablename ,A.*,COALESCE('', '')  as  subcatName ,COALESCE('', '')  as subcategoryID from investment_emissions A  where A.sub_group_id= ?  ${yeardata} ORDER BY A.id DESC `, [facilities]);
    },

    upstream_vehicle_storage_emissions: async (facilities, year) => {
        return db.query("SELECT COALESCE( 'upstream_vehicle_storage_emissions', '' ) AS tablename, A.*, COALESCE('', '') AS subcatName, COALESCE('', '') AS subcategoryID, vehicletypes.vehicle_type AS vehicle_type_name FROM upstream_vehicle_storage_emissions A LEFT JOIN vehicletypes ON vehicletypes.id = A.vehicle_type WHERE A.facility_id = ? AND YEAR = ? ORDER BY A.id DESC;", [facilities, year]);
    },

    downstream_vehicle_storage_emissions: async (facilities, year) => {
        return db.query("SELECT COALESCE( 'downstream_vehicle_storage_emissions', '' ) AS tablename, A.*, COALESCE('', '') AS subcatName, COALESCE('', '') AS subcategoryID, vehicletypes.vehicle_type AS vehicle_type_name FROM downstream_vehicle_storage_emissions A LEFT JOIN vehicletypes ON vehicletypes.id = A.vehicle_type WHERE A.facility_id = ? AND YEAR = ? ORDER BY A.id DESC;", [facilities, year]);
    },

    updateAllData: async (tablename, id, status) => {
        return db.query(" UPDATE `" + tablename + "` SET  " + status + " where " + id);
    },
    deleteById: async (tablename, idColumn, idValue) => {
        return db.query("Delete into  `dbo.groupmapping` set ?", [data]);
    },
    deleteEntries: async (tablename, idValue) => {
        const query = `DELETE FROM \`${tablename}\` WHERE id = ?`;
        return db.query(query, [idValue]);
      },
    rejectEntries: async (tablename, idValue) => {
        const query = `UPDATE \`${tablename}\` SET status = 'R' WHERE id = ?`;
        return db.query(query, [idValue]);
      },

    updateAllDataeject: async (tablename, id, status, reason) => {
        return db.query(" UPDATE `" + tablename + "` SET  " + status + " " + reason + " where " + id);
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


    registerPackage: async (data) => {
        return db.query("insert into  packages_users set ?", [data]);
    },

    registeruserRoles: async (data) => {
        return db.query("insert into  `dbo.aspnetuserroles` set ?", [data]);
    },


    updateUserTenant: async (tenantId, userId) => {
        return db.query("update `dbo.aspnetusers` set tenantID = ? where user_id = ?", [tenantId, userId]);
    },

    Addtenants: async (data) => {
        return db.query("insert into  `dbo.tenants` set ?", [data]);
    },

    Updategroup: async (GroupName, id) => {
        return db.query("update `dbo.group` set groupname =? where id= ?", [GroupName, id]);
    },

    getGroups: (async (tenantID) => {
        return db.query('select * from  `dbo.group` where tenantID = ? and (group_by =2 or group_by=1)', [tenantID]);
    }),

    Addfacilities: async (data) => {
        return db.query("insert into  `dbo.facilities` set ?", [data]);
    },

    getRoles: (async () => {
        return db.query('select * from  `dbo.aspnetroles` where status = 1');
    }),

    fetchAllusers: (async (tenantID, search) => {
        return db.query('select A.user_id,A.email,A.user_id,A.tenantID,A.firstname,A.lastname,A.username,B.tenantName,B.companyName,B.licenseType,B.numberOfUserAllowed,B.Email,B.Id as tenant_id,B.Id as companyEmail from `dbo.aspnetusers` A JOIN  `dbo.tenants` B ON A.email = B.Email  where  A.tenantID = ? AND (A.username LIKE ? OR B.tenantName LIKE ? OR B.Email LIKE ?)', [tenantID, `%${search}%`, `%${search}%`, `%${search}%`]);
    }),

    getcountries: (async () => {
        return db.query('SELECT * FROM `dbo.country`');
    }),
    Addpackages_user: (async (data) => {
        return db.query("insert into  `packages_users`  set ?", [data]);
    }),

    user_offseting: (async (data) => {
        return db.query("insert into  `user_offseting`  set ?", [data]);
    }),

    addVendor: (async (data) => {
        return db.query("insert into  `vendor`  set ?", [data]);
    }),

    listuser_offseting: (async (data) => {
        return db.query("SELECT * FROM  `user_offseting`  ");
    }),


    //////////////////////////////////new /////////////////////

    update_user_offseting: async (user, id) => {
        return db.query("update `user_offseting` set ? where id= ?", [user, id]);
    },

    addhazadrous_nonhazadrous: (async (data) => {
        return db.query("insert into  `hazadrous_nonhazadrous_setting`  set ?", [data]);
    }),

    updatehazadrous_nonhazadrous: async (user, id) => {
        return db.query("update `hazadrous_nonhazadrous_setting` set ? where user_id= ?", [user, id]);
    },

    addfinancial_year: (async (data) => {
        return db.query("insert into  `financial_year_setting`  set ?", [data]);
    }),


    addcost_center: (async (data) => {
        return db.query("insert into  `cost_center`  set ?", [data]);
    }),


    updatePackages: async (user, tenantID) => {
        return db.query("update `packages_users` set ? where tenantID= ?", [user, tenantID]);
    },

    // forgot password started

    updateToken: async (token, id) => {
        return await db.query('UPDATE `dbo.tenants` SET `forgot_token`= ? WHERE Id = ?', [token, id]);
    },
    updatePassword: async (table, where, data) => {
        return db.query(`update ${table} SET ? ${where}`, [data]);
    },

    fetchByForgotToken: (async (token) => {
        return db.query('select * from  `dbo.tenants`  where forgot_token = ?', [token]);
    }),

    // Abhishek Lodhi 25-02-2025

    findFacilityWithCountryCode: async (id) => {
        return await db.query('SELECT B.CurrencyCode FROM `dbo.facilities` AS A LEFT JOIN `dbo.country` AS B ON B.ID = A.CountryId WHERE A.ID = ?', [id]);
    },
    findCountryNamebyCode: async (code) => {
        return await db.query('SELECT Name FROM `dbo.country` WHERE ID = ?', [code]);
    },

    findVendorByTenantId: async (id) => {
        return await db.query("SELECT * FROM `vendor` WHERE user_id = ?;", [id]);
    },

    getPurchaseCategoriesEf: async (product, country_code, year) => {
        const cleanedInput = product.trim();

        const results = await db.query(`SELECT purchase_goods_categories_ef.*, B.typesofpurchasename FROM purchase_goods_categories_ef LEFT JOIN \`dbo.typesofpurchase\` AS B ON B.id = purchase_goods_categories_ef.typeofpurchase where purchase_goods_categories_ef.country_id = ${country_code} AND Right(purchase_goods_categories_ef.Fiscal_Year,4) = ${year}` );

        if (results.length > 1) {
            const fuse = new Fuse(results, {
                keys: ['product'],
                includeScore: true,
                threshold: 0.3,
                ignoreLocation: true,
                useExtendedSearch: true
            });

            const fuseResults = fuse.search(cleanedInput).slice(0, 5).map(r => ({ id: r.item.id, text: r.item.product, score: r.score, source: 'fuse' }));;

            const fuzzResults = results.map(item => {
                const ratio = fuzz.token_set_ratio(cleanedInput, item.product);
                return {
                    id: item.id,
                    typeofpurchase: item.typeofpurchase,
                    product_code_id: item.product_code_id,
                    created_at: item.created_at,
                    category: item.category,
                    sub_category: item.sub_category,
                    product: item.product,
                    HSN_code: item.HSN_code,
                    NAIC_code: item.NAIC_code,
                    ISIC_code: item.ISIC_code,
                    country_id: item.country_id,
                    typesofpurchasename: item.typesofpurchasename,
                    other_category_flag: item.other_category_flag,
                    score: 1 - ratio / 100,
                    source: 'fuzz'
                };
            }).filter(r => (1 - r.score) * 100 >= 60).slice(0, 5);

            const merged = new Map();
            for (const r of [...fuseResults, ...fuzzResults]) {
                if (!merged.has(r.id) || merged.get(r.id).score > r.score) {
                    merged.set(r.id, r);
                }
            }

            return Array.from(merged.values())
                .filter(r => r.score <= 0.5)
                .sort((a, b) => a.score - b.score);
        }
        return results;
    },

    getAllPurchaseCategoriesEf: async (countryCode, year) => {
        return await db.query('SELECT purchase_goods_categories_ef.*, B.typesofpurchasename FROM purchase_goods_categories_ef LEFT JOIN `dbo.typesofpurchase` AS B ON B.id = purchase_goods_categories_ef.typeofpurchase WHERE purchase_goods_categories_ef.country_id = ? AND Right(purchase_goods_categories_ef.Fiscal_Year,4) = ?', [countryCode, year]);
    },

    findCompanyOwnedVehicleByItemType: async (vehicle_type, CountryId) => {
        const searchPattern = `%${vehicle_type}%`;
        return await db.query('SELECT * FROM `companyownedvehicles` WHERE ItemType LIKE ? AND country_id = ?', [searchPattern, CountryId]);
    },

    addVechileFeet: async (data) => {
        return await db.query('INSERT INTO `tbl_vehicle_fleet` SET ?', [data]);
    },

    updateVechileFeet: async (data, id) => {
        const query = `UPDATE tbl_vehicle_fleet 
            SET facility_id = ?, category = ?, vehicle_model = ?, fuel_type = ?, 
                type_engine = ?, company_owned_vehicle_id = ?, charging_outside = ?, 
                quantity = ?, acquisition_date = ?, retire_vehicle = ?, user_id = ?
            WHERE id = ?`;

        const values = [
            data.facility_id, data.category, data.vehicle_model, data.fuel_type,
            data.type_engine, data.company_owned_vehicle_id, data.charging_outside,
            data.quantity, data.acquisition_date, data.retire_vehicle, data.user_id, id
        ];

        return await db.query(query, values);
    },

    deleteVehicleFleetByFacilityId: async (id, category) => {
        return await db.query('DELETE FROM `tbl_vehicle_fleet` WHERE facility_id = ? AND category= ?', [id, category])
    },

    getVehicleFleetByFacilityId: async (facility_id) => {
        return await db.query('SELECT tbl_vehicle_fleet.*, companyownedvehicles.ItemType AS vehicle_type FROM `tbl_vehicle_fleet` LEFT JOIN companyownedvehicles ON companyownedvehicles.ID = tbl_vehicle_fleet.company_owned_vehicle_id WHERE tbl_vehicle_fleet.facility_id = ?', [facility_id]);
    },

    getVehicleFleetByFacilityCategoryId: async (facility_id, category_id) => {
        return await db.query('SELECT tbl_vehicle_fleet.*, companyownedvehicles.ItemType AS vehicle_type FROM `tbl_vehicle_fleet` LEFT JOIN companyownedvehicles ON companyownedvehicles.ID = tbl_vehicle_fleet.company_owned_vehicle_id WHERE tbl_vehicle_fleet.facility_id = ? AND tbl_vehicle_fleet.category = ?;', [facility_id, category_id])
    },

    insertPurchaseGoodsPayloads: async (data) => {
        return await db.query('INSERT INTO `purchase_goods_payloads` SET ?', [data]);
    },

    insertPurchaseGoodsMatched: async (data) => {
        return await db.query('INSERT INTO `purchase_goods_matched_items_ai` SET ?', [data]);
    },

    insertPurchaseGoodsUnmatched: async (data) => {
        return await db.query('INSERT INTO `purchase_goods_unmatched_items_ai` SET ?', [data]);
    },

    getPurchaseGoodsPayloadsByUserAndFacilityId: async (userId, facilityID) => {
        await db.query('WITH payload_counts AS( SELECT p.id, COALESCE(u.unmatched_count, 0) AS unmatched_count FROM purchase_goods_payloads p LEFT JOIN( SELECT purchase_payload_id, COUNT(*) AS unmatched_count FROM purchase_goods_unmatched_items_ai GROUP BY purchase_payload_id ) u ON u.purchase_payload_id = p.id WHERE p.user_id = ? AND p.facility_id = ? ) UPDATE purchase_goods_payloads AS p JOIN payload_counts pc ON pc.id = p.id SET p.status = 1 WHERE pc.unmatched_count = 0;', [userId, facilityID]);
        return await db.query('SELECT purchase_goods_payloads.*, COUNT(purchase_goods_matched_items_ai.id) AS matched_no_of_rows FROM purchase_goods_payloads LEFT JOIN purchase_goods_matched_items_ai ON purchase_goods_matched_items_ai.purchase_payload_id = purchase_goods_payloads.id WHERE purchase_goods_payloads.user_id = ? AND purchase_goods_payloads.facility_id = ? GROUP BY purchase_goods_payloads.id;', [userId, facilityID])
    },

    purchase_goods_matched_items_ai_by_payload_id: async (id) => {
        return await db.query('SELECT * FROM `purchase_goods_matched_items_ai` WHERE purchase_payload_id = ?', [id])
    },

    purchase_goods_categories_ef_by_match_productCategory_Id: async (id) => {
        return await db.query('SELECT purchase_goods_categories_ef.*, B.typesofpurchasename FROM purchase_goods_categories_ef LEFT JOIN `dbo.typesofpurchase` AS B ON B.id = purchase_goods_categories_ef.typeofpurchase WHERE purchase_goods_categories_ef.id = ?', [id]);
    },

    purchase_goods_matched_items_ai_by_payload_id_and_status_paginated :async(payload_id, status, page, limit)=> {
        if(status == null){
            const offset = (page - 1) * limit;
          
            const data = await db.query(`
              SELECT * FROM purchase_goods_matched_items_ai
              WHERE purchase_payload_id = ?
              LIMIT ? OFFSET ?
            `, [Number(payload_id),  Number(limit), Number(offset)]);
          
            const  [{totalCount}]  = await db.query(`
              SELECT COUNT(*) AS totalCount
              FROM purchase_goods_matched_items_ai
              WHERE purchase_payload_id = ? 
            `, [Number(payload_id)]);
            console.log(totalCount);
            return { data, totalCount }
          }
        else{
            const offset = (page - 1) * limit;
          
            const data = await db.query(`
              SELECT * FROM purchase_goods_matched_items_ai
              WHERE purchase_payload_id = ? AND status = ?
              LIMIT ? OFFSET ?
            `, [Number(payload_id), Number(status), Number(limit), Number(offset)]);
          
            const  [{totalCount}]  = await db.query(`
              SELECT COUNT(*) AS totalCount
              FROM purchase_goods_matched_items_ai
              WHERE purchase_payload_id = ? AND status = ?
            `, [Number(payload_id), Number(status)]);
            console.log(totalCount);
            return { data, totalCount }
          }

        }
      

}