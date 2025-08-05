const express = require("express");
const targetSettingController = require("../controller/targetSettingController");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/getEmissionInventory", auth, targetSettingController.getEmissionInventory);
router.post("/addTargetSetting", auth, targetSettingController.addTargetSetting);
router.get("/getTargetSettingDetails/:tenant_id", auth, targetSettingController.getTargetSettingDetails);
router.post("/addActions", auth, targetSettingController.addActions);
router.get("/getActions/:tenant_id", auth, targetSettingController.getActions);
router.post("/addEmissionInventory", auth, targetSettingController.addEmissionInventory);
router.get("/getTargetEmissionInventory/:tenant_id", auth, targetSettingController.getTargetEmissionInventory);
router.post("/getEmissionPoints", auth, targetSettingController.getEmissionPoints);
router.post("/getTargetEmissionInventoryRelation", auth, targetSettingController.getTargetEmissionInventoryRelation);
router.post("/updateEmissionInventoryID", auth, targetSettingController.updateEmissionInventoryID);
router.post("/updateTargetSetting", auth, targetSettingController.updateTargetSetting);
router.post("/insertRevenueFactors", auth, targetSettingController.insertRevenueFactors);
router.get("/getRevenueFactors", auth, targetSettingController.getRevenueFactors);
router.post("/addCarbonOffsetting", auth, targetSettingController.addCarbonOffsetting);

module.exports = router;