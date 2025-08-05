const db = require("../utils/database");
const config = require("../config");
const baseurl = config.base_url;

module.exports = {
  fetchCombustionEmission: async (seed_id, type_id, country_id, calorificValue, unit, year) => {
   
    let baseQuery = `SELECT * FROM stationarycombustion WHERE SubCategorySeedID = ? AND SubCatTypeID = ? AND country_id = ? and Right(Fiscal_Year, 4) = ?`;
    let params = [seed_id, type_id, country_id, year];
    let additionalCondition = '';

    if (calorificValue) {
      additionalCondition = ` AND kgCO2e_kwh IS NOT NULL`;
    } else {
      switch (unit.toLowerCase()) {
        case 'kwh':
          additionalCondition = ` AND kgCO2e_kwh IS NOT NULL`;
          break;
        case 'kg':
          additionalCondition = ` AND kgCO2e_kg IS NOT NULL`;
          break;
        case 'litres':
          additionalCondition = ` AND kgCO2e_litre IS NOT NULL`;
          break;
        case 'kl':
          additionalCondition = ` AND kgCO2e_kwh IS NOT NULL`;
          break;
        case 'tonnes':
          additionalCondition = ` AND kgCO2e_tonnes IS NOT NULL`;
          break;
        default:
          additionalCondition = '';
      }
    }
    const finalQuery = baseQuery + additionalCondition;
    return db.query(finalQuery, params);
  },

  getStationaryComissionFactorByItemType: async (type, country_id) => {
    return await db.query('select *  from stationarycombustion WHERE ItemType = ? AND country_id = ?', [type, country_id])
  },

  checkCategoryInTemplate: async (facilityId) => {
    return db.query(`select C.CatName as catName, count(*) as count   \
                    from \`dbo.managedatapointcategory\` MDS,  \`dbo.categoryseeddata\` C, \`dbo.managedatapoint\` MDP  \
                    where MDS.ManageDataPointCategorySeedID = C.Id  and  MDS.ManageDataPointId = MDP.ID and MDP.FacilityId = ${facilityId} and C.CatName = 'Fuel and Energy-related Activities' LIMIT 1`);
  },

  insertCombustionEmission: async (data) => {
    return db.query(
      "INSERT INTO   `stationarycombustionde` (user_id, ReadingValue, ReadingValueKL, Unit, Status, Year, Month, GHGEmission, GHGEmissionFactor, BlendType, BlendPercent, CalorificValue, TypeName,TypeID, SubCategoriesID,CreatedBy,facility_id, Scope3GHGEmission, Scope3GHGEmissionFactor, FileName) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        data.user_id,
        data.readingValue,
        data.readingValueByKL,
        data.Unit,
        "P",
        data.year,
        data.month,
        data.ghgEmissions,
        data.ghgEmissionFactor,
        data.BlendType,
        data.BlendPercent,
        data.calorificValue,
        data.TypeName,
        data.TypeId,
        data.SubCategoriesID,
        data.user_id,
        data.facility_id,
        data.Scope3GHGEmission,
        data.Scope3GHGEmissionFactor,
        data.FileName
      ]
    );
  },

  getCombustionEmission: async (user_id) => {
    return db.query(`select ReadingValue,Unit,Status,Year,Month,GHGEmission,BlendType,BlendPercent,user_id,TypeName,CalorificValue from stationarycombustionde where  user_id= ?`, [user_id]);
  },

};
