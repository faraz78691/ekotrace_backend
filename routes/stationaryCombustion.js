const express = require("express");
const stationaryCombController = require("../controller/stationaryCombController");
const auth = require("../middleware/auth");
const router = express.Router();
const upload = require("../middleware/upload_file")

router.get("/getSubCatSeedData", auth, stationaryCombController.getSubCatSeedData);
router.get("/getSubCategoryTypes", auth, stationaryCombController.getSubCategoryTypes);
router.post("/stationaryCombustionEmission", auth, upload.single('file'), stationaryCombController.stationaryCombustionEmission);
router.get("/getStationaryCombEmission", auth, stationaryCombController.getStationaryCombEmission);
router.post("/getStationaryCombEmissionByTypeId", auth, stationaryCombController.getStationaryCombEmissionByTypeId);

module.exports = router;