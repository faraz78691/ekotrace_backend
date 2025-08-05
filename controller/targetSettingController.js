const Joi = require("joi");
const jwt = require("jsonwebtoken");
const {
  getCompanyVehicles,
  getRefrigerants,
  getRenewableElectricity,
  getPurchaseGoodsServices,
  getBusinessTravel,
  getWasteGenerated,
  getWaterSupllyTreamtment,
  getEmployeeCommuting,
  insertTargets,
  getTargetByUserID,
  insertActions,
  getActionsByUserID,
  insertEmissionIventory,
  getInventoryByUserID,
  getInventoryPointsByUserID,
  getInventoryPerPointsByUserID,
  insertEmissionIventoryRelation,
  getInventoryRelationByRelationID,
  getRevnueFactor,
  getIntensityPointsByUserID,
  getIntensityPerPointsByUserID,
  getInventoryByRelationID,
  updateInvetoryRelationByID,
  updateEmissionIventory,
  insertRevenueFactors,
  getRevenueFactorsByUserID,updateTargetSettingById,
  insertCarbonOffset
} = require("../models/targetsetting");
const hash = require("random-hash");

exports.getEmissionInventory = async (req, res) => {
  try {
    const { facilities } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        facilities: [Joi.string().empty().required()],
      })
    );
    const result = schema.validate(req.body);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 200,
        success: false,
      });
    }
    // Scope3 Business travel and employee commute
    var bussinessandEmployee = [];
    const businessTravel = await getBusinessTravel(facilities);
    const employeeCommute = await getEmployeeCommuting(facilities);
    if (businessTravel.length > 0 && employeeCommute.length > 0) {
      for (element of businessTravel) {
        var index = employeeCommute.findIndex((x) => x.year === element.year);
        var temp;
        if (index === -1) {
          temp = { year: element.year, emission: element.emission };
        } else {
          temp = {
            year: element.year,
            emission:
              Number(element.emission) + Number(businessTravel[index].emission),
          };
        }
        bussinessandEmployee.push(temp);
      }
      for (element of employeeCommute) {
        var index = businessTravel.findIndex((x) => x.year === element.year);
        var temp;
        if (index === -1) {
          temp = { year: element.year, emission: element.emission };
          bussinessandEmployee.push(temp);
        }
      }
    } else if (businessTravel.length > 0) {
      for (element of businessTravel) {
        bussinessandEmployee.push(element);
      }
    } else if (employeeCommute.length > 0) {
      for (element of employeeCommute) {
        bussinessandEmployee.push(element);
      }
    }

    //Company Vehicles
    const companyVehicles = await getCompanyVehicles(facilities);
    const refrigerant = await getRefrigerants(facilities);
    const electricity = await getRenewableElectricity(facilities);
    const purchaseGoods = await getPurchaseGoodsServices(facilities);
    const wasteGenerate = await getWasteGenerated(facilities);
    const waterSupply = await getWaterSupllyTreamtment(facilities);
    res.json({
      success: true,
      status: 200,
      message: "Success",
      bussinessandEmployee: bussinessandEmployee,
      companyVehicles: companyVehicles,
      refrigerant: refrigerant,
      electricity: electricity,
      purchaseGoods: purchaseGoods,
      wasteGenerate: wasteGenerate,
      waterSupply: waterSupply,
    });
  } catch (err) {
    console.log(err);
    return res.json({
      success: false,
      message: "Internal server error",
      error: err,
      status: 500,
    });
  }
};

exports.addTargetSetting = async (req, res) => {
  try {
    const {
      target_name,
      emission_activity,
      target_type,
      other_target_kpi,
      base_year,
      target_year,
      target_emission_change,
      other_target_kpichange,tenantId
    } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        target_name: Joi.string().empty().required(),
        emission_activity: Joi.string().empty().required(),
        target_type: Joi.string().empty().required(),
        other_target_kpi: Joi.string().empty().required(),
        base_year: Joi.string().empty().required(),
        target_year: Joi.string().empty().required(),
        target_emission_change: Joi.number().empty().required(),
        other_target_kpichange: Joi.number().empty().required(),
        tenantId: [Joi.string().optional().empty().allow("")],
      })
    );
    const validationResult = schema.validate(req.body);
    if (validationResult.error) {
      const message = validationResult.error.details
        .map((i) => i.message)
        .join(",");
      return res.status(200).json({
        success: false,
        status: 400,
        message: message,
        error: "Validation error",
      });
    }
    const user_id = req.user.user_id;
    const targetSetting = {
      target_name: target_name,
      emission_activity: emission_activity,
      target_type: target_type,
      other_target_kpi: other_target_kpi,
      base_year: base_year,
      target_year: target_year,
      target_emission_change: target_emission_change,
      other_target_kpichange: other_target_kpichange,
      user_id :user_id,
      tenantId:tenantId
    };

    const targetDetails = await insertTargets(targetSetting);

    if (targetDetails.affectedRows > 0) {
      return res.status(200).json({
        success: true,
        status: 200,
        message: "Targets  added successfully!",
        targetDetails: targetDetails,
      });
    } else {
      return res.status(200).json({
        success: false,
        status: 400,
        message: "Error Adding Targets. Please try again later.",
      });
    }
  } catch (error) {
    return handleServerError(res, error);
  }
};

exports.getTargetSettingDetails = async (req, res) => {
  try {
    const { tenant_id} = req.params;
    const schema = Joi.alternatives(
      Joi.object({
        tenant_id: [Joi.string().empty().required()],
      })
    );
    const result = schema.validate(req.params);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 200,
        success: false,
      });
    }

    const getDetails = await getTargetByUserID(tenant_id);
    if (getDetails.length > 0) {
      return res.status(200).json({
        success: true,
        status: 200,
        message: "Orders Fetched Succesfully",
        orders: getDetails,
      });
    } else {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "No Data Found",
      });
    }
  } catch (error) {
    return handleServerError(res, error);
  }
};

exports.addActions = async (req, res) => {
  try {
    const {
      name,
      scope_category,
      co2_savings_tcoe,
      time_period,
      owner,
      status,tenantId
    } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        name: Joi.string().empty().required(),
        scope_category: Joi.string().empty().required(),
        co2_savings_tcoe: Joi.number().empty().required(),
        time_period: Joi.string().empty().required(),
        owner: Joi.string().empty().required(),
        status: Joi.string().empty().required(),
        tenantId: [Joi.number().optional().allow("")],
        
      })
    );
    const validationResult = schema.validate(req.body);
    if (validationResult.error) {
      const message = validationResult.error.details
        .map((i) => i.message)
        .join(",");
      return res.status(200).json({
        success: false,
        status: 400,
        message: message,
        error: "Validation error",
      });
    }
    const user_id = req.user.user_id;
    const targetSetting = {
      name: name,
      scope_category: scope_category,
      co2_savings_tcoe: co2_savings_tcoe,
      time_period: time_period,
      status: status,
      owner: owner,
      user_id: user_id,
      tenantId : tenantId
    };

    const targetDetails = await insertActions(targetSetting);

    if (targetDetails.affectedRows > 0) {
      return res.status(200).json({
        success: true,
        status: 200,
        message: "Targets  added successfully!",
        targetDetails: targetDetails,
      });
    } else {
      return res.status(200).json({
        success: false,
        status: 400,
        message: "Error Adding Targets. Please try again later.",
      });
    }
  } catch (error) {
    return handleServerError(res, error);
  }
};

exports.getActions = async (req, res) => {
  try {
    const { tenant_id} = req.params;
    const schema = Joi.alternatives(
      Joi.object({
        tenant_id: [Joi.string().empty().required()],
      })
    );
    const result = schema.validate(req.params);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 200,
        success: false,
      });
    }

    const getDetails = await getActionsByUserID(tenant_id);
    if (getDetails.length > 0) {
      return res.status(200).json({
        success: true,
        status: 200,
        message: "Orders Fetched Succesfully",
        orders: getDetails,
      });
    } else {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "No Data Found",
      });
    }
  } catch (error) {
    return handleServerError(res, error);
  }
};

/*exports.addEmissionInventory = async (req, res) => {
  try {
    const {
      scope1_items,
      scope2_items,
      scope3_items,
      group_added,
      year_added,
      scope1_emission,
      scope2_emission,
      scope3_emission,
    } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        group_added: Joi.string().empty().required(),
        year_added: Joi.string().empty().required(),
        scope1_emission: Joi.number().empty().required(),
        scope2_emission: Joi.number().empty().required(),
        scope3_emission: Joi.number().empty().required(),
      })
    );
    const validationResult = schema.validate(req.body);
    if (validationResult.error) {
      const message = validationResult.error.details
        .map((i) => i.message)
        .join(",");
      return res.status(400).json({
        success: false,
        status: 400,
        message: message,
        error: "Validation error",
      });
    }
    const authHeader = req.headers.auth;
    const jwtToken = authHeader.replace("Bearer ", "");
    const decoded = jwt.decode(jwtToken);
    const user_id = decoded.user_id;
    const relation_id = hash.generateHash({ length: 10 });
    const getResult = await getInventoryByYear(year_added, user_id);
    if (getResult.length > 0) {
      var updateResult;
      updateResult = await updateInventoryScope(
        year_added,
        scope1_emission,
        scope2_emission,
        scope3_emission,
        user_id
      );

      if (updateResult.affectedRows > 0) {
        return res.status(200).json({
          success: true,
          status: 200,
          message: "Targets  added successfully!",
          updateResult: updateResult,
        });
      } else {
        console.log("");
        return res.status(200).json({
          success: false,
          status: 400,
          message: "Some problem in updating the Databases",
        });
      }
    }

    var itemJson = JSON.parse(scope1_items);
    if (itemsJson.length > 0) {
      for (element of itemsJson) {
      const costReport = {
    
      };
      const result = await insertRevenueOrder(costReport);
      }
    }
    const inventory = {
      group_added: group_added,
      year_added: year_added,
      total_scope1:
        scope1_emission !== null || scope1_emission !== undefined
          ? scope1_emission
          : 0,
      total_scope2:
        scope2_emission !== null || scope2_emission !== undefined
          ? scope2_emission
          : 0,
      total_scope3:
        scope3_emission !== null || scope3_emission !== undefined
          ? scope3_emission
          : 0,
      total_emission:
        Number(
          scope1_emission !== null || scope1_emission !== undefined
            ? scope1_emission
            : 0
        ) +
        Number(
          scope2_emission !== null || scope2_emission !== undefined
            ? scope2_emission
            : 0
        ) +
        Number(
          scope3_emission !== null || scope3_emission !== undefined
            ? scope3_emission
            : 0
        ),
      user_id: user_id,
      relation_id : relation_id
    };

    const inventoryDetails = await insertEmissionIventory(inventory);

    if (inventoryDetails.affectedRows > 0) {
      return res.status(200).json({
        success: true,
        status: 200,
        message: "Targets  added successfully!",
        inventoryDetails: inventoryDetails,
      });
    } else {
      return res.status(200).json({
        success: false,
        status: 400,
        message: "Error Adding Emission Inventory. Please try again later.",
      });
    }
  } catch (error) {
    return handleServerError(res, error);
  }
};*/

exports.addEmissionInventory = async (req, res) => {
  try {
    const {
      scope1_items,
      scope2_items,
      scope3_items,
      group_added,
      year_added,
      scope1_emission,
      scope2_emission,
      scope3_emission,
      production_output,
      economic_output,tenantId
    } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        scope1_items: Joi.string().empty().required(),
        scope2_items: Joi.string().empty().required(),
        scope3_items: Joi.string().empty().required(),
        group_added: Joi.string().empty().required(),
        year_added: Joi.string().empty().required(),
        scope1_emission: Joi.number().empty().required(),
        scope2_emission: Joi.number().empty().required(),
        scope3_emission: Joi.number().empty().required(),
        production_output: Joi.number().empty().required(),
        economic_output: Joi.number().empty().required(),
        tenantId: [Joi.string().optional().empty().allow("")],
      })
    );
    const validationResult = schema.validate(req.body);
    if (validationResult.error) {
      const message = validationResult.error.details
        .map((i) => i.message)
        .join(",");
      return res.status(200).json({
        success: false,
        status: 400,
        message: message,
        error: "Validation error",
      });
    }

    const user_id = req.user.user_id;
    const relation_id = hash.generateHash({ length: 10 });

    var itemJson = JSON.parse(scope1_items);
    if (itemJson.length > 0) {
      for (element of itemJson) {
        const scope1 = {
          category: element.category,
          sub_category: "Scope1",
          emission: element.emission,
          relation_id: relation_id,
        };
        const result = await insertEmissionIventoryRelation(scope1);
      }
    }
    itemJson = JSON.parse(scope2_items);
    if (itemJson.length > 0) {
      for (element of itemJson) {
        const scope2 = {
          category: element.category,
          sub_category: "Scope2",
          emission: element.emission,
          relation_id: relation_id,
        };
        const result = await insertEmissionIventoryRelation(scope2);
      }
    }
    itemJson = JSON.parse(scope3_items);
    if (itemJson.length > 0) {
      for (element of itemJson) {
        const scope3 = {
          category: element.category,
          sub_category: "Scope3",
          emission: element.emission,
          relation_id: relation_id,
        };
        const result = await insertEmissionIventoryRelation(scope3);
      }
    }
    if (Number(production_output)) {
      var physical_intensity1 =
        Number(scope1_emission) / Number(production_output);
      var physical_intensity2 =
        Number(scope2_emission) / Number(production_output);
      var physical_intensity3 =
        Number(scope3_emission) / Number(production_output);
    } else if (Number(economic_output)) {
      var physical_intensity1 =
        Number(scope1_emission) / Number(economic_output);
      var physical_intensity2 =
        Number(scope2_emission) / Number(economic_output);
      var physical_intensity3 =
        Number(scope3_emission) / Number(economic_output);
    }

    const inventory = {
      group_added: group_added,
      year_added: year_added,
      total_scope1:
        scope1_emission !== null || scope1_emission !== undefined
          ? scope1_emission
          : 0,
      total_scope2:
        scope2_emission !== null || scope2_emission !== undefined
          ? scope2_emission
          : 0,
      total_scope3:
        scope3_emission !== null || scope3_emission !== undefined
          ? scope3_emission
          : 0,
      total_emission:
        Number(
          scope1_emission !== null || scope1_emission !== undefined
            ? scope1_emission
            : 0
        ) +
        Number(
          scope2_emission !== null || scope2_emission !== undefined
            ? scope2_emission
            : 0
        ) +
        Number(
          scope3_emission !== null || scope3_emission !== undefined
            ? scope3_emission
            : 0
        ),
      user_id: user_id,
      tenantId:tenantId,
      relation_id: relation_id,
      physical_intensity1: physical_intensity1,
      physical_intensity2: physical_intensity2,
      physical_intensity3: physical_intensity3,
      production_output: production_output,
      economic_output: economic_output,
    };

    const inventoryDetails = await insertEmissionIventory(inventory);

    if (inventoryDetails.affectedRows > 0) {
      return res.status(200).json({
        success: true,
        status: 200,
        message: "Targets  added successfully!",
        inventoryDetails: inventoryDetails,
      });
    } else {
      return res.status(200).json({
        success: false,
        status: 400,
        message: "Error Adding Emission Inventory. Please try again later.",
      });
    }
  } catch (error) {
    return handleServerError(res, error);
  }
};

exports.getTargetEmissionInventory = async (req, res) => {
  try {
    const { tenant_id} = req.params;
    const schema = Joi.alternatives(
      Joi.object({
        tenant_id: [Joi.string().empty().required()],
      })
    );
    const result = schema.validate(req.params);
    if (result.error) {
      const message = result.error.details.map((i) => i.message).join(",");
      return res.json({
        message: result.error.details[0].message,
        error: message,
        missingParams: result.error.details[0].message,
        status: 200,
        success: false,
      });
    }

    const getDetails = await getInventoryByUserID(tenant_id);
    if (getDetails.length > 0) {
      return res.status(200).json({
        success: true,
        status: 200,
        message: "Inventory Fetched Succesfully",
        orders: getDetails,
      });
    } else {
      return res.status(200).json({
        success: false,
        status: 200,
        message: "No Data Found",
      });
    }
  } catch (error) {
    return handleServerError(res, error);
  }
};

exports.getTargetEmissionInventoryRelation = async (req, res) => {
  try {
    const { relation_id } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        relation_id: Joi.string().empty().required(),
      })
    );
    const validationResult = schema.validate(req.body);
    if (validationResult.error) {
      const message = validationResult.error.details
        .map((i) => i.message)
        .join(",");
      return res.status(200).json({
        success: false,
        status: 400,
        message: message,
        error: "Validation error",
      });
    }

    const getDetails = await getInventoryRelationByRelationID(relation_id);

    const getInventoryDetails = await getInventoryByRelationID(relation_id);
    if (getDetails.length > 0) {
      return res.status(200).json({
        success: true,
        status: 200,
        message: "Inventory Fetched Succesfully",
        individualDetails: getDetails,
        details: getInventoryDetails,
      });
    } else {
      return res.status(200).json({
        success: false,
        status: 200,
        message: "No Data Found",
      });
    }
  } catch (error) {
    return handleServerError(res, error);
  }
};

exports.getEmissionPoints = async (req, res) => {
  try {
    const { percentage, base_year, target_year, intensity } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        percentage: Joi.number().empty().required(),
        base_year: Joi.string().empty().required(),
        target_year: Joi.string().empty().required(),
        intensity: Joi.string().empty().required(),
        
      })
    );
    const validationResult = schema.validate(req.body);
    if (validationResult.error) {
      const message = validationResult.error.details
        .map((i) => i.message)
        .join(",");
      return res.status(200).json({
        success: false,
        status: 400,
        message: message,
        error: "Validation error",
      });
    }
    const user_id = req.user.user_id;
    var scope1Xcordinate = [];
    var scope2Xcordinate = [];
    var scope3Xcordinate = [];
    var yCordinate = [];
    var targetScope1Xcordinate = [];
    var targetScope2Xcordinate = [];
    var targetScope3Xcordinate = [];
    var targetYcordinate = [];
    var forecastScope1Xcordinate = [];
    var forecastScope2Xcordinate = [];
    var forecastScope3Xcordinate = [];
    var forecastYcordinate = [];
    const d = new Date();
    var currentYear = d.getFullYear();
    var getDetails;


    if (intensity === "A") {
      getDetails = await getInventoryPointsByUserID(
        user_id,
        base_year,
        currentYear
      );
    } else {
      getDetails = await getIntensityPointsByUserID(
        user_id,
        base_year,
        currentYear
      );
    }

    if (getDetails.length > 0) {
      for (elem of getDetails) {
        scope1Xcordinate.push(Number(elem.total_scope1));
        scope2Xcordinate.push(Number(elem.total_scope2));
        scope3Xcordinate.push(Number(elem.total_scope3));
        yCordinate.push(Number(elem.year_added));
      }
      var baseYearIndex = yCordinate.indexOf(Number(base_year));
      var currentYearIndex = yCordinate.indexOf(Number(currentYear));

      if (baseYearIndex < 0) {
        return res.status(200).json({
          success: false,
          message:
            "Emissions on base year " + currentYear + " is not entered by User.",
          status: 400,
        });
      } else if (currentYearIndex < 0) {
        return res.status(200).json({
          success: false,
          message:
            "Emissions on current year " +
            currentYear +
            " is not entered by User.",
          status: 400,
        });
      }
      var indexYear = Number(base_year);
      var targetX1 = Number(getDetails[0].total_scope1);
      var targetX2 = Number(getDetails[0].total_scope2);
      var targetX3 = Number(getDetails[0].total_scope3);

      targetScope1Xcordinate.push(targetX1);
      targetScope2Xcordinate.push(targetX2);
      targetScope3Xcordinate.push(targetX3);
      targetYcordinate.push(indexYear);

      var newPercentage = Number(percentage) / Number(target_year - base_year);
      while (indexYear < Number(target_year)) {
        targetX1 -= (newPercentage * targetX1) / 100;
        targetX2 -= (newPercentage * targetX2) / 100;
        targetX3 -= (newPercentage * targetX3) / 100;
        targetScope1Xcordinate.push(Math.round(targetX1));
        targetScope2Xcordinate.push(Math.round(targetX2));
        targetScope3Xcordinate.push(Math.round(targetX3));
        indexYear += 1;
        targetYcordinate.push(indexYear);
      }
      const getRevenueDetails = await getRevnueFactor(user_id);
      var factor1 =
        getRevenueDetails[0].factor1 === undefined
          ? 1
          : Number(getRevenueDetails[0].factor1);
      var factor2 =
        getRevenueDetails[0].factor2 === undefined
          ? 1
          : Number(getRevenueDetails[0].factor2);
      var factor3 =
        getRevenueDetails[0].factor3 === undefined
          ? 1
          : Number(getRevenueDetails[0].factor3);
      indexYear = Number(currentYear);
      var lastPoint1 = Number(scope1Xcordinate[scope1Xcordinate.length - 1]);
      var lastPoint2 = Number(scope2Xcordinate[scope1Xcordinate.length - 1]);
      var lastPoint3 = Number(scope3Xcordinate[scope1Xcordinate.length - 1]);

      while (indexYear <= Number(target_year)) {
        forecastScope1Xcordinate.push(Math.round(lastPoint1));
        forecastScope2Xcordinate.push(Math.round(lastPoint2));
        forecastScope3Xcordinate.push(Math.round(lastPoint3));
        forecastYcordinate.push(indexYear);
        var differenceInYear = Number(target_year) - Number(indexYear);
        differenceInYear = differenceInYear % 5;
        if (differenceInYear <= 5) {
          lastPoint1 = lastPoint1 + (factor1 * lastPoint1) / 100;
          lastPoint2 = lastPoint2 + (factor1 * lastPoint2) / 100;
          lastPoint3 = lastPoint3 + (factor1 * lastPoint3) / 100;
        } else if (differenceInYear > 5 && differenceInYear <= 10) {
          lastPoint1 = lastPoint1 + (factor2 * lastPoint1) / 100;
          lastPoint2 = lastPoint2 + (factor2 * lastPoint2) / 100;
          lastPoint3 = lastPoint3 + (factor3 * lastPoint3) / 100;
        } else if (differenceInYear > 10) {
          lastPoint1 = lastPoint1 + (factor3 * lastPoint1) / 100;
          lastPoint2 = lastPoint2 + (factor3 * lastPoint2) / 100;
          lastPoint3 = lastPoint3 + (factor3 * lastPoint3) / 100;
        }
        indexYear += 1;
      }
      return res.status(200).json({
        success: true,
        status: 200,
        message: "Inventory Fetched Succesfully",
        scope1Xcordinate: scope1Xcordinate,
        scope2Xcordinate: scope2Xcordinate,
        scope3Xcordinate: scope3Xcordinate,
        yCordinate: yCordinate,
        targetScope1Xcordinate: targetScope1Xcordinate,
        targetScope2Xcordinate: targetScope2Xcordinate,
        targetScope3Xcordinate: targetScope3Xcordinate,
        targetYcordinate: targetYcordinate,
        forecastScope1Xcordinate: forecastScope1Xcordinate,
        forecastScope2Xcordinate: forecastScope2Xcordinate,
        forecastScope3Xcordinate: forecastScope3Xcordinate,
        forecastYcordinate: forecastYcordinate,
      });
    } else {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "No Data Found",
      });
    }
  } catch (error) {
    return handleServerError(res, error);
  }
};

exports.updateEmissionInventoryID = async (req, res) => {
  try {
    const {
      scope_items,
      relation_id,
      scope1_emission,
      scope2_emission,
      scope3_emission,
      production_output,
      economic_output,
      group_added,
    } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        scope_items: Joi.string().empty().required(),
        relation_id: Joi.string().empty().required(),
        scope1_emission: Joi.number().empty().required(),
        scope2_emission: Joi.number().empty().required(),
        scope3_emission: Joi.number().empty().required(),
        production_output: Joi.number().empty().required(),
        economic_output: Joi.number().empty().required(),
        group_added: Joi.string().empty().required(),
      })
    );
    const validationResult = schema.validate(req.body);
    if (validationResult.error) {
      const message = validationResult.error.details
        .map((i) => i.message)
        .join(",");
      return res.status(200).json({
        success: false,
        status: 400,
        message: message,
        error: "Validation error",
      });
    }
    var itemJson = JSON.parse(scope_items);
    if (itemJson.length > 0) {
      for (element of itemJson) {
        var id = element.id;
        var emission = element.emission;
        const result = await updateInvetoryRelationByID(id, emission);
      }
    }
    var physical_intensity1 = 0;
    var physical_intensity2 = 0;
    var physical_intensity3 = 0;
    if (Number(production_output)) {
      physical_intensity1 = Number(scope1_emission) / Number(production_output);
      physical_intensity2 = Number(scope2_emission) / Number(production_output);
      physical_intensity3 = Number(scope3_emission) / Number(production_output);
    } else if (Number(economic_output)) {
      physical_intensity1 = Number(scope1_emission) / Number(economic_output);
      physical_intensity2 = Number(scope2_emission) / Number(economic_output);
      physical_intensity3 = Number(scope3_emission) / Number(economic_output);
    }
    const inventoryDetails = await updateEmissionIventory(
      relation_id,
      scope1_emission,
      scope2_emission,
      scope3_emission,
      physical_intensity1,
      physical_intensity2,
      physical_intensity3,
      group_added,
      production_output,
      economic_output
    );

    if (inventoryDetails.affectedRows > 0) {
      return res.status(200).json({
        success: true,
        status: 200,
        message: "Targets  added successfully!",
        inventoryDetails: inventoryDetails,
      });
    } else {
      return res.status(200).json({
        success: false,
        status: 400,
        message: "Error Adding Emission Inventory. Please try again later.",
      });
    }
  } catch (error) {
    return handleServerError(res, error);
  }
};

exports.updateTargetSetting = async (req, res) => {
  try {
    const {
      base_year,
      emission_activity,
      id,
      other_target_kpi,
      other_target_kpichange,
      target_emission_change,
      target_name,
      target_type,
      target_year,
    } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        target_name: Joi.string().empty().required(),
        emission_activity: Joi.string().empty().required(),
        target_type: Joi.string().empty().required(),
        other_target_kpi: Joi.string().empty().required(),
        base_year: Joi.string().empty().required(),
        target_year: Joi.string().empty().required(),
        target_emission_change: Joi.number().empty().required(),
        other_target_kpichange: Joi.number().empty().required(),
        id: [Joi.string().empty().required()],
      })
    );
    const validationResult = schema.validate(req.body);
    if (validationResult.error) {
      const message = validationResult.error.details
        .map((i) => i.message)
        .join(",");
      return res.status(200).json({
        success: false,
        status: 400,
        message: message,
        error: "Validation error",
      });
    }   
  
    const inventoryDetails = await updateTargetSettingById(
      target_name,
      emission_activity,
      target_type,
      other_target_kpi,
      base_year,
      target_year,
      target_emission_change,
      other_target_kpichange,
      id,
    );

    if (inventoryDetails.affectedRows > 0) {
      return res.status(200).json({
        success: true,
        status: 200,
        message: "Targets  added successfully!",
        inventoryDetails: inventoryDetails,
      });
    } else {
      return res.status(200).json({
        success: false,
        status: 400,
        message: "Error Adding Emission Inventory. Please try again later.",
      });
    }
  } catch (error) {
    return handleServerError(res, error);
  }
};

exports.insertRevenueFactors = async (req, res) => {
  try {
    const { factor1, factor2, factor3 } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        factor1: Joi.number().empty(),
        factor2: Joi.number().empty(),
        factor3: Joi.number().empty(),
      })
    );
    const validationResult = schema.validate(req.body);
    if (validationResult.error) {
      const message = validationResult.error.details
        .map((i) => i.message)
        .join(",");
      return res.status(200).json({
        success: false,
        status: 400,
        message: message,
        error: "Validation error",
      });
    }
    const user_id = req.user.user_id;

    const factorDetail = {
      factor1: factor1,
      group_id: user_id,
      factor2: factor2,
      factor3: factor3,
    };

    const factorDetails = await insertRevenueFactors(factorDetail);

    if (factorDetails.affectedRows > 0) {
      return res.status(200).json({
        success: true,
        status: 200,
        message: "Revenue Factor added successfully!",
        noOfRowsAdded: factorDetails.insertId,
      });
    } else {
      return res.status(200).json({
        success: false,
        status: 400,
        message: "Error Add supply chains. Please try again later.",
      });
    }
  } catch (error) {
    return handleServerError(res, error);
  }
};

exports.getRevenueFactors = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const getDetails = await getRevenueFactorsByUserID(user_id);
    if (getDetails.length > 0) {
      return res.status(200).json({
        success: true,
        status: 200,
        message: "Inventory Fetched Succesfully",
        orders: getDetails,
      });
    } else {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "No Data Found",
      });
    }
  } catch (error) {
    return handleServerError(res, error);
  }
};

const handleServerError = (res, error) => {
  return res.status(500).json({
    success: false,
    message: "An internal server error occurred. Please try again later.",
    status: 500,
    error: error.message,
  });
};

exports.addCarbonOffsetting = async (req, res) => {
  try {
    const { project_name, project_type, vintage_year, carbon_credit_value, scope1, scope2, scope3, comments, attachment, standard } = req.body;
    const schema = Joi.alternatives(
      Joi.object({
        project_name: Joi.string().empty().required(),
        project_type: Joi.string().empty().required(),
        vintage_year: Joi.number().empty().required(),
        carbon_credit_value: Joi.number().empty().required(),
        scope1: Joi.number().empty().required(),
        scope2: Joi.number().empty().required(),
        scope3: Joi.number().empty().required(),
        standard: Joi.string().empty().required(),
        comments: Joi.string().allow(null).optional().allow(""),
        attachment: Joi.string().allow(null).optional().allow("")
      })
    );
    const validationResult = schema.validate(req.body);
    if (validationResult.error) {
      const message = validationResult.error.details
        .map((i) => i.message)
        .join(",");
      return res.status(200).json({
        success: false,
        status: 400,
        message: message,
        error: "Validation error",
      });
    }
 
    const user_id = req.user.user_id;

    const offsetDetail = {
      project_name: project_name,
      project_type: project_type,
      vintage_year: vintage_year,
      carbon_credit_value: carbon_credit_value,
      scope1 : scope1,
      scope2 : scope2,
      scope3 : scope3,
      comments : comments,
      attachment : attachment,
      user_id : user_id,
      standard : standard
    };

    const insertDetails = await insertCarbonOffset(offsetDetail);

    if (insertDetails.affectedRows > 0) {
      return res.status(200).json({
        success: true,
        status: 200,
        message: "Carbon Offset added successfully!",
        id: insertDetails.insertId,
      });
    } else {
      return res.status(200).json({
        success: false,
        status: 400,
        message: "Error adding Carbon Offset.",
      });
    }
  } catch (error) {
    return handleServerError(res, error);
  }
};