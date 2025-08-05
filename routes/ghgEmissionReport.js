const express = require("express");
const auth = require("../middleware/auth");

const ghgEmissionReportController = require("../controller/ghgEmissionReportController");
const router = express.Router();

router.post("/GhgScopewiseEmssion", auth, ghgEmissionReportController.GhgScopewiseEmssion);
router.post('/GhgdashboardWasteTotal', auth, ghgEmissionReportController.GhgdashboardWasteTotal);
router.post("/top-combustion-emissions", auth, ghgEmissionReportController.getTopCombustionEmission);
router.post("/ghgScope1Emissions", auth, ghgEmissionReportController.fetchScope1EmissionData);
router.post('/fetchScope2Comission', auth, ghgEmissionReportController.fetchScope2Comission);
router.post('/purchaseGoodAndService', auth, ghgEmissionReportController.purchaseGoodAndService);
router.post("/Scope3WiseEmssionOnly", auth, ghgEmissionReportController.Scope3WiseEmssionOnly);
router.post("/ghgWasteEmission", auth, ghgEmissionReportController.getGhgWasteEmissionData);
router.post("/ghgBussinessTravelServices", auth, ghgEmissionReportController.ghgBussinessTravelServices);
router.post("/ghgEmployeeCommute", auth, ghgEmissionReportController.ghgEmployeeCommute);
router.post("/ghgEnergyConsumptionWellTank", auth, ghgEmissionReportController.ghgEnergyConsumptionWellTank);
router.post("/ghgEnergyConsumptionMonth", auth, ghgEmissionReportController.ghgEnergyConsumptionMonth);
router.post("/ghgEnergyConsumption", auth, ghgEmissionReportController.ghgEnergyConsumption);
router.post("/ghgTopEmissionGenerating", auth, ghgEmissionReportController.ghgTopEmissionGenerating);
router.post("/GhgScopewiseEmssionYearRangeWise", auth, ghgEmissionReportController.GhgScopewiseEmssionYearRangeWise);
router.post("/GhgEmssionYearRangeWise", auth, ghgEmissionReportController.GhgEmssionYearRangeWise);
router.post("/GhgEmssionPerNumberOfEmployee", auth, ghgEmissionReportController.GhgEmssionPerNumberOfEmployee);
router.post("/GhgEmissionFileByFacilityIdAndCatgory", auth, ghgEmissionReportController.GhgEmissionFileByFacilityIdAndCatgory);
router.get("/GhgSubcategoryTypes", auth, ghgEmissionReportController.GhgSubcategoryTypes);
router.get("/GhgSubcategoryTypesByCategoryId", auth, ghgEmissionReportController.GhgSubcategoryTypesByCategoryId);

module.exports = router;