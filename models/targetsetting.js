const db = require("../utils/database");
const config = require("../config");
const baseurl = config.base_url;

module.exports = {

        getCompanyVehicles : async (facilities) => {
        return db.query(`WITH t1 AS \
        (SELECT \`GHGEmission\`, \`Year\`, facility_id FROM \`stationarycombustionde\` where facility_id in (${facilities})) \
        SELECT SUM(t1.GHGEmission) as emission, t1.Year as year\
        FROM t1 \
        GROUP BY t1.Year`); 
        },

        getRefrigerants : async (facilities) => {
            return db.query(`WITH t1 AS \
        (SELECT \`GHGEmission\`, \`Year\`, facilities FROM \`dbo.refrigerantde\` where facilities in (${facilities}))\
        SELECT SUM(t1.GHGEmission) as emission, t1.Year as year\
        FROM t1\
        GROUP BY t1.Year`);
        },

        getRenewableElectricity : async (facilities) => {
            return db.query(`WITH t1 AS \
            (SELECT \`GHGEmission\`, \`Year\`, facilities FROM \`dbo.renewableelectricityde\` where facilities in (${facilities}))\
            SELECT SUM(t1.GHGEmission) as emission, t1.Year as year\
            FROM t1\
            GROUP BY t1.Year`);
        },

        getPurchaseGoodsServices: async (facilities) => {
            return db.query(`WITH t1 AS \
            (SELECT \`emission\`, \`Year\`, facilities FROM \`purchase_goods_categories\` where facilities in (${facilities}))\
            SELECT SUM(t1.emission) as emission, t1.Year as year\
            FROM t1\
            GROUP BY t1.Year`);
        },

        getBusinessTravel: async (facilities) => {
            return db.query(`WITH t2 AS \
            (SELECT \`emission\`, \`Year\`, facilities FROM \`flight_travel\` where facilities in (${facilities}))\
            SELECT SUM(t2.emission) as emission, t2.Year as year\
            FROM t2\
            GROUP BY t2.Year`);
        },

        getWasteGenerated: async (facilities) => {
            return db.query(`WITH t1 AS \
            (SELECT \`emission\`, \`Year\`, facilities FROM \`waste_generated_emissions\` where facilities in (${facilities}))\
            SELECT SUM(t1.emission) as emission, t1.Year as year\
            FROM t1\
            GROUP BY t1.Year`);
        },

        getWaterSupllyTreamtment: async (facilities) => {
            return db.query(`WITH t1 AS \
            (SELECT \`emission\`, \`Year\`, facilities FROM \`water_supply_treatment_category\` where facilities in (${facilities}))\
            SELECT SUM(t1.emission) as emission, t1.Year as year\
            FROM t1\
            GROUP BY t1.Year`);
        },

        getEmployeeCommuting: async (facilities) => {
            return db.query(`WITH t1 AS \
            (SELECT \`emission\`, \`Year\`, facilities FROM \`employee_commuting_category\` where facilities in (${facilities}))\
            SELECT SUM(t1.emission) as emission, t1.Year as year\
            FROM t1\
            GROUP BY t1.Year`);
        },

        insertTargets: async (data) => {
            return db.query("insert into target_setting set ?", [data]);
          },
        
          getTargetByUserID: async (tenantId) => {
            return db.query("select E.*,U.userName as user_name from target_setting E   LEFT JOIN `dbo.tenants` U ON U.Id = E.user_id where E.tenantId= ?", [tenantId]);
          },

          
        insertActions: async (data) => {
            return db.query("insert into actions set ?", [data]);
          },
        
          getActionsByUserID: async (tenantId) => {
            return db.query("select * from actions where tenantId= ?", [tenantId]);
          },

        
          getInventoryByYear: async (year_added,user_id) => {
            return db.query("select * from emission_inventory where  year_added =? and user_id = ?", [year_added, user_id]);
          },

          updateInventoryScope: async ( year_added, emission1,emission2, emission3, user_id) => {
            return db.query("update emission_inventory set total_scope1 = total_scope1 + ?, total_scope2 = total_scope2 + ?, total_scope3 = total_scope3 + ?, total_emission = total_scope1+ total_scope2+total_scope3 where  year_added =? and user_id=?", [ emission1, emission2, emission3, year_added, user_id]);
          },

          insertEmissionIventory: async (data) => {
            return db.query("insert into emission_inventory set ?", [data]);
          },

          insertEmissionIventoryRelation: async (data) => {
            return db.query("insert into emission_inventory_relation set ?", [data]);
          },
   
          getInventoryByUserID: async (tenantId) => {
            return db.query("select E.*,U.userName as user_name from emission_inventory E LEFT JOIN `dbo.tenants` U ON U.Id = E.user_id   where E.tenantId= ?  ", [tenantId]);
          },

          getInventoryRelationByRelationID: async (relation_id) => {
            return db.query("select * from emission_inventory_relation where relation_id= ?", [relation_id]);
          },

          getInventoryByRelationID: async (relation_id) => {
            return db.query("select * from emission_inventory where relation_id= ?", [relation_id]);
          },

          getInventoryPointsByUserID: async (user_id, base_year, target_year) => {
            return db.query(`SELECT year_added,total_scope1,total_scope2,total_scope3 FROM \`emission_inventory\` where user_id= '${user_id}' and year_added between '${base_year}' and '${target_year}'`);
          },

          getInventoryPerPointsByUserID: async (user_id, per, base_year, target_year) => {
            return db.query(`SELECT year_added,(total_scope1-(total_scope1*${per})) as per_total_scope1,(total_scope2-(total_scope2*${per})) as per_total_scope2,(total_scope3-total_scope3*${per}) as per_total_scope3 FROM \`emission_inventory\`where \`user_id\`= '${user_id}' and year_added between '${base_year}' and '${target_year}'`);
          },
          
          getIntensityPointsByUserID: async (user_id, base_year, target_year) => {
            return db.query(`SELECT year_added,physical_intensity1 as total_scope1,physical_intensity2 as total_scope2, physical_intensity3 as total_scope3 FROM \`emission_inventory\` where user_id= '${user_id}' and year_added between '${base_year}' and '${target_year}'`);
          },

          getIntensityPerPointsByUserID: async (user_id, per, base_year, target_year) => {
            return db.query(`SELECT year_added,(physical_intensity1-(physical_intensity1*${per})) as per_total_scope1,(physical_intensity2-(physical_intensity2*${per})) as per_total_scope2,(physical_intensity3-physical_intensity3*${per}) as per_total_scope3 FROM \`emission_inventory\`where \`user_id\`= '${user_id}' and year_added between '${base_year}' and '${target_year}'`);
          },
   
          getRevnueFactor :async(user_id) =>{
            return db.query(`SELECT factor1, factor2, factor3 from revenue_factor where group_id=?`,[user_id]);
          },

          updateInvetoryRelationByID:async(id,emission) =>{
            return db.query(`UPDATE emission_inventory_relation set emission = ? where id = ?`,[emission, id]);
          },

          updateEmissionIventory:async(relation_id,scope1_emission, scope2_emission,scope3_emission, physical_intensity1, physical_intensity2 , physical_intensity3, group_added, production_output, economic_output) =>{
            return db.query(`UPDATE emission_inventory set total_scope1 = ?, total_scope2 = ?, total_scope3 = ?, physical_intensity1= ?, physical_intensity2 = ?, physical_intensity3 =?, group_added=?, production_output =?, economic_output=?\
                            where relation_id = ?`,[scope1_emission, scope2_emission, scope3_emission, physical_intensity1,physical_intensity2,physical_intensity3,group_added,production_output,economic_output, relation_id]);
          },
          updateTargetSettingById:async(target_name,emission_activity, target_type,other_target_kpi, base_year, target_year , target_emission_change, other_target_kpichange, id) =>{
            return db.query(`UPDATE target_setting set target_name = ?, emission_activity = ?, target_type = ?, other_target_kpi= ?, base_year = ?, target_year =?, target_emission_change=?, other_target_kpichange =? \
                            where id = ?`,[target_name, emission_activity, target_type, other_target_kpi,base_year,target_year,target_emission_change,other_target_kpichange,id]);
          },

          insertRevenueFactors: async (data) => {
            return db.query("insert into revenue_factor set ?", [data]);
          },

          getRevenueFactorsByUserID: async (user_id) => {
            return db.query("select * from revenue_factor where group_id= ?", [user_id]);
          },

          insertCarbonOffset :async (data) => {
            return db.query("insert into carbon_offsetting set ?", [data]);
          },

          selectCarbonOffset : async(user_id)  => {
            return db.query("select scope1, scope2, scope3 into carbon_offsetting where user_id = ?", [data]);
          }
}; 
