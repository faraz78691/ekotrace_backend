const express = require("express");
const scope1Controller = require("../controller/scope1Controller");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload_file");
const { route } = require("./scope2");
const router = express.Router();

router.get("/GetSubCategoryTypes/:id", auth, scope1Controller.GetSubCategoryTypes);
router.get("/Getfacilities", auth, scope1Controller.Getfacilities);
router.get("/GetScope", auth, scope1Controller.GetScope);
router.get("/GetAllcategoryByScope", auth, scope1Controller.GetAllcategoryByScope);
router.get("/getAssignedDataPointbyfacility/:facilityId", auth, scope1Controller.getAssignedDataPointbyfacility);
router.get("/GetUnits/:id", auth, scope1Controller.GetUnits);
router.get("/getBlendType", auth, scope1Controller.getBlendType);
router.get("/getmanageDataPointbyfacility/:facilityId/:ScopeID", auth, scope1Controller.getmanageDataPointbyfacility);
router.post("/AddassignedDataPointbyfacility", auth, scope1Controller.AddassignedDataPointbyfacility);
router.post("/AddstationarycombustionLiquid", auth, scope1Controller.AddstationarycombustionLiquid);
router.post("/Addrefrigerant", auth, upload.single('file'), scope1Controller.Addrefrigerant);
router.get("/Allrefrigerant", auth, scope1Controller.Allrefrigerant);
router.get("/getrefrigents/:SubCategorySeedID", auth, scope1Controller.getrefrigents);
router.get("/Getfireextinguisher", auth, scope1Controller.Getfireextinguisher);
router.post("/Addfireextinguisher", auth, upload.single('file'), scope1Controller.Addfireextinguisher);
router.get("/Getpassengervehicletypes", auth, scope1Controller.Getpassengervehicletypes);
router.get("/Getdeliveryvehicletypes", auth, scope1Controller.Getdeliveryvehicletypes);
router.post("/Addcompanyownedvehicles", auth, scope1Controller.Addcompanyownedvehicles);
router.post("/add-multiple-company-owned-vehicles", auth, upload.single('file'), scope1Controller.addMultipleCompanyOwnedVehicles);
router.post("/getAllcompanyownedvehicles", auth, scope1Controller.getAllcompanyownedvehicles);
router.get("/getAllcategoryByfacility/:id", auth, scope1Controller.getAllcategoryByfacility);
router.post("/electricitygridType", auth, scope1Controller.electricitygridType);
router.get('/getAttahcmentsbyFacilityID', auth, scope1Controller.getAttahcmentsbyFacilityID);

module.exports = router;











