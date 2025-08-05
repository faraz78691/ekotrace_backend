const express = require("express");
const userController = require("../controller/userController");
const auth = require("../middleware/auth");
const upload = require('../middleware/upload_logo');
const upload_document = require('../middleware/upload_document');
const router = express.Router();

router.post("/login", userController.login);

router.post("/GetpendingDataEnteries", auth, userController.GetpendingDataEnteries);

router.get("/getFacilityByTenantId/:tenantID", auth, userController.GetFacilityGroups);

router.post("/UpdateelecEntry", auth, userController.UpdateelecEntry);

router.post("/UpdateelecEntryReject", auth, userController.UpdateelecEntryReject);

router.post("/Addgroup", auth, userController.Addgroup);

router.post("/Updategroupmapping", auth, userController.Updategroupmapping);

router.post("/removeGroup", auth, userController.removeGroup);

router.post("/getGroups", auth, userController.getGroups);

router.post("/Addfacilities", auth, userController.Addfacilities);

router.get("/allfacilitiesbyRole/:tenant_id", auth, userController.allfacilitiesbyRole);

router.post("/allfacilitiesbyId", auth, userController.allfacilitiesbyId);

router.post("/Updatefacilities", auth, userController.Updatefacilities);

router.get("/getAllroles", auth, userController.getAllroles);

router.post("/register", auth, userController.register);

router.post("/getAllusers", auth, userController.getAllusers);

router.post("/Updateregister", auth, userController.Updateregister);
//
router.get("/getcountries", auth, userController.getcountries);

router.post("/getstateByCountries", auth, userController.getstateByCountries);

router.post("/getcityBystate", auth, userController.getcityBystate);

router.post("/removeUser", auth, userController.removeUser);

router.get("/getpackages", auth, userController.getpackages);

router.post("/addpackage", auth, userController.addpackage);

router.get("/getpackagesByusers", auth, userController.getpackagesByusers);

router.get("/GetcategoryByScope", auth, userController.GetcategoryByScope);

router.post("/Adduser_offseting", auth, upload_document.single('file'), userController.Adduser_offseting);

router.post("/getuser_offseting", auth, userController.getuser_offseting);

router.post("/getComapnyDetail", auth, userController.getComapnyDetail);

router.post("/AddComapnyDetail", auth, upload.single('file'), userController.AddComapnyDetail)

router.post("/packageById", auth, userController.packageById)

router.get("/getComapnyCategory", auth, userController.getComapnyCategory)

router.post("/getComapnySubCategory", auth, userController.getComapnySubCategory)

router.post("/AddVendor", auth, userController.AddVendor)
router.get("/getVendorlist/:tenant_id", auth, userController.getVendorlist)
router.post("/updateVendor", auth, userController.updateVendor)
router.post("/deleteVendor", auth, userController.deleteVendor)
router.post("/GetpendingDataEnteriesFuelType", auth, userController.GetpendingDataEnteriesFuelType)

//////////////////////////////////////////////////////////////////////////////////////////////////////

router.post("/updateuser_offseting", auth, upload_document.single('file'), userController.updateuser_offseting);

router.post("/deleteuser_offseting", auth, userController.deleteuser_offseting);

router.post("/addHazardous_nonhazardous", auth, userController.addHazardous_nonhazardous);

router.post("/getHazardous_nonhazardouslist", auth, userController.getHazardous_nonhazardouslist);

router.post("/deleteHazardous_nonhazardous", auth, userController.deleteHazardous_nonhazardous);

router.post("/updateHazardous_nonhazardous", auth, userController.updateHazardous_nonhazardous);

router.post("/AddCostcenter", auth, userController.AddCostcenter);

router.post("/updatecostCenter", auth, userController.updatecostCenter);

router.post("/deletecostCenter", auth, userController.deletecostCenter);

router.get("/getcostCenter/:tenant_id", auth, userController.getcostCenter);

router.post("/Addfinancial_year", auth, userController.Addfinancial_year);

router.post("/updatefinancial_year", auth, userController.updatefinancial_year);

router.post("/deletefinancial_year", auth, userController.deletefinancial_year);

router.post("/getfinancial_year", auth, userController.getfinancial_year);
router.post("/updateActions", auth, userController.updateActions);

router.get("/getSuperadmin", auth, userController.getSuperadmin);

router.post("/addpackageBySuperadmin", auth, userController.addpackageBySuperadmin);

router.post("/getSubGroups", auth, userController.getSubGroups);

router.post("/Updatecountry", auth, userController.Updatecountry);

router.post("/AddSuperAdmin", auth, userController.AddSuperAdmin);


// forgot password routes 
router.post('/forget-password', userController.forgetPassword);
router.get('/verify-token/:token/', userController.verifyToken);
router.post('/update-password', userController.updatePassword);

// Abhishek Lodhi
router.get('/get-excelsheet', auth, userController.getExcelSheet);
router.post('/get-purchase-categories-ef', auth, userController.getPurchaseCategoriesEf);
router.post('/get-all-purchase-categories-ef', auth, userController.getAllPurchaseCategoriesEf);
router.post('/add-vehicle-feet', auth, userController.addVehicleFeet);
router.post('/update-vehicle-feet', auth, userController.updateVehicleFeet);
router.post('/update-vehicle-feet-by-id', auth, userController.updateVehicleFeetById);
router.post('/get-vehicle-fleet-by-facility-id', auth, userController.getVehicleFleetByFacilityId);
router.get('/download-excel-vehicle-fleet-by-facility-id', auth, userController.downloadExcelVehicleFleetByFacilityId);
router.get('/download-excel-vehicle-fleet-by-facility-category-id', auth, userController.downloadExcelVehicleFleetByFacilityCategoryId);
router.post('/add-purchase-goods-match-unmatch-data', auth, userController.addPurchaseGoodsMatchUnmatch);
router.post('/get-purchase-good-data-using-user-facilityId', auth, userController.getPurchaseGoodsByUserAndFacilityId);
router.post('/get-purchase-good-matched-data-using-payload-id', auth, userController.getPurchaseGoodsMatchedDataUsingPayloadId);
router.post('/deleteAllEntry', auth, userController.deleteAllEntry);
router.post('/rejectAllEntry', auth, userController.rejectAllEntry);


module.exports = router;