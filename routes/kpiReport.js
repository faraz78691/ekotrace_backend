const express = require("express");
const auth = require("../middleware/auth");

const kpiReportController = require("../controller/kpiReportController");
const router = express.Router();

router.post("/kpiInventory", auth, kpiReportController.kpiInventory);
router.get("/kpiItemsList", auth, kpiReportController.kpiItemsList);
router.post("/kpiInventoryFuelConsumption", auth, kpiReportController.kpiInventoryFuelConsumption);
router.post("/getKpiInventoryStationaryCombustionde", auth, kpiReportController.getKpiInventoryStationaryCombustionde);
router.post("/kpiInventoryEnergyUse", auth, kpiReportController.kpiInventoryEnergyUse);
router.post("/kpiInventoryPassengerVehicleEmission", auth, kpiReportController.kpiInventoryPassengerVehicleEmission);
router.post("/kpiInventoryTransportVehicle", auth, kpiReportController.kpiInventoryTransportVehicle);
router.post("/kpiInventoryBusinessTravel", auth, kpiReportController.kpiInventoryBusinessTravel);
router.post("/kpiInventoryEmployeeCommute", auth, kpiReportController.kpiInventoryEmployeeCommute);
router.post("/kpiInventoryWasteGenerated", auth, kpiReportController.kpiInventoryWasteGenerated);
router.post("/kpiInventoryWaterUsage", auth, kpiReportController.kpiInventoryWaterUsage);
router.post("/kpiInventoryGeneralData", auth, kpiReportController.kpiInventoryGeneralData);
router.post("/addKpiTarget", auth, kpiReportController.addKpiTarget);
router.get("/getKpiTargetByUserId", auth, kpiReportController.getKpiTargetByUserId);
router.post("/addKpiInventory", auth, kpiReportController.addKpiInventory);
router.post("/getKpiInventoryByFacilityIdAndYear", auth, kpiReportController.getKpiInventoryByFacilityIdAndYear);
router.post("/getKpiInventoryByFacilityIdAndYearAndKpiId", auth, kpiReportController.getKpiInventoryByFacilityIdAndYearAndKpiId);
router.post("/getKpiInventoryDashboard", auth, kpiReportController.getKpiInventoryDashboard);
router.post("/getKpiInventoryEmissionIntensity", auth, kpiReportController.getKpiInventoryEmissionIntensity);

module.exports = router;