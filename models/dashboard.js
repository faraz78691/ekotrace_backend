const db = require("../utils/database");
const config = require("../config");
const baseurl = config.base_url;

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


    purchaseGoodsBySupplier: async (facilities, year) => {
        let where = "WHERE status = 'S'";
    
        if (facilities !== '0') {
            where += ` AND A.facilities IN (${facilities}) AND A.year = ${year} AND A.supplier IS NOT NULL`;
        }
    
        const query = `
            SELECT 
                SUM(A.emission) AS emission,
                A.unit,
                A.supplier,
                COALESCE('Purchased goods and services', '') AS category
            FROM 
                purchase_goods_categories A
            ${where}
            GROUP BY 
                A.supplier, A.unit
            ORDER BY 
                emission DESC
            LIMIT 10
        `;
    
        return db.query(query);
    },

    flight_travelDetailsByemssion: async (facilities, year, flight_type, flight_class) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;
        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities})`
        }
        if (flight_type) {
            where += `  and  A.flight_Type LIKE '%${flight_type}%'`
        }

        if (flight_class) {
            where += `  and  A.flight_Class = '${flight_class}'`
        }
        return db.query("select  SUM(A.emission) as emission from flight_travel A " + where);
    },


    hotel_stayDetailsemssion: async (facilities, year) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;
        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities})`
        }

        return db.query("select   SUM(A.emission) as emission from hotel_stay A " + where);
    },

    other_modes_of_transportDetailsemssion: async (facilities, year, other) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;
        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities})`
        }
        if (other) {
            where += `  and  A.mode_of_trasport ='${other}'`
        } else {
            where += `  and A.mode_of_trasport !='Car'`
        }

        return db.query("select SUM(A.emission) as emission from other_modes_of_transport A " + where);
    },




    waste_generated_emissionsDetailsEmssion: async (facilities, year) => {
        let where = "";
        where = ` where  A.year = '${year}' and A.status = 'S'`;
        if (facilities != '0') {
            where += `  and  A.facility_id IN (${facilities})`
        }

        return db.query("select A.* from waste_generated_emissions A " + where);
    },

    waste_generated_emissionsDetailsEmssionByMethod: async (facilities, year, method) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;
        if (facilities != '0') {
            where += `  and  A.facility_id IN (${facilities})`
        }
        where += ` and A.method = '${method}'`
        return db.query("select SUM(A.total_waste) as emission,A.year,A.facility_id,A.method from waste_generated_emissions A " + where);
    },


    topFiveWasteEmissions: async (facilities, year) => {
        return db.query(`SELECT 
            product as wasteName,
            SUM(emission)/1000 AS emission
        FROM 
            waste_generated_emissions
        WHERE 
            facility_id = ${facilities} AND
            year = ${year}
        GROUP BY 
            product
        ORDER BY 
            emission DESC
        LIMIT 5`)
    },



    waste_generated_emissionsDetailsEmssionByloop: async (facilities, year, loop) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;
        if (facilities != '0') {
            where += `  and  A.facility_id IN (${facilities})`
        }
        where += ` and A.waste_loop = '${loop}'`
        return db.query("select SUM(A.total_waste) as emission,A.waste_loop,A.year,A.facility_id from waste_generated_emissions A " + where);
    },

    waste_generated_emissionsDetailsEmssion_new: async (facilities, year) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;
        if (facilities != '0') {
            where += `  and  A.facility_id IN (${facilities})`
        }
        where += `and A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and A.month !="" `

        return db.query("select A.*, A.month from waste_generated_emissions A " + where);
    },


    water_supply_treatment_categoryDetailsemission: async (facilities, year) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S' `;
        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities})`
        }

        return db.query("select A.* from water_supply_treatment_category A " + where);
    },

    water_supply_treatment_graph: async (facilities, year, finalyeardata) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;
        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities})`
        }

        if (finalyeardata == '2') {
            where += ` and  A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and  A.month !="" `
        } else {
            where += ` and  A.month IN ("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec") and  A.month !="" `
        }

        //where += `and A.month IN ("Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar") and A.month !="" `

        return db.query("select A.month AS month_number,A.emission,A.id from water_supply_treatment_category A " + where);
    },

    getCombustionEmissionDetail: async (facilities, year, SubCategoriesID) => {
        let where = "";
        where = ` where  A.Year = '${year}' and Status = 'S' `;

        if (facilities != '0') {
            where += `  and A.facility_id IN (${facilities})`
        }

        where += ` and  A.SubCategoriesID = '${SubCategoriesID}'`

        // return db.query(`select  SUM(A.ReadingValue * A.Scope3GHGEmission) as emission from stationarycombustionde A ${where}`); 
        return db.query(`select SUM(A.Scope3GHGEmission) as emission from stationarycombustionde A ${where}`);
    },
    getscope1CombustionEmissionDetail: async (facilities, year, SubCategoriesID) => {
        let where = "";
        where = ` where  A.Year = '${year}' and Status = 'S' `;

        if (facilities != '0') {
            where += `  and A.facility_id IN (${facilities})`
        }

        where += ` and  A.SubCategoriesID = '${SubCategoriesID}'`

        // return db.query(`select  SUM(A.ReadingValue * A.Scope3GHGEmission) as emission from stationarycombustionde A ${where}`); 
        return db.query(`select SUM(A.GHGEmission) as emission from stationarycombustionde A ${where}`);
    },

    getCombustionEmissionDetailFixed: async (facilities, year) => {
        let where = "";
        where = ` where  A.Year = '${year}' and Status = 'S' `;

        if (facilities != '0') {
            where += `  and A.facility_id IN (${facilities})`
        }

        // where += ` and  A.SubCategoriesID = '${SubCategoriesID}'`

        // return db.query(`select  SUM(A.ReadingValue * A.Scope3GHGEmission) as emission from stationarycombustionde A ${where}`); 
        return db.query(`select SUM(A.GHGEmission) as emission from stationarycombustionde A ${where}`);
    },

    getAllelectricityDetail: async (facilities, year, SubCategorySeedID) => {
        let where = "";
        where = ` where  A.Year = '${year}' and Status = 'S' `;
        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities})` //
        }
        if (SubCategorySeedID == 1002) {
            where += ` and A.SubCategorySeedID ="${SubCategorySeedID}" `
        } else {
            where += ` and A.SubCategorySeedID !="1002" `
        }
        return db.query("select SUM(A.GHGEmission) as emission from `dbo.renewableelectricityde` A " + where);
    },

    getAllelectricityDetailByCat: async (facilities, year) => {
        let where = "";
        where = ` where  A.Year = '${year}' and Status = 'S'`;
        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities})` //
        }

        //  where += ` and A.SubCategorySeedID ="${SubCategorySeedID}" `

        return db.query("select SUM(A.GHGEmission) as emission from `dbo.renewableelectricityde` A " + where);
    },
    /////////////////////////////////newwwwwwwwwww//////////////////////////////
    waste_generated_emissionsDetailsEmssionByMethodemission: async (facilities, year, method) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;
        if (facilities != '0') {
            where += `  and  A.facility_id IN (${facilities})`
        }
        where += ` and A.method = '${method}' GROUP BY A.year, A.facility_id, A.method`
        return db.query("select SUM(A.emission) as emission,A.year,A.facility_id,A.method from waste_generated_emissions A " + where);
    },

    offsetemission: async (user_id) => {
        where = ` where user_id = '${user_id}' GROUP BY A.offset`
        return db.query("select SUM(A.offset) as offset,A.user_id from user_offseting A " + where);
    },

    actionsEmission: async (user_id) => {
        where = ` where user_id = '${user_id}' and status = 'Achieved' GROUP BY A.co2_savings_tcoe`
        return db.query("select SUM(A.co2_savings_tcoe) as emission,A.user_id from actions A " + where);
    },

    waste_generated_emissionsByproduct: async (facilities, year, product) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;
        if (facilities != '0') {
            where += `  and  A.facility_id IN (${facilities})`
        }
        const productsplit = product.split(',');
        let joinproduct = productsplit.join("','");

        where += ` and A.product IN ('${joinproduct}') GROUP BY A.year, A.facility_id, A.product`
        return db.query("select SUM(A.emission) as emission,A.year,A.facility_id,A.product from waste_generated_emissions A " + where);
    },

    waste_generated_emissions_by_hazardous: async (facilitiesdata, year) => {
        return await db.query(`SELECT IFNULL(ROUND(SUM(eltc.emission) / 1000, 4), 0) AS emission FROM waste_generated_emissions eltc LEFT JOIN endoflife_waste_type ewt ON ewt.id = eltc.waste_type_id WHERE eltc.facility_id IN (${facilitiesdata}) AND eltc.year = ${year} AND ewt.hazard_nonhazard = 1 ;`)
    },

    waste_generated_emissions_by_non_hazadrous: async (facilitiesdata, year) => {
        return await db.query(`SELECT IFNULL(ROUND(SUM(eltc.emission) / 1000, 4), 0) AS emission FROM waste_generated_emissions eltc LEFT JOIN endoflife_waste_type ewt ON ewt.id = eltc.waste_type_id WHERE eltc.facility_id IN (${facilitiesdata}) AND eltc.year = ${year} AND ewt.hazard_nonhazard = 0;`);
    },

    costcenterData_emission: async (user_id) => {
        return db.query(`select DISTINCT(cost_center_name) as cost_center_name from cost_center where user_id = '${user_id}' `);
    },


    emssionBycostcenter: async (facilities, year, cost_centre) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;
        if (facilities != '0') {
            where += `  and  A.facilities IN (${facilities})`
        }
        where += ` and A.cost_centre = '${cost_centre}' GROUP BY A.year, A.facilities, A.cost_centre`
        return db.query("select  SUM(A.emission) as emission,A.cost_centre, A.year,A.facilities from flight_travel A " + where);
    },

    investmentEmissionsFinance: async (sub_group_id, year, investement_type) => {
        let where = "";
        where = ` where  A.year = '${year}' and status = 'S'`;
        if (sub_group_id != '0') {
            //  where += `  and  A.sub_group_id  = '${sub_group_id}'`

            where += `  and  A.sub_group_id IN (${sub_group_id})`
        }
        if (investement_type) {
            where += `  and  A.investement_type LIKE '%${investement_type}%'`
        }
        return db.query("select SUM(A.emission) as emission,COALESCE('Investments', '')  as  category  from investment_emissions A  " + where);
    },


    investmentAllEmissionsFinance: async (sub_group_id, year) => {
        let where = "";
        where = ` where  A.year = '${year}' and A.status = 'S' `;
        if (sub_group_id != '0') {
            // where += `  and  A.sub_group_id  = '${sub_group_id}'`
            where += `  and  A.sub_group_id IN (${sub_group_id})`
        }
        where += ` GROUP BY A.category`
        return db.query("select  SUM(A.emission) as emission, A.category from investment_emissions A  " + where);
    },
}
