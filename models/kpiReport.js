const db = require("../utils/database");

module.exports = {
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
            where += `  and  A.facilities IN (${facilities})` //
        }
        if (finalyeardata == '2') {
            where += ` and  A.months IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.months !="" GROUP BY A.months`
        } else {
            where += ` and  A.months IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.months !="" GROUP BY A.months`
        }
        return db.query("select SUM(A.GHGEmission) as emission,A.months AS month_number,COALESCE('Electricity', '')  as  category   from `dbo.renewableelectricityde` A " + where);
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
        return db.query("select  SUM(A.GHGEmission) as emission,A.months AS month_number,COALESCE('Heat and Steam', '')  as  category  from `dbo.heatandsteamde` A " + where);
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

    water_discharge_by_destination: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` WHERE B.year = '${year}' AND A.status = 'S'`;
        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities})`
        }
        if (finalyeardata == '2') {
            where += ` and  B.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  B.month !="" GROUP BY B.month`
        } else {
            where += ` and  B.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  B.month !="" GROUP BY B.month`
        }
        return db.query("select SUM(B.totalwaterdischarge) AS water_discharge, B.month AS month_number FROM water_supply_treatment_category A LEFT JOIN water_discharge_by_destination B ON B.water_supply_treatment_id = A.id " + where);
    },

    water_withdrawl_by_source: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` WHERE B.year = '${year}' AND A.status = 'S'`;
        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities})`
        }
        if (finalyeardata == '2') {
            where += ` and  B.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  B.month !="" GROUP BY B.month`
        } else {
            where += ` and  B.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  B.month !="" GROUP BY B.month`
        }
        return db.query("select SUM(B.totalwaterwithdrawl) AS water_withdrawl, B.month AS month_number FROM water_supply_treatment_category A LEFT JOIN water_withdrawl_by_source B ON B.water_supply_treatment_id = A.id " + where);
    },

    water_supply_treatment_category: async (facilities, year, finalyeardata) => {
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
        return db.query("select SUM(A.water_treatment) as water_treatment, A.month AS month_number from water_supply_treatment_category A " + where);
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

    water_supply_treatment_categoryDetailsemission: async (facilities, year) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S' `;
        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities})`
        }

        return db.query("select A.* from water_supply_treatment_category A " + where);
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

    stationaryCombustionde: async (facilities, year, type_id, finalyeardata) => {
        let where = "";
        where = ` where  A.Year = '${year}' and A.Status = 'S' `;

        if (facilities != '0') {
            where += `  and A.facility_id IN (${facilities}) AND A.TypeID = ${type_id}`
        }

        if (finalyeardata == '2') {
            where += ` and  A.Month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.Month !="" GROUP BY A.Month`

        } else {
            where += ` and  A.Month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.Month !="" GROUP BY A.Month`
        }

        return db.query(`select A.TypeName, SUM(A.ReadingValue) as emission, SUM(A.Scope3GHGEmission) as scope3_emission, COALESCE('Stationary Combustion', '')  as  category ,A.Month AS month_number, tbl_fuel_litre_GJ.litre_to_GJ, tbl_fuel_litre_GJ.GJ_To_KWH from stationarycombustionde A LEFT JOIN tbl_fuel_litre_GJ ON tbl_fuel_litre_GJ.id = A.TypeID ${where}`);
    },

    getStationaryCombustiondeTypeByFacilty: async (facilities, year) => {
        return await db.query('SELECT ReadingValue, TypeName, TypeID FROM `stationarycombustionde` WHERE facility_id = "' + facilities + '" AND Year = "' + year + '" AND Status = "S" GROUP BY TypeName ORDER BY ReadingValue DESC;')
    },

    fuelStationaryCombusiton: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.Year = '${year}' and A.Status = 'S' `;

        if (facilities != '0') {
            where += `  and A.facility_id IN (${facilities}) `
        }

        if (finalyeardata == '2') {
            where += ` and  A.Month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.Month !="" GROUP BY A.Month`

        } else {
            where += ` and  A.Month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.Month !="" GROUP BY A.Month`
        }

        return db.query(`select A.TypeName, SUM(A.ReadingValue) as emission, SUM(A.Scope3GHGEmission) as scope3_emission, COALESCE('Stationary Combustion', '')  as  category ,A.Month AS month_number from stationarycombustionde A ${where}`);
    },

    heatandsteamde: async (facilities, year, finalyeardata) => {
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
        return db.query("select  SUM(A.readingValue) as emission,A.months AS month_number,COALESCE('Heat and Steam', '')  as  category  from `dbo.heatandsteamde` A " + where);
    },

    electricity: async (facilities, year, finalyeardata) => {
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
        return db.query("select SUM(A.readingValue) as emission, A.months AS month_number,COALESCE('Electricity', '')  as  category   from `dbo.renewableelectricityde` A " + where);
    },

    renewableElectricity: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.Year = '${year}' and Status = 'S'`;
        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities}) AND typeID = 1`
        }
        if (finalyeardata == '2') {
            where += ` and  A.months IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.months !="" GROUP BY A.months`
        } else {
            where += ` and  A.months IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.months !="" GROUP BY A.months`
        }
        return db.query("select SUM(A.readingValue) as emission, A.months AS month_number,COALESCE('Electricity', '')  as  category   from `dbo.renewableelectricityde` A " + where);
    },

    kpiInventoryPassengerVehicleDiesel: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.Year = '${year}' AND A.Status = 'S' AND A.SubCategorySeedID = 10 AND B.VehicleType LIKE "%Diesel%"`;
        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities})`
        }
        if (finalyeardata == '2') {
            where += ` and  A.months IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.months !="" GROUP BY A.months`
        } else {
            where += ` and  A.months IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.months !="" GROUP BY A.months`
        }
        return db.query("select  SUM(A.GHGEmission) as emission,A.months AS month_number,COALESCE('Company Owned Vehicles', '')  as  category, B.VehicleType from `dbo.vehiclede` A JOIN `dbo.passengervehicletypes` AS B ON B.ID = A.vehicleTypeID" + where);
    },

    kpiInventoryPassengerVehiclePetrol: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.Year = '${year}' AND A.Status = 'S' AND A.SubCategorySeedID = 10 AND B.VehicleType LIKE "%Petrol%"`;
        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities})`
        }
        if (finalyeardata == '2') {
            where += ` and  A.months IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.months !="" GROUP BY A.months`
        } else {
            where += ` and  A.months IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.months !="" GROUP BY A.months`
        }
        return db.query("select  SUM(A.GHGEmission) as emission,A.months AS month_number,COALESCE('Company Owned Vehicles', '')  as  category, B.VehicleType from `dbo.vehiclede` A JOIN `dbo.passengervehicletypes` AS B ON B.ID = A.vehicleTypeID" + where);
    },

    kpiInventoryPassengerVehicle: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.Year = '${year}' AND A.Status = 'S' AND A.SubCategorySeedID = 10`;
        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities})`
        }
        if (finalyeardata == '2') {
            where += ` and  A.months IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.months !="" GROUP BY A.months`
        } else {
            where += ` and  A.months IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.months !="" GROUP BY A.months`
        }
        return db.query("select  SUM(A.GHGEmission) as emission,A.months AS month_number,COALESCE('Company Owned Vehicles', '')  as  category, B.VehicleType from `dbo.vehiclede` A JOIN `dbo.passengervehicletypes` AS B ON B.ID = A.vehicleTypeID" + where);
    },

    transportVehicleEmission: async (facilities, year, finalyeardata) => {
        let where = `
            WHERE A.Year = '${year}' 
            AND A.Status = 'S'
            AND (
                (A.SubCategorySeedID = 11)
                OR 
                (A.SubCategorySeedID = 10)
            )
        `;

        if (facilities != '0') {
            where += ` AND A.facilities IN (${facilities})`;
        }

        const monthsCondition = finalyeardata === '2'
            ? `AND A.months IN ("Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar")`
            : `AND A.months IN ("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")`;

        where += `
            ${monthsCondition}
            AND A.months != ''
            GROUP BY A.months
        `;

        const sql = `
            SELECT
                SUM(A.GHGEmission) AS emission,
                A.months AS month_number,
                'Company Owned Vehicles' AS category,
                CASE
                    WHEN A.SubCategorySeedID = 11 THEN delivery.VehicleType
                    WHEN A.SubCategorySeedID = 10 THEN passenger.VehicleType
                    ELSE NULL
                END AS VehicleType
            FROM \`dbo.vehiclede\` A
            LEFT JOIN \`dbo.deliveryvehicletypes\` delivery 
                ON delivery.ID = A.vehicleTypeID AND A.SubCategorySeedID = 11
            LEFT JOIN \`dbo.passengervehicletypes\` passenger 
                ON passenger.ID = A.vehicleTypeID AND A.SubCategorySeedID = 10
            ${where}
        `;

        return db.query(sql);
    },

    freightTransportEmission: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.Year = '${year}' AND A.Status = 'S' AND A.SubCategorySeedID = 11`;
        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities})`
        }
        if (finalyeardata == '2') {
            where += ` and  A.months IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.months !="" GROUP BY A.months`
        } else {
            where += ` and  A.months IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.months !="" GROUP BY A.months`
        }
        return db.query("select  SUM(A.Value) as emission,A.months AS month_number,COALESCE('Company Owned Vehicles', '')  as  category, B.VehicleType from `dbo.vehiclede` A JOIN `dbo.deliveryvehicletypes` AS B ON B.ID = A.vehicleTypeID" + where);
    },

    // employeeCommutingEmission: async (facilities, year, finalyeardata) => {
    //     let where = "";
    //     where = ` where  A.year = '${year}' and status = 'S'`;
    //     if (facilities != '0') {
    //         where += `  and  A.facilities IN (${facilities})`
    //     }
    //     if (finalyeardata == '2') {
    //         where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month`
    //     } else {
    //         where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`
    //     }
    //     return db.query("select  SUM(A.emission) as emission,A.month AS month_number,COALESCE('Employee Commuting', '')  as  category from employee_commuting_category A " + where);
    // },

    employeeCommutingEmission: async (facilities, year, finalyeardata) => {
        let where = ` WHERE A.year = '${year}' AND status = 'S'`;
        if (facilities != '0') {
            where += ` AND A.facilities IN (${facilities})`;
        }

        // const checkMonthResult = await db.query(`SELECT COUNT(*) as count FROM employee_commuting_category A ${where} AND (A.month IS NULL OR A.month = '')`);

        // if (checkMonthResult[0].count > 0) {
        const totalEmissionRes = await db.query(`SELECT SUM(A.emission) as total_emission FROM employee_commuting_category A ${where}`);
        const totalEmission = totalEmissionRes[0].total_emission || 0;
        const monthlyEmission = (totalEmission / 12).toFixed(2);

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const result = months.map(month => ({
            emission: monthlyEmission,
            month_number: month,
            category: "Employee Commuting"
        }));
        return result;
        // } else {
        //     if (finalyeardata == '2') {
        //         where += ` AND A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") AND A.month != "" GROUP BY A.month`;
        //     } else {
        //         where += ` AND A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") AND A.month != "" GROUP BY A.month`;
        //     }

        //     return db.query(`SELECT SUM(A.emission) as emission, A.month AS month_number, COALESCE('Employee Commuting', '') as category FROM employee_commuting_category A ${where}`);
        // }
    },

    // employeeCommutingWorkingDays: async (facilities, year, finalyeardata) => {
    //     let where = "";
    //     where = ` where  A.year = '${year}' and status = 'S'`;
    //     if (facilities != '0') {
    //         where += `  and  A.facilities IN (${facilities})`
    //     }
    //     if (finalyeardata == '2') {
    //         where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month`
    //     } else {
    //         where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`
    //     }
    //     return db.query("select  SUM(A.workingdays) AS working_days, A.month AS month_number, COALESCE('Employee Commuting', '')  as  category from employee_commuting_category A " + where);
    // },

    employeeCommutingWorkingDays: async (facilities, year, finalyeardata) => {
        let where = ` WHERE A.year = '${year}' AND status = 'S'`;
        if (facilities != '0') {
            where += ` AND A.facilities IN (${facilities})`;
        }

        // const checkMonthResult = await db.query(`SELECT COUNT(*) as count FROM employee_commuting_category A ${where} AND (A.month IS NULL OR A.month = '')`);

        // if (checkMonthResult[0].count > 0) {
        const totalEmissionRes = await db.query(`SELECT SUM(A.workingdays) AS working_days FROM employee_commuting_category A ${where}`);
        const totalEmission = totalEmissionRes[0].working_days || 0;
        const monthlyEmission = (totalEmission / 12).toFixed(2);

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const result = months.map(month => ({
            working_days: monthlyEmission,
            month_number: month,
            category: "Employee Commuting"
        }));
        return result;
        // } else {
        //     if (finalyeardata == '2') {
        //         where += ` AND A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") AND A.month != "" GROUP BY A.month`;
        //     } else {
        //         where += ` AND A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") AND A.month != "" GROUP BY A.month`;
        //     }

        //     return db.query(`SELECT SUM(A.workingdays) AS working_days, A.month AS month_number, COALESCE('Employee Commuting', '') as category FROM employee_commuting_category A ${where}`);
        // }
    },

    waste_generated_emissionsDetailsEmssion: async (facilities, year, finalyeardata) => {
        let where = ` WHERE A.year = '${year}' AND status = 'S'`;

        if (facilities !== '0') {
            where += ` AND A.facility_id IN (${facilities})`;
        }

        if (finalyeardata === '2') {
            where += ` AND A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar")`;
        } else {
            where += ` AND A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec")`;
        }

        where += ` AND A.month IS NOT NULL AND A.month != ''`;

        const query = `SELECT A.*, A.month AS month_number FROM waste_generated_emissions A ${where}`;

        return db.query(query);
    },

    waste_generated_emissionsDetailsEmssionByMethodemission: async (facilities, year, method, finalyeardata) => {
        let where = ` WHERE A.year = '${year}' AND status = 'S'`;

        if (facilities !== '0') {
            where += ` AND A.facility_id IN (${facilities})`;
        }

        where += ` AND A.method = '${method}'`;

        if (finalyeardata === '2') {
            where += ` AND A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar")`;
        } else {
            where += ` AND A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec")`;
        }

        where += ` AND A.month != ""`;

        const groupBy = ` GROUP BY A.method, A.month`;

        const query = `SELECT SUM(A.emission) AS emission, SUM(A.total_waste) AS total_waste, A.year, A.facility_id, A.method, A.month AS month_number FROM waste_generated_emissions A ${where} ${groupBy}`;

        return db.query(query);
    },

    purchase_goods_and_services_value_quantity: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and A.status = 'S' AND (A.unit NOT LIKE '%kg%' OR A.unit NOT LIKE '%Litres%' OR A.unit NOT LIKE '%Tonnes%')`;
        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities})`
        }
        if (finalyeardata == '2') {
            where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month`
        } else {
            where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`
        }
        return db.query("select  SUM(A.valuequantity) AS valuequantity, A.month AS month_number from purchase_goods_categories A " + where);
    },

    purchase_goods_and_services: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and A.status = 'S'`;
        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities})`
        }
        if (finalyeardata == '2') {
            where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" GROUP BY A.month`
        } else {
            where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" GROUP BY A.month`
        }
        return db.query("select  SUM(A.emission	) AS emission, A.month AS month_number from purchase_goods_categories A " + where);
    },

    no_of_employee: async (facilities, year) => {
        let where = "";
        if (facilities != '0') {
            where += ` WHERE A.ID IN (${facilities})`
        }
        return db.query("select  SUM(A.no_of_employee) AS no_of_employees, COALESCE('Employee Commuting', '')  as  category from `dbo.facilities` A " + where);
    },

    no_of_diesel_vehicles: async (facilities, year, finalyeardata) => {
        let where = `
            WHERE A.Year = '${year}' 
            AND A.Status = 'S'
            AND (
                (A.SubCategorySeedID = 11 AND delivery.VehicleType LIKE "%Diesel%")
                OR 
                (A.SubCategorySeedID = 10 AND passenger.VehicleType LIKE "%Diesel%")
            )
        `;

        if (facilities != '0') {
            where += ` AND A.facilities IN (${facilities})`;
        }

        const monthsCondition = finalyeardata === '2'
            ? `AND A.months IN ("Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar")`
            : `AND A.months IN ("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")`;

        where += `
            ${monthsCondition}
            AND A.months != ''
            GROUP BY A.months
        `;

        const sql = `
            SELECT
                SUM(A.NoOfVehicles) AS no_of_vehicle,
                A.months AS month_number,
                'Company Owned Vehicles' AS category,
                CASE
                    WHEN A.SubCategorySeedID = 11 THEN delivery.VehicleType
                    WHEN A.SubCategorySeedID = 10 THEN passenger.VehicleType
                    ELSE NULL
                END AS VehicleType
            FROM \`dbo.vehiclede\` A
            LEFT JOIN \`dbo.deliveryvehicletypes\` delivery 
                ON delivery.ID = A.vehicleTypeID AND A.SubCategorySeedID = 11
            LEFT JOIN \`dbo.passengervehicletypes\` passenger 
                ON passenger.ID = A.vehicleTypeID AND A.SubCategorySeedID = 10
            ${where}
        `;

        return db.query(sql);
    },

    no_of_petrol_vehicles: async (facilities, year, finalyeardata) => {
        let where = `
            WHERE A.Year = '${year}' 
            AND A.Status = 'S'
            AND (
                (A.SubCategorySeedID = 11 AND delivery.VehicleType LIKE "%Petrol%")
                OR 
                (A.SubCategorySeedID = 10 AND passenger.VehicleType LIKE "%Petrol%")
            )
        `;

        if (facilities != '0') {
            where += ` AND A.facilities IN (${facilities})`;
        }

        const monthsCondition = finalyeardata === '2'
            ? `AND A.months IN ("Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar")`
            : `AND A.months IN ("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")`;

        where += `
            ${monthsCondition}
            AND A.months != ''
            GROUP BY A.months
        `;

        const sql = `
            SELECT
                SUM(A.NoOfVehicles) AS no_of_vehicle,
                A.months AS month_number,
                'Company Owned Vehicles' AS category,
                CASE
                    WHEN A.SubCategorySeedID = 11 THEN delivery.VehicleType
                    WHEN A.SubCategorySeedID = 10 THEN passenger.VehicleType
                    ELSE NULL
                END AS VehicleType
            FROM \`dbo.vehiclede\` A
            LEFT JOIN \`dbo.deliveryvehicletypes\` delivery 
                ON delivery.ID = A.vehicleTypeID AND A.SubCategorySeedID = 11
            LEFT JOIN \`dbo.passengervehicletypes\` passenger 
                ON passenger.ID = A.vehicleTypeID AND A.SubCategorySeedID = 10
            ${where}
        `;

        return db.query(sql);
    },

    total_vehicles: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.Year = '${year}' AND A.Status = 'S' AND A.SubCategorySeedID = 10`;
        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities})`
        }
        if (finalyeardata == '2') {
            where += ` and  A.months IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.months !="" GROUP BY A.months`
        } else {
            where += ` and  A.months IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.months !="" GROUP BY A.months`
        }
        return db.query("select  SUM(A.NoOfVehicles) AS no_of_vehicle,A.months AS month_number,COALESCE('Company Owned Vehicles', '')  as  category, B.VehicleType from `dbo.vehiclede` A JOIN `dbo.deliveryvehicletypes` AS B ON B.ID = A.vehicleTypeID" + where);
    },

    total_area_energy_area: async (facilities) => {
        return db.query('SELECT * FROM `dbo.facilities` WHERE ID = ?', [facilities]);
    },

    getKpiTargetByUserId: async (user_id) => {
        return await db.query('SELECT * FROM `tbl_kpi_target` WHERE user_id = ?', [user_id]);
    },

    insertKpiTraget: async (data) => {
        return await db.query('INSERT INTO `tbl_kpi_target` set ?', [data]);
    },

    deleteKpiTargetByUserId: async (user_id) => {
        return await db.query('DELETE FROM `tbl_kpi_target` WHERE user_id = ?', [user_id]);
    },

    getKpiInventoryByFacilitityAndYear: async (facility_id, year) => {
        return await db.query('SELECT * FROM `tbl_kpi_inventory` WHERE facility_id = "' + facility_id + '" AND year = "' + year + '"');
    },

    insertKpiInventory: async (data) => {
        return await db.query('INSERT INTO `tbl_kpi_inventory` set ?', [data]);
    },

    deleteKpiInventory: async (facility_id, year) => {
        return await db.query(`DELETE FROM tbl_kpi_inventory WHERE facility_id = ? AND year = ?`, [facility_id, year]);
    },

    getKpiInventoryJsonByFacilitityAndYear: async (facility_id, year) => {
        return await db.query('SELECT tbl_kpi_inventory_json.*, B.firstname, B.lastname FROM `tbl_kpi_inventory_json` LEFT JOIN `dbo.aspnetusers` B ON B.user_id = tbl_kpi_inventory_json.user_id WHERE tbl_kpi_inventory_json.facility_id = "' + facility_id + '" AND tbl_kpi_inventory_json.year = "' + year + '"');
    },

    getKpiInventoryByFacilityIdAndYearAndKpiId: async (facility_id, base_year, current_year, kpi_id) => {
        const base_year_data = await db.query(`
            SELECT 
                B.ID AS facility_id,
                B.AssestName,
                C.id AS kpi_item_id,
                C.kpi_name,
                C.unit,
                A.year AS base_year,
                A.annual
            FROM 
                \`dbo.facilities\` B
            CROSS JOIN 
                kpi_Items_list C
            LEFT JOIN 
                tbl_kpi_inventory A 
                ON A.facility_id = B.ID AND A.kpi_item_id = C.id AND A.year = ${base_year}
            WHERE 
                B.ID IN (${facility_id}) 
                AND C.id IN (${kpi_id});
        `);

        const current_year_data = await db.query(`
            SELECT 
                B.ID AS facility_id,
                B.AssestName,
                C.id AS kpi_item_id,
                C.kpi_name,
                C.unit,
                A.year AS current_year,
                A.annual
            FROM 
                \`dbo.facilities\` B
            CROSS JOIN 
                kpi_Items_list C
            LEFT JOIN 
                tbl_kpi_inventory A 
                ON A.facility_id = B.ID AND A.kpi_item_id = C.id AND A.year = ${current_year}
            WHERE 
                B.ID IN (${facility_id}) 
                AND C.id IN (${kpi_id});
        `);

        return data = {
            base_year_data,
            current_year_data
        }
    },

    getKpiInventoryAggregateDataAnnually: async (facilities, startDate, endDate, kpiIds, user_id) => {
        const facilityIds = facilities.split(',').map(id => parseInt(id.trim()));
        const kpiIdList = kpiIds.split(',').map(id => parseInt(id.trim()));
        const data = {};

        for (let i = 0; i < kpiIdList.length; i++) {
            const kpiId = kpiIdList[i];
            const queryParams = [facilityIds, kpiId];
            let query = `
                SELECT year, ROUND(SUM(annual), 2) AS total_annual, 
                       tbl_kpi_inventory.kpi_item_id, 
                       kpi_Items_list.kpi_name,
                       kpi_Items_list.unit,
                       (SELECT annual FROM tbl_kpi_target WHERE user_id = ${user_id} AND kpi_id = ${kpiId}) AS target_value
                FROM tbl_kpi_inventory
                LEFT JOIN kpi_Items_list 
                    ON kpi_Items_list.id = tbl_kpi_inventory.kpi_item_id
                WHERE tbl_kpi_inventory.facility_id IN (?)
                  AND tbl_kpi_inventory.kpi_item_id = ?
            `;

            if (startDate && endDate) {
                query += ` AND tbl_kpi_inventory.year BETWEEN ? AND ?`;
                queryParams.push(parseInt(startDate), parseInt(endDate));
            }

            query += ` GROUP BY tbl_kpi_inventory.year, tbl_kpi_inventory.kpi_item_id, kpi_Items_list.kpi_name, kpi_Items_list.unit ORDER BY tbl_kpi_inventory.year ASC;
            `;

            const result = await db.query(query, queryParams);
            const rows = result.rows || result;

            let yearRange = [];
            if (startDate && endDate) {
                for (let y = parseInt(startDate); y <= parseInt(endDate); y++) {
                    yearRange.push(y);
                }
            } else {
                yearRange = [...new Set(rows.map(r => r.year))];
            }
            const [kpi_Items_list] = await db.query('SELECT * FROM `kpi_Items_list` WHERE id IN (?)', [kpiId])
            const finalData = {
                time: [],
                series: [],
                kpi_item_id: kpiId,
                target_value: Number(rows[0]?.target_value) || null,
                kpi_name: rows[0]?.kpi_name || kpi_Items_list.kpi_name,
                kpi_unit: rows[0]?.unit || kpi_Items_list.unit
            };

            for (const y of yearRange) {
                const row = rows.find(r => r.year === y);
                finalData.time.push(y);
                finalData.series.push(row ? parseFloat(row.total_annual) : null);
            }

            data[`first${i + 1}`] = finalData;
        }

        return data;
    },

    getKpiInventoryAggregateDataQuaterly: async (facilities, kpiIds, user_id, year) => {
        const facilityIds = facilities.split(',').map(id => parseInt(id.trim()));
        const kpiIdList = kpiIds.split(',').map(id => parseInt(id.trim()));
        const data = {};
        const currentYear = year || new Date().getFullYear();

        for (let i = 0; i < kpiIdList.length; i++) {
            const kpiId = kpiIdList[i];

            const result = await db.query(`
                SELECT 
                    year,
                    kpi_Items_list.kpi_name,
                    kpi_Items_list.unit,
                    tbl_kpi_inventory.kpi_item_id,
                    ROUND(SUM(jan + feb + mar), 2) AS Q1,
                    ROUND(SUM(apr + may + jun), 2) AS Q2,
                    ROUND(SUM(jul + aug + sep), 2) AS Q3,
                    ROUND(SUM(oct + nov + \`dec\`), 2) AS Q4,
                    (SELECT quaterly FROM tbl_kpi_target WHERE user_id = ${user_id} AND kpi_id = ${kpiId}) AS target_value
                FROM tbl_kpi_inventory
                LEFT JOIN kpi_Items_list 
                    ON kpi_Items_list.id = tbl_kpi_inventory.kpi_item_id
                WHERE tbl_kpi_inventory.facility_id IN (?)
                  AND tbl_kpi_inventory.kpi_item_id = ?
                  AND year = ?
                GROUP BY year, tbl_kpi_inventory.kpi_item_id, kpi_Items_list.kpi_name, kpi_Items_list.unit
            `, [facilityIds, kpiId, currentYear]);

            const rows = result.rows || result;
            if (rows.length > 0) {
                const row = rows[0];
                data[`first${i + 1}`] = {
                    year: row.year,
                    time: ['Q1', 'Q2', 'Q3', 'Q4'],
                    series: [parseFloat(row.Q1 || null), parseFloat(row.Q2 || null), parseFloat(row.Q3 || null), parseFloat(row.Q4 || null)],
                    kpi_item_id: row.kpi_item_id,
                    target_value: Number(row.target_value) || null,
                    kpi_name: row.kpi_name,
                    kpi_unit: row.unit
                };
            } else {
                const [kpi_Items_list] = await db.query('SELECT * FROM `kpi_Items_list` WHERE id IN (?)', [kpiId])

                data[`first${i + 1}`] = {
                    year: currentYear,
                    time: ['Q1', 'Q2', 'Q3', 'Q4'],
                    series: [null, null, null, null],
                    kpi_item_id: kpiId,
                    kpi_name: kpi_Items_list.kpi_name,
                    kpi_unit: kpi_Items_list.unit
                };
            }
        }

        return data;
    },

    getKpiInventoryAggregateDataMonthly: async (facilities, kpiIds, user_id, year ) => {
        const facilityIds = facilities.split(',').map(id => parseInt(id.trim()));
        const kpiIdList = kpiIds.split(',').map(id => parseInt(id.trim()));
        const data = {};
        const currentYear = year || new Date().getFullYear();

        for (let i = 0; i < kpiIdList.length; i++) {
            const kpiId = kpiIdList[i];

            const result = await db.query(`
                SELECT 
                    year,
                    kpi_Items_list.kpi_name,
                    kpi_Items_list.unit,
                    tbl_kpi_inventory.kpi_item_id,
                    ROUND(SUM(jan), 2) AS jan,
                    ROUND(SUM(feb), 2) AS feb,
                    ROUND(SUM(mar), 2) AS mar,
                    ROUND(SUM(apr), 2) AS apr,
                    ROUND(SUM(may), 2) AS may,
                    ROUND(SUM(jun), 2) AS jun,
                    ROUND(SUM(jul), 2) AS jul,
                    ROUND(SUM(aug), 2) AS aug,
                    ROUND(SUM(sep), 2) AS sep,
                    ROUND(SUM(oct), 2) AS oct,
                    ROUND(SUM(nov), 2) AS nov,
                    ROUND(SUM(\`dec\`), 2) AS \`dec\`,
                    (SELECT monthly FROM tbl_kpi_target WHERE user_id = ${user_id} AND kpi_id = ${kpiId}) AS target_value
                FROM tbl_kpi_inventory
                LEFT JOIN kpi_Items_list 
                    ON kpi_Items_list.id = tbl_kpi_inventory.kpi_item_id
                WHERE tbl_kpi_inventory.facility_id IN (?)
                  AND tbl_kpi_inventory.kpi_item_id = ?
                  AND year = ?
                GROUP BY year, tbl_kpi_inventory.kpi_item_id, kpi_Items_list.kpi_name, kpi_Items_list.unit
            `, [facilityIds, kpiId, currentYear]);

            const rows = result.rows || result;
            if (rows.length > 0) {
                const row = rows[0];

                const jan = parseFloat(row.jan || null);
                const feb = parseFloat(row.feb || null);
                const mar = parseFloat(row.mar || null);
                const apr = parseFloat(row.apr || null);
                const may = parseFloat(row.may || null);
                const jun = parseFloat(row.jun || null);
                const jul = parseFloat(row.jul || null);
                const aug = parseFloat(row.aug || null);
                const sep = parseFloat(row.sep || null);
                const oct = parseFloat(row.oct || null);
                const nov = parseFloat(row.nov || null);
                const dec = parseFloat(row.dec || null);

                data[`first${i + 1}`] = {
                    year: row.year,
                    time: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    series: [
                        jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec
                    ],
                    kpi_item_id: row.kpi_item_id,
                    target_value: Number(row.target_value) || null,
                    kpi_name: row.kpi_name,
                    kpi_unit: row.unit
                };
            } else {
                const [kpi_Items_list] = await db.query('SELECT * FROM `kpi_Items_list` WHERE id IN (?)', [kpiId])

                data[`first${i + 1}`] = {
                    year: currentYear,
                    time: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    series: [null, null, null, null, null, null, null, null, null, null, null, null],
                    kpi_item_id: kpiId,
                    kpi_name: kpi_Items_list.kpi_name,
                    kpi_unit: kpi_Items_list.unit
                };
            }
        }

        return data;
    },

    getKpiInventoryCompareDataAnnually: async (facilities, kpiIds, year) => {
        const facilityIds = facilities.split(',').map(id => parseInt(id.trim()));
        const kpiIdList = kpiIds.split(',').map(id => parseInt(id.trim()));
        const data = {};
        const currentYear = year || new Date().getFullYear();

        for (let i = 0; i < kpiIdList.length; i++) {
            const kpiId = kpiIdList[i];

            const result = await db.query('SELECT facility_id, B.AssestName, kpi_Items_list.kpi_name, kpi_Items_list.unit, tbl_kpi_inventory.kpi_item_id, ROUND(SUM(annual), 2) AS annual FROM tbl_kpi_inventory LEFT JOIN kpi_Items_list ON kpi_Items_list.id = tbl_kpi_inventory.kpi_item_id LEFT JOIN `dbo.facilities` B ON B.ID = tbl_kpi_inventory.facility_id WHERE tbl_kpi_inventory.facility_id IN (?) AND tbl_kpi_inventory.kpi_item_id = ? AND year = ? GROUP BY tbl_kpi_inventory.facility_id, B.AssestName, tbl_kpi_inventory.kpi_item_id, kpi_Items_list.kpi_name, kpi_Items_list.unit', [facilityIds, kpiId, currentYear]);

            const rows = result.rows || result;

            const facilityDataMap = {};
            const facilityNameMap = {};
            let kpiName = null;
            let kpiUnit = null;

            rows.forEach(row => {
                facilityDataMap[row.facility_id] = parseFloat(row.annual || null);
                facilityNameMap[row.facility_id] = row.AssestName;
                kpiName = row.kpi_name;
                kpiUnit = row.unit;
            });

            async function getFacilituesUd(id) {
                const [facilityInfo] = await db.query('SELECT * FROM `dbo.facilities` WHERE ID = ?', [id]);
                return facilityInfo.AssestName
            }

            const time = await Promise.all(
                facilityIds.map(async fid => {
                    return facilityNameMap[fid] || await getFacilituesUd(fid);
                })
            );

            const series = facilityIds.map(fid => facilityDataMap[fid] ?? null);

            if (!kpiName && !kpiUnit) {
                const [kpiInfo] = await db.query('SELECT kpi_name, unit FROM kpi_Items_list WHERE id = ?', [kpiId]);
                kpiName = kpiInfo?.kpi_name || null;
                kpiUnit = kpiInfo?.unit || null;
            }

            data[`first${i + 1}`] = {
                year: currentYear,
                time,
                series,
                kpi_item_id: kpiId,
                kpi_name: kpiName,
                kpi_unit: kpiUnit
            };
        }

        return data;
    },

    updateKpiInventoryJson: async (jsonData, id) => {
        return await db.query(`UPDATE tbl_kpi_inventory_json SET inventory_json = ? WHERE id = ?`, [jsonData, id]);
    },

    insertKpiInventoryJson: async (data) => {
        return await db.query('INSERT INTO `tbl_kpi_inventory_json` set ?', [data]);
    },

    findKpiItems: async () => {
        return await db.query("SELECT * FROM `kpi_Items_list` ORDER BY id")
    },

    kpiInventoryGhgEmission: async (facilitiesdata, base_year, current_year) => {
        return await db.query(`SELECT B.ID AS facility_id, B.AssestName, A.year, SUM(A.annual) AS annual FROM \`dbo.facilities\` B LEFT JOIN tbl_kpi_inventory A ON A.facility_id = B.ID AND A.year BETWEEN '${base_year}' AND '${current_year}' WHERE B.ID IN (${facilitiesdata}) AND A.kpi_item_id = 4 GROUP BY A.year;`);
    },

    kpiInventoryRevenue: async (facilitiesdata, base_year, current_year) => {
        return await db.query(`SELECT B.ID AS facility_id, B.AssestName, A.year, SUM(A.annual) AS annual FROM \`dbo.facilities\` B LEFT JOIN tbl_kpi_inventory A ON A.facility_id = B.ID AND A.year BETWEEN '${base_year}' AND '${current_year}' WHERE B.ID IN (${facilitiesdata}) AND A.kpi_item_id = 6 GROUP BY A.year;`);
    }
};