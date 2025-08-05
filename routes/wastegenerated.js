
const express = require("express");
const wasteGeneratedController = require("../controller/wasteGeneratedController");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/wasteGeneratedEmission", auth, wasteGeneratedController.wasteGeneratedEmission);
router.get("/getwasteGeneratedEmission", auth, wasteGeneratedController.getwasteGeneratedEmission);
router.post("/getDataProgress", auth, wasteGeneratedController.getDataProgress);
router.post("/getDataProgressForFacilities", auth, wasteGeneratedController.getDataProgressForFacilities);

module.exports = router;