const db = require("../utils/database");

module.exports = {
    getFacilitiesAreaByFacilityId: async (facilities) => {
        return await db.query(`SELECT SUM(total_area) AS area FROM \`dbo.facilities\` WHERE ID IN(${facilities});`);
    },
    getCombustionEmission: async (facilities, year, finalyeardata) => {
        let where = "";
        let year1 = parseInt(year) + 1;
        where = ` where  A.Year = '${year}'  and Status = 'S' `;

        if (facilities != '0') {
            where += `  and A.facility_id IN (${facilities})`
        }

        if (finalyeardata == '2') {
            where += ` and  A.Month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.Month !="" GROUP BY A.Month`

        } else {
            where += ` and  A.Month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.Month !="" GROUP BY A.Month`
        }


        return db.query(`select SUM(A.GHGEmission) as emission, SUM(A.Scope3GHGEmission) as scope3_emission, COALESCE('Stationary Combustion', '')  as  category ,A.Month AS month_number from stationarycombustionde A ${where}`);
    },

    Allrefrigerants: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.Year = '${year}' and Status = 'S'`;
        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities})`
        }
        if (finalyeardata == '2') {
            where += ` and  A.months IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.months !="" GROUP BY A.months`
        } else {
            where += ` and  A.months IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.months !="" GROUP BY A.months`
        }

        return db.query("select  SUM(A.GHGEmission) as emission,A.months AS month_number,COALESCE('Refrigerants', '')  as  category   from `dbo.refrigerantde` A " + where);
    },

    Allfireextinguisher: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.Year = '${year}' and Status = 'S'`;
        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities})`
        }
        if (finalyeardata == '2') {
            where += ` and  A.months IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.months !="" GROUP BY A.months`
        } else {
            where += ` and  A.months IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.months !="" GROUP BY A.months`
        }
        return db.query("select  SUM(A.GHGEmission) as emission,A.months AS month_number,COALESCE('Fire Extinguisher', '')  as  category    from `dbo.fireextinguisherde` A " + where);
    },

    getAllcompanyownedvehicles: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.Year = '${year}' and Status = 'S'`;
        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities})`
        }
        if (finalyeardata == '2') {
            where += ` and  A.months IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.months !="" GROUP BY A.months`
        } else {
            where += ` and  A.months IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.months !="" GROUP BY A.months`
        }
        return db.query("select  SUM(A.GHGEmission) as emission,A.months AS month_number,COALESCE('Company Owned Vehicles', '')  as  category    from `dbo.vehiclede` A  " + where);
    },

    getAllelectricity: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.Year = '${year}' and Status = 'S'`;
        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities})`
        }
        if (finalyeardata == '2') {
            where += ` and  A.months IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.months !="" GROUP BY A.months`
        } else {
            where += ` and  A.months IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.months !="" GROUP BY A.months`
        }
        return db.query("select SUM(A.GHGEmission) as emission,SUM(A.scop3_GHGEmission) as scope3_emission,A.months AS month_number,COALESCE('Electricity', '')  as  category   from `dbo.renewableelectricityde` A " + where);
    },

    getAllheatandsteam: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.Year = '${year}' and Status = 'S'`;
        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities})`
        }
        if (finalyeardata == '2') {
            where += ` and  A.months IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.months !="" GROUP BY A.months`
        } else {
            where += ` and  A.months IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.months !="" GROUP BY A.months`
        }
        return db.query("select  SUM(A.GHGEmission) as emission,SUM(A.scop3GHGEmission) as scope3_emission,A.months AS month_number,COALESCE('Heat and Steam', '')  as  category  from `dbo.heatandsteamde` A " + where);
    },

    purchaseGoodsDetails: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}'  and status = 'S'`;
        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities})` //
        }
        if (finalyeardata == '2') {
            where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month`
        } else {
            where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`
        }
        return db.query("select SUM(A.emission) as emission,A.month AS month_number,COALESCE('Purchased goods and services', '')  as  category from purchase_goods_categories A " + where);
    },

    goodsServicesDetails: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' AND A.status = 'S' AND A.typeofpurchase IN (1,3)`;
        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities})` //
        }
        if (finalyeardata == '2') {
            where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month`
        } else {
            where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`
        }
        return db.query("select SUM(A.emission) as emission,A.month AS month_number,COALESCE('Standard goods & services', '')  as  category from purchase_goods_categories A " + where);
    },

    capitalGoodsDetails: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}'  and A.status = 'S' AND A.typeofpurchase = '2'`;
        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities})` //
        }
        if (finalyeardata == '2') {
            where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month`
        } else {
            where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`
        }
        return db.query("select SUM(A.emission) as emission,A.month AS month_number,COALESCE('Capital goods', '')  as  category from purchase_goods_categories A " + where);
    },

    flight_travelDetails: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;
        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities})`
        }
        if (finalyeardata == '2') {
            where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month`
        } else {
            where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`
        }
        return db.query("select  SUM(A.emission) as emission,A.month AS month_number,COALESCE('Business Travel', '')  as  category  from flight_travel A " + where);
    },

    hotel_stayDetails: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;
        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities})`
        }

        if (finalyeardata == '2') {
            where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month`
        } else {
            where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`
        }

        return db.query("select   SUM(A.emission) as emission,A.month AS month_number,COALESCE('Business Travel', '')  as  category  from hotel_stay A " + where);
    },

    other_modes_of_transportDetails: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;
        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities})`
        }

        if (finalyeardata == '2') {
            where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month`
        } else {
            where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`
        }

        return db.query("select SUM(A.emission) as emission,A.month AS month_number,COALESCE('Business Travel', '')  as  category from other_modes_of_transport A " + where);
    },

    processing_of_sold_products_categoryDetails: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;
        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities})`
        }
        if (finalyeardata == '2') {
            where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month`
        } else {
            where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`
        }
        return db.query("select  SUM(A.emission) as emission,A.month AS month_number,COALESCE('Processing of Sold Products', '')  as  category from processing_of_sold_products_category A " + where);
    },

    getAllCoal: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.Year = '${year}' and A.Status = 'S' AND A.TypeName LIKE '%Coal%'`;
        if (facilities != '0') {
            where += `  and  A.facility_id IN (${facilities})`
        }
        if (finalyeardata == '2') {
            where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month`
        } else {
            where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`
        }
        return db.query("select  SUM(A.GHGEmission) as emission,A.month AS month_number,COALESCE('Coal', '')  as  category from stationarycombustionde A " + where);
    },

    sold_product_categoryDetails: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;
        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities})`
        }

        if (finalyeardata == '2') {
            where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month`
        } else {
            where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`
        }

        return db.query("select SUM(A.emission) as emission,A.month AS month_number,COALESCE('Use of Sold Products', '')  as  category   from sold_product_category A " + where);
    },

    endoflife_waste_typeDetails: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;
        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities})`
        }
        if (finalyeardata == '2') {
            where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month`
        } else {
            where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`
        }
        return db.query("select SUM(A.emission) as emission,A.month AS month_number,COALESCE('End-of-Life Treatment of Sold Products', '')  as  category from endof_lifetreatment_category A " + where);
    },

    water_supply_treatment_categoryDetails: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;
        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities})`
        }
        if (finalyeardata == '2') {
            where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month`
        } else {
            where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`
        }
        return db.query("select SUM(A.emission) as emission,A.month AS month_number,COALESCE('Water Supply and Treatment', '')  as  category from water_supply_treatment_category A " + where);
    },

    employee_commuting_categoryDetails: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;
        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities})`
        }
        if (finalyeardata == '2') {
            where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month`
        } else {
            where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`
        }
        return db.query("select  SUM(A.emission) as emission,A.month AS month_number,COALESCE('Employee Commuting', '')  as  category from employee_commuting_category A " + where);
    },

    homeoffice_categoryDetails: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;
        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities})`
        }
        if (finalyeardata == '2') {
            where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month`
        } else {
            where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`
        }
        return db.query("select SUM(A.emission) as emission,A.month AS month_number,COALESCE('Home Office', '')  as  category from homeoffice_category A " + where);
    },

    waste_generated_emissionsDetails: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;
        if (facilities != '0') {
            where += `  and  A.facility_id IN (${facilities})`
        }
        if (finalyeardata == '2') {
            where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month`
        } else {
            where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`
        }
        return db.query("select SUM(A.emission) as emission,A.month AS month_number,COALESCE('Waste generated in operations', '')  as  category from waste_generated_emissions A " + where);
    },

    upstreamLease_emissionDetails: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;
        if (facilities != '0') {
            where += `  and  A.facility_id IN (${facilities})`
        }
        if (finalyeardata == '2') {
            where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month`
        } else {
            where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`
        }
        return db.query("select  SUM(A.emission) as emission,A.month AS month_number,COALESCE('Upstream Leased Assets', '')  as  category  from upstreamLease_emission A " + where);
    },

    downstreamLease_emissionDetails: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;
        if (facilities != '0') {
            where += `  and  A.facility_id IN (${facilities})`
        }
        if (finalyeardata == '2') {
            where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month`
        } else {
            where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`
        }
        return db.query("select SUM(A.emission) as emission,A.month AS month_number,COALESCE('Downstream Leased Assets', '')  as  category from downstreamLease_emission A " + where);
    },

    franchise_categories_emissionDetails: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;
        if (facilities != '0') {
            where += `  and  A.facility_id IN (${facilities})`
        }
        if (finalyeardata == '2') {
            where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month`
        } else {
            where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`
        }
        return db.query("select SUM(A.emission) as emission,A.month AS month_number,COALESCE('Franchises', '')  as  category  from franchise_categories_emission A  " + where);
    },

    investment_emissionsDetails: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;
        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities})`
        }
        if (finalyeardata == '2') {
            where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month`
        } else {
            where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`
        }
        return db.query("select SUM(A.emission) as emission,A.month AS month_number,COALESCE('Investments', '')  as  category  from investment_emissions A  " + where);
    },

    upstream_vehicle_storage_emissions: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;
        if (facilities != '0') {
            where += `  and  A.facility_id IN (${facilities})`
        }
        if (finalyeardata == '2') {
            where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month`
        } else {
            where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`
        }
        return db.query("select  SUM(A.emission) as emission,A.month AS month_number,COALESCE('Upstream Transportation and Distribution', '')  as  category from upstream_vehicle_storage_emissions A  " + where);
    },

    downstream_vehicle_storage_emissions: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;
        if (facilities != '0') {
            where += `  and  A.facility_id IN (${facilities})`
        }
        if (finalyeardata == '2') {
            where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month`
        } else {
            where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`
        }
        return db.query("select SUM(A.emission) as emission,A.month AS month_number,COALESCE('Downstream Transportation and Distribution', '')  as  category from downstream_vehicle_storage_emissions A  " + where);
    },

    waste_generated_emissionsDetailsEmssion: async (facilities, year) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;
        if (facilities != '0') {
            where += `  and  A.facility_id IN (${facilities})`
        }

        return db.query("select A.* from waste_generated_emissions A " + where);
    },

    waste_generated_emissionsDetailsEmssionByMethodemission: async (facilities, year, method) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;
        if (facilities != '0') {
            where += `  and  A.facility_id IN (${facilities})`
        }
        where += ` and A.method = '${method}' GROUP BY A.year, A.facility_id, A.method`
        return db.query("select SUM(A.emission) as emission,A.year,A.facility_id,A.method from waste_generated_emissions A " + where);
    },

    getTop3CombustionEmission: async (facility_id, year) => {
        return db.query('SELECT ROUND(SUM(A.GHGEmission) / 1000, 4) as Total_GHGEmission, A.TypeName \
       FROM stationarycombustionde A \
    WHERE \
    A.facility_id =? \
    AND Year = ? \
GROUP BY TypeName \
ORDER BY Total_GHGEmission DESC LIMIT 3', [facility_id, year]);
    },

    getTop3ReferenceEmission: async (facility_id, year) => {
        return db.query('SELECT \
    r.TypeName,\
            SUM(r.GHGEmission) AS Total_GHGEmission,\
            ref.Item   \
FROM`dbo.refrigerantde` r  \
LEFT JOIN`dbo.refrigents` ref ON r.subCategoryTypeId = ref.ID  \
WHERE r.facilities = ?    \
GROUP BY r.TypeName, ref.Item   \
ORDER BY Total_GHGEmission DESC   \
LIMIT 1; ', [facility_id, year]);
    },

    getCombustionEmissionData: async (facility_id, year) => {
        return db.query(`SELECT ROUND(SUM(A.GHGEmission) / 1000, 4) AS Total_GHGEmission, A.TypeName 
                    FROM stationarycombustionde A 
                    WHERE A.facility_id IN (?) AND A.Year = ?
                    GROUP BY A.TypeName 
                    ORDER BY Total_GHGEmission DESC LIMIT 3;`, [facility_id, year]);
    },

    getRefrigerantEmissionData: async (facility_id, year) => {
        try {
            return await db.query('SELECT ROUND(SUM(r.GHGEmission) / 1000, 4) AS Total_GHGEmission, ref.Item AS TypeName FROM `dbo.refrigerantde` r LEFT JOIN `dbo.refrigents` ref ON ref.subCatTypeID = r.subCategoryTypeId WHERE r.facilities IN(?) AND r.year = ? GROUP BY ref.Item ORDER BY Total_GHGEmission DESC LIMIT 1;', [facility_id, year])
        } catch (error) {
            console.error("Database Error:", error);
            throw error;
        }
    },

    getExtinguisherEmissionData: async (facility_id, year) => {
        try {
            return await db.query('SELECT ROUND(SUM(GHGEmission) / 1000, 4) AS Total_GHGEmission, facilities, year FROM `dbo.fireextinguisherde` WHERE facilities IN (?) AND year = ? AND STATUS = "S" GROUP BY facilities, year;', [facility_id, year])
        } catch (error) {
            console.error("Database Error:", error);
            throw error;
        }
    },

    getDieselPassengerData: async (facility_id, year) => {
        return await db.query('SELECT ROUND(SUM(v.GHGEmission) / 1000, 4) AS Total_GHGEmission, v.facilities, p.VehicleType FROM `dbo.vehiclede` AS v LEFT JOIN `dbo.passengervehicletypes` AS p ON v.VehicleTypeId = p.ID WHERE v.facilities IN (?) AND v.year = ? AND p.VehicleType LIKE "%Diesel%" AND v.Status = "S" and v.SubCategorySeedID = 10 GROUP BY v.facilities, p.VehicleType;', [facility_id, year]);
    },

    getPetrolPassengerData: async (facility_id, year) => {
        return await db.query('SELECT ROUND(SUM(v.GHGEmission) / 1000, 4) AS Total_GHGEmission, v.facilities, p.VehicleType FROM `dbo.vehiclede` AS v LEFT JOIN `dbo.passengervehicletypes` p ON v.VehicleTypeId = p.ID WHERE v.facilities IN (?) AND v.year = ? AND p.VehicleType LIKE "%Petrol%" AND v.Status = "S" and v.SubCategorySeedID = 10 GROUP BY v.facilities, p.VehicleType;', [facility_id, year]);
    },

    getDieselDeliveryData: async (facility_id, year) => {
        try {
            return await db.query('SELECT ROUND(SUM(v.GHGEmission) / 1000, 4) AS Total_GHGEmission, v.facilities, p.VehicleType FROM `dbo.vehiclede` AS v LEFT JOIN `dbo.passengervehicletypes` p ON v.VehicleTypeId = p.ID WHERE v.facilities IN (?) AND v.year = ? AND p.VehicleType LIKE "%Diesel%" AND v.Status = "S" and v.SubCategorySeedID = 11 GROUP BY v.facilities, p.VehicleType;', [facility_id, year]);
        } catch (error) {
            console.error("Database Error:", error);
            throw error;
        }
    },

    getOtherDeliveryData: async (facility_id, year) => {
        return await db.query('SELECT `dbo.vehiclede`.id, ROUND(SUM(`dbo.vehiclede`.GHGEmission) / 1000, 4) AS Total_GHGEmission, `dbo.vehiclede`.vehicleTypeID, `dbo.deliveryvehicletypes`.VehicleType FROM `dbo.vehiclede` JOIN `dbo.deliveryvehicletypes` ON `dbo.deliveryvehicletypes`.ID = `dbo.vehiclede`.vehicleTypeID WHERE `dbo.vehiclede`.facilities IN(?) AND `dbo.vehiclede`.year = ? AND `dbo.vehiclede`.SubCategorySeedID = 11 AND `dbo.vehiclede`.Status = "S" AND `dbo.deliveryvehicletypes`.VehicleType NOT LIKE "%Diesel%" GROUP BY `dbo.vehiclede`.vehicleTypeID;', [facility_id, year]);
    },

    /**
      * @DEVELOPER KARAN PATEL
      * @DATE 18-03-2025
      * 
       */

    fetchRenewableElectricityde: async (facilities, year) => {
        let facilityIds = facilities.split(",").map(Number);
        if (facilityIds.some(isNaN)) {
            return { success: false, message: "Invalid facilityId format." };
        }
        const placeholders = facilityIds.map(() => '?').join(', ');
        const query = `
        SELECT * FROM \`dbo.renewableelectricityde\` 
        WHERE (facilities IN (${placeholders}) AND year = ?) 
        AND Status = 'S' 
        ORDER BY CreatedDate DESC;
    `;
        return db.query(query, [...facilityIds, year]);
    },

    purchaseGoodAndServicesModel: async (facilities, year, typeofpurchase) => {
        let facilityIds = facilities.split(",").map(Number);
        if (facilityIds.some(isNaN)) {
            return { success: false, message: "Invalid facilityId format." };
        }
        const placeholders = facilityIds.map(() => '?').join(', ');
        const query = `
       SELECT 
       pgc_ef.product,
pgc.product_category, 
ROUND(SUM(pgc.emission) / 1000, 4) AS total_emission
FROM purchase_goods_categories AS pgc
JOIN purchase_goods_categories_ef AS pgc_ef 
ON pgc.product_category = pgc_ef.id
WHERE pgc.facilities IN (${placeholders}) 
AND pgc.year = ? 
AND pgc.typeofpurchase = ?
GROUP BY pgc.product_category
ORDER BY total_emission DESC
LIMIT 5;

    `;
        return db.query(query, [...facilityIds, year, typeofpurchase]);
    },

    getWasteData: async (facility_id, year) => {
        const waste_type = await db.query('SELECT product, ROUND(SUM(emission) / 1000, 4) AS total_emission FROM waste_generated_emissions WHERE facility_id IN (?) AND YEAR = ? AND STATUS = "S" GROUP BY product ORDER BY total_emission DESC;', [facility_id, year]);
        const method_type = await db.query('SELECT method, ROUND(SUM(emission) / 1000, 4) AS total_emission FROM waste_generated_emissions WHERE facility_id IN(?) AND YEAR = ? AND STATUS = "S" GROUP BY method;', [facility_id, year]);
        const open_recycling = await db.query('SELECT method, ROUND(SUM(emission) / 1000, 4) AS total_emission FROM waste_generated_emissions WHERE facility_id IN( ?) AND YEAR = ? AND STATUS = "S" AND method = "recycling" AND waste_loop = 1 GROUP BY method;', [facility_id, year]);
        const close_recycling = await db.query('SELECT method, ROUND(SUM(emission) / 1000, 4) AS total_emission FROM waste_generated_emissions WHERE facility_id IN (?) AND YEAR = ? AND STATUS = "S" AND method = "recycling" AND waste_loop = 0 GROUP BY method;', [facility_id, year]);
        return { waste_type, method_type, open_recycling, close_recycling };
    },

    flightTravel: async (facilities, year) => {
        return await db.query(`SELECT flight_travel.*, ROUND(SUM(flight_travel.emission) / 1000, 4) AS total_emission FROM flight_travel WHERE facilities IN (${facilities}) AND year = ? AND status = "S" GROUP BY flight_Type;`, [year]);
    },

    modeOfTransport: async (facilities, year) => {
        return await db.query(`SELECT other_modes_of_transport.*, ROUND(SUM(other_modes_of_transport.emission) / 1000, 4) AS total_emission FROM other_modes_of_transport WHERE facilities IN (${facilities}) AND year = ? AND status = "S" GROUP BY mode_of_trasport;`, [year]);
    },

    hotelStay: async (facilities, year) => {
        return await db.query(`SELECT hotel_stay.*, ROUND(SUM(hotel_stay.emission) / 1000, 4) AS total_emission FROM hotel_stay WHERE facilities IN (${facilities}) AND year = ? AND status = "S" GROUP BY type_of_hotel;`, [year]);
    },

    employeeCommute: async (facilities, year) => {
        return await db.query(`SELECT employee_commuting_category.*, ROUND(SUM(employee_commuting_category.emission) / 1000, 4) AS subtotal_total_emission, employee_community_typeoftransport.type FROM employee_commuting_category LEFT JOIN employee_community_typeoftransport ON employee_community_typeoftransport.id = employee_commuting_category.typeoftransport WHERE facilities IN(${facilities}) AND STATUS = "S" AND YEAR = ? GROUP BY employee_commuting_category.typeoftransport;`, [year]);
    },

    getCombustionEmissionDetail: async (facilities, year, SubCategoriesID) => {
        let where = "";
        where = ` where  A.Year = '${year}' and Status = 'S' `;

        if (facilities != '0') {
            where += `  and A.facility_id IN (${facilities})`
        }

        where += ` and  A.SubCategoriesID = '${SubCategoriesID}'`

        return db.query(`select SUM(A.Scope3GHGEmission) as emission from stationarycombustionde A ${where}`);
    },

    getCombustionEmissionDetailFixed: async (facilities, year) => {
        let where = "";
        where = ` where  A.Year = '${year}' and Status = 'S' `;

        if (facilities != '0') {
            where += `  and A.facility_id IN (${facilities})`
        }

        return db.query(`select SUM(A.GHGEmission) as emission from stationarycombustionde A ${where}`);
    },

    getscope1CombustionEmissionDetail: async (facilities, year, SubCategoriesID) => {
        let where = "";
        where = ` where  A.Year = '${year}' and Status = 'S' `;

        if (facilities != '0') {
            where += `  and A.facility_id IN (${facilities})`
        }

        where += ` and  A.SubCategoriesID = '${SubCategoriesID}'`

        return db.query(`select SUM(A.GHGEmission) as emission from stationarycombustionde A ${where}`);
    },

    getCombustionEmissionRangeWise: async (facilities, base_year, current_year, finalyeardata) => {
        let where = "WHERE A.Status = 'S'";

        if (base_year && current_year) {
            where += ` AND A.Year BETWEEN '${base_year}' AND '${current_year}'`;
        }

        if (facilities != '0') {
            where += `  and A.facility_id IN (${facilities}) GROUP BY A.Year`
        }

        return db.query(`select A.Year, ROUND(SUM(A.GHGEmission) / 1000, 4) as emission, ROUND(SUM(A.Scope3GHGEmission) / 1000, 4) as scope3_emission from stationarycombustionde A ${where}`);
    },

    AllrefrigerantsRangeWise: async (facilities, base_year, current_year, finalyeardata) => {
        let where = "WHERE A.Status = 'S'";

        if (base_year && current_year) {
            where += ` AND A.Year BETWEEN '${base_year}' AND '${current_year}'`;
        }

        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities}) GROUP BY A.Year`
        }

        return db.query("select A.Year, ROUND(SUM(A.GHGEmission) / 1000, 4) as emission from `dbo.refrigerantde` A " + where);
    },

    AllfireextinguisherRangeWise: async (facilities, base_year, current_year, finalyeardata) => {
        let where = "WHERE A.Status = 'S'";

        if (base_year && current_year) {
            where += ` AND A.Year BETWEEN '${base_year}' AND '${current_year}'`;
        }

        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities}) GROUP BY A.Year`
        }

        return db.query("select A.Year, ROUND(SUM(A.GHGEmission) / 1000, 4) as emission from `dbo.fireextinguisherde` A " + where);
    },

    getAllcompanyownedvehiclesRangeWise: async (facilities, base_year, current_year, finalyeardata) => {
        let where = "WHERE A.Status = 'S'";

        if (base_year && current_year) {
            where += ` AND A.Year BETWEEN '${base_year}' AND '${current_year}'`;
        }

        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities}) GROUP BY A.Year`
        }

        return db.query("select A.Year, ROUND(SUM(A.GHGEmission) / 1000, 4) as emission from `dbo.vehiclede` A  " + where);
    },

    getAllelectricityRangeWise: async (facilities, base_year, current_year, finalyeardata) => {
        let where = "WHERE A.Status = 'S'";

        if (base_year && current_year) {
            where += ` AND A.Year BETWEEN '${base_year}' AND '${current_year}'`;
        }

        if (facilities != '0') {
            where += `  AND  A.facilities IN (${facilities}) GROUP BY A.year`
        }

        return db.query("select A.YEAR, ROUND(SUM(A.GHGEmission) / 1000, 4) AS emission from `dbo.renewableelectricityde` A " + where);
    },

    getAllheatandsteamRangeWise: async (facilities, base_year, current_year, finalyeardata) => {
        let where = "WHERE A.Status = 'S'";

        if (base_year && current_year) {
            where += ` AND A.Year BETWEEN '${base_year}' AND '${current_year}'`;
        }

        if (facilities != '0') {
            where += `  AND  A.facilities IN (${facilities}) GROUP BY A.Year`
        }

        return db.query("select A.Year, ROUND(SUM(A.GHGEmission) / 1000, 4) as emission from `dbo.heatandsteamde` A " + where);
    },

    purchaseGoodsDetailsRangeWise: async (facilities, base_year, current_year, finalyeardata) => {
        let where = "WHERE A.status = 'S'";

        if (base_year && current_year) {
            where += ` AND A.year BETWEEN '${base_year}' AND '${current_year}'`;
        }

        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities}) GROUP BY A.year` //
        }

        return db.query("select A.year, ROUND(SUM(A.emission) / 1000, 4) as emission from purchase_goods_categories A " + where);
    },

    flight_travelDetailsRangeWise: async (facilities, base_year, current_year, finalyeardata) => {
        let where = "WHERE A.status = 'S'";

        if (base_year && current_year) {
            where += ` AND A.year BETWEEN '${base_year}' AND '${current_year}'`;
        }
        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities}) GROUP BY A.year`
        }

        return db.query("select A.year, ROUND(SUM(A.emission) / 1000, 4) as emission from flight_travel A " + where);
    },

    hotel_stayDetailsRangeWise: async (facilities, base_year, current_year, finalyeardata) => {
        let where = "WHERE A.status = 'S'";

        if (base_year && current_year) {
            where += ` AND A.year BETWEEN '${base_year}' AND '${current_year}'`;
        }
        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities}) GROUP BY A.year`
        }

        return db.query("select A.year,  ROUND(SUM(A.emission) / 1000, 4) as emission from hotel_stay A " + where);
    },

    other_modes_of_transportDetailsRangeWise: async (facilities, base_year, current_year, finalyeardata) => {
        let where = "WHERE A.status = 'S'";

        if (base_year && current_year) {
            where += ` AND A.year BETWEEN '${base_year}' AND '${current_year}'`;
        }

        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities}) GROUP BY A.year`
        }

        return db.query("select A.year, ROUND(SUM(A.emission) / 1000, 4) as emission from other_modes_of_transport A " + where);
    },

    processing_of_sold_products_categoryDetailsRangeWise: async (facilities, base_year, current_year, finalyeardata) => {
        let where = "WHERE A.status = 'S'";

        if (base_year && current_year) {
            where += ` AND A.year BETWEEN '${base_year}' AND '${current_year}'`;
        }

        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities}) GROUP BY A.year`
        }

        return db.query("select A.year, ROUND(SUM(A.emission) / 1000, 4) as emission from processing_of_sold_products_category A " + where);
    },

    sold_product_categoryDetailsRangeWise: async (facilities, base_year, current_year, finalyeardata) => {
        let where = "WHERE A.status = 'S'";

        if (base_year && current_year) {
            where += ` AND A.year BETWEEN '${base_year}' AND '${current_year}'`;
        }

        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities}) GROUP BY A.year`
        }

        return db.query("select A.year, ROUND(SUM(A.emission) / 1000, 4) as emission from sold_product_category A " + where);
    },

    endoflife_waste_typeDetailsRangeWise: async (facilities, base_year, current_year, finalyeardata) => {
        let where = "WHERE A.status = 'S'";

        if (base_year && current_year) {
            where += ` AND A.year BETWEEN '${base_year}' AND '${current_year}'`;
        }

        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities}) GROUP BY A.year`
        }

        return db.query("select A.year, ROUND(SUM(A.emission) / 1000, 4) as emission from endof_lifetreatment_category A " + where);
    },

    water_supply_treatment_categoryDetailsRangeWise: async (facilities, base_year, current_year, finalyeardata) => {
        let where = "WHERE A.status = 'S'";

        if (base_year && current_year) {
            where += ` AND A.year BETWEEN '${base_year}' AND '${current_year}'`;
        }

        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities}) GROUP BY A.year`
        }

        return db.query("select A.year, ROUND(SUM(A.emission) / 1000, 4) as emission from water_supply_treatment_category A " + where);
    },

    employee_commuting_categoryDetailsRangeWise: async (facilities, base_year, current_year, finalyeardata) => {
        let where = "WHERE A.status = 'S'";

        if (base_year && current_year) {
            where += ` AND A.year BETWEEN '${base_year}' AND '${current_year}'`;
        }

        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities}) Group BY A.year`
        }

        return db.query("select A.year, ROUND(SUM(A.emission) / 1000, 4) as emission from employee_commuting_category A " + where);
    },

    homeoffice_categoryDetailsRangeWise: async (facilities, base_year, current_year, finalyeardata) => {
        let where = "WHERE A.status = 'S'";

        if (base_year && current_year) {
            where += ` AND A.year BETWEEN '${base_year}' AND '${current_year}'`;
        }
        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities}) GROUP BY A.year`
        }

        return db.query("select A.year, ROUND(SUM(A.emission) / 1000, 4) as emission from homeoffice_category A " + where);
    },

    waste_generated_emissionsDetailsRangeWise: async (facilities, base_year, current_year, finalyeardata) => {
        let where = "WHERE A.status = 'S'";

        if (base_year && current_year) {
            where += ` AND A.year BETWEEN '${base_year}' AND '${current_year}'`;
        }
        if (facilities != '0') {
            where += `  and  A.facility_id IN (${facilities}) GROUP BY A.year`
        }

        return db.query("select A.year, ROUND(SUM(A.emission) / 1000, 4) as emission from waste_generated_emissions A " + where);
    },

    upstreamLease_emissionDetailsRangeWise: async (facilities, base_year, current_year, finalyeardata) => {
        let where = "WHERE A.status = 'S'";

        if (base_year && current_year) {
            where += ` AND A.year BETWEEN '${base_year}' AND '${current_year}'`;
        }

        if (facilities != '0') {
            where += `  and  A.facility_id IN (${facilities}) GROUP BY A.year`
        }

        return db.query("select A.year, ROUND(SUM(A.emission) / 1000, 4) as emission from upstreamLease_emission A " + where);
    },

    downstreamLease_emissionDetailsRangeWise: async (facilities, base_year, current_year, finalyeardata) => {
        let where = "WHERE A.status = 'S'";

        if (base_year && current_year) {
            where += ` AND A.year BETWEEN '${base_year}' AND '${current_year}'`;
        }

        if (facilities != '0') {
            where += `  and  A.facility_id IN (${facilities}) GROUP BY A.year`
        }

        return db.query("select A.year, ROUND(SUM(A.emission) / 1000, 4) as emission from downstreamLease_emission A " + where);
    },

    franchise_categories_emissionDetailsRangeWise: async (facilities, base_year, current_year, finalyeardata) => {
        let where = "WHERE A.status = 'S'";

        if (base_year && current_year) {
            where += ` AND A.year BETWEEN '${base_year}' AND '${current_year}'`;
        }

        if (facilities != '0') {
            where += `  and  A.facility_id IN (${facilities}) GROUP BY A.year`
        }

        return db.query("select A.year, ROUND(SUM(A.emission) / 1000, 4) as emission from franchise_categories_emission A  " + where);
    },

    investment_emissionsDetailsRangeWise: async (facilities, base_year, current_year, finalyeardata) => {
        let where = "WHERE A.status = 'S'";

        if (base_year && current_year) {
            where += ` AND A.year BETWEEN '${base_year}' AND '${current_year}' GROUP BY A.year`;
        }

        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities})`
        }

        return db.query("select A.year, ROUND(SUM(A.emission) / 1000, 4) as emission from investment_emissions A  " + where);
    },

    upstream_vehicle_storage_emissionsRangeWise: async (facilities, base_year, current_year, finalyeardata) => {
        let where = "WHERE A.status = 'S'";

        if (base_year && current_year) {
            where += ` AND A.year BETWEEN '${base_year}' AND '${current_year}'`;
        }

        if (facilities != '0') {
            where += `  and  A.facility_id IN (${facilities}) GROUP BY A.year`
        }

        return db.query("select A.year, ROUND(SUM(A.emission) / 1000, 4) as emission from upstream_vehicle_storage_emissions A  " + where);
    },

    downstream_vehicle_storage_emissionsRangeWise: async (facilities, base_year, current_year, finalyeardata) => {
        let where = "WHERE A.status = 'S'";

        if (base_year && current_year) {
            where += ` AND A.year BETWEEN '${base_year}' AND '${current_year}'`;
        }

        if (facilities != '0') {
            where += `  and  A.facility_id IN (${facilities}) GROUP BY A.year`
        }

        return db.query("select A.year, ROUND(SUM(A.emission) / 1000, 4) as emission from downstream_vehicle_storage_emissions A  " + where);
    },

    employeePerEmission: async (facilities, base_year, current_year) => {
        return await db.query(`SELECT year, ROUND(SUM(emission) / 1000, 4) AS total_emission, SUM(noofemployees) AS total_employees, ROUND(SUM(emission) / SUM(noofemployees) / 1000, 4) AS total_per_employee_emission FROM employee_commuting_category WHERE facilities IN (${facilities}) AND status = "S" AND year BETWEEN ${base_year} AND ${current_year} GROUP BY year;`);
    },

    findStationaryCombustionde: async (facilities) => {
        return await db.query('SELECT sc.id, sc.FileName, DATE_FORMAT(sc.CreatedDate, "%d-%m-%Y") AS created_date, au.firstname, au.lastname FROM stationarycombustionde sc LEFT JOIN `dbo.tenants` t ON t.Id = sc.user_id LEFT JOIN `dbo.aspnetusers` au ON au.user_id = t.user_id WHERE sc.facility_id = "' + facilities + '" AND sc.FileName IS NOT NULL;');
    },

    findRefrigerant: async (facilities) => {
        return await db.query('SELECT re.id, re.FileName, DATE_FORMAT(re.CreatedDate, "%d-%m-%Y") AS created_date, au.firstname, au.lastname FROM `dbo.refrigerantde` re LEFT JOIN `dbo.tenants` t ON t.Id = re.user_id LEFT JOIN `dbo.aspnetusers` au ON au.user_id = t.user_id WHERE re.facilities = "' + facilities + '" AND re.FileName IS NOT NULL;')
    },

    findFireextinguisherde: async (facilities) => {
        return await db.query('SELECT fr.id, fr.FileName, DATE_FORMAT(fr.CreatedDate, "%d-%m-%Y") AS created_date, au.firstname, au.lastname FROM `dbo.fireextinguisherde` fr LEFT JOIN `dbo.tenants` t ON t.Id = fr.user_id LEFT JOIN `dbo.aspnetusers` au ON au.user_id = t.user_id WHERE fr.facilities = "' + facilities + '" AND fr.FileName IS NOT NULL;');
    },

    findVehiclede: async (facilities) => {
        return await db.query('SELECT ve.id, ve.FileName, DATE_FORMAT(ve.CreatedDate, "%d-%m-%Y") AS created_date, au.firstname, au.lastname FROM `dbo.vehiclede` ve LEFT JOIN `dbo.tenants` t ON t.Id = ve.user_id LEFT JOIN `dbo.aspnetusers` au ON au.user_id = t.user_id WHERE ve.facilities = "' + facilities + '" AND ve.FileName IS NOT NULL;');
    },

    findRenewableelectricityde: async (facilities) => {
        return await db.query('SELECT re.id, re.FileName, DATE_FORMAT(re.CreatedDate, "%d-%m-%Y") AS created_date, au.firstname, au.lastname FROM `dbo.renewableelectricityde` re LEFT JOIN `dbo.tenants` t ON t.Id = re.user_id LEFT JOIN `dbo.aspnetusers` au ON au.user_id = t.user_id WHERE re.facilities = "' + facilities + '" AND re.FileName IS NOT NULL;');
    },

    findSubCategoryTypes: async () => {
        return await db.query('SELECT * FROM `subcategorytypes` WHERE SubCatID >= 1 AND SubCatID <= 6 ORDER BY `ID` ASC;');
    },

    findSubCategoryTypesByCategoryId: async (id) => {
        return await db.query('SELECT * FROM `subcategorytypes` WHERE SubCatID = "' + id + '";');
    }

}