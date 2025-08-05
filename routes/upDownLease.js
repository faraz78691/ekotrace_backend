const express = require("express");
const upDownLeaseController = require("../controller/upDownLeaseController");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/upLeaseEmissionCalculate", auth, upDownLeaseController.upLeaseEmissionCalculate);
router.get("/getUpstreamLeaseEmission", auth, upDownLeaseController.getUpstreamLeaseEmission);
router.post("/downLeaseEmissionCalculate", auth, upDownLeaseController.downLeaseEmissionCalculate);
router.get("/getDownstreamLeaseEmission", auth, upDownLeaseController.getDownstreamLeaseEmission);

module.exports = router;