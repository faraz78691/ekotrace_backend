const express = require("express");
const purchasedgoodController = require("../controller/purchasedgoodController");

const upload_document = require("../middleware/upload_document");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload_file");

const router = express.Router();

router.post("/uploadTemplate", auth, upload_document.single("file"), purchasedgoodController.uploadTemplate);
router.post("/getCalcPurchaseGood", auth, purchasedgoodController.calculatePurchaseGood);
router.post("/downStreamTransportation", auth, purchasedgoodController.downStreamTransportation);
router.post("/upStreamTransportation", auth, purchasedgoodController.upStreamTransportation);
router.get("/getAllBatches", auth, purchasedgoodController.getAllBatches);
router.get("/vehicleCategories", auth, purchasedgoodController.vehicleCategories);
router.get("/vehicleSubCategories", auth, purchasedgoodController.vehicleSubCategories);
router.get("/franchiseCategories", auth, purchasedgoodController.franchiseCategories);
router.get("/franchiseSubCategories", auth, purchasedgoodController.franchiseSubCategories);
router.post("/franchiseEmissionCalculate", auth, purchasedgoodController.franchiseEmissionCalculate);
router.get("/getFranchiseEmission", auth, purchasedgoodController.getFranchiseEmission);
router.get("/getUpstreamEmissions", auth, purchasedgoodController.getUpstreamEmissions);
router.get("/getDownstreamEmissions", auth, purchasedgoodController.getDownstreamEmissions);
router.post("/getPurchaseGoodEmissions", auth, purchasedgoodController.getPurchaseGoodEmissions);
router.get("/getAllCategories", auth, purchasedgoodController.getAllCategories);
router.get("/getInvestmentSubCategory", auth, purchasedgoodController.getInvestmentSubCategory);
router.post("/calculateInvestmentEmission", auth, purchasedgoodController.calculateInvestmentEmission);
router.get("/getInvestmentEmission", auth, purchasedgoodController.getInvestmentEmission);
router.post("/purchaseGoods", auth, upload.single('file'), purchasedgoodController.purchaseGoods);
router.post("/bulk-purchase-goods-upload", auth, upload.single('file'), purchasedgoodController.bulkPurchaseGoodsUpload);
router.get("/getpurchaseproduct_code", auth, purchasedgoodController.getpurchaseproduct_code);
router.get("/getTypesofpurchase/:product_code_id", auth, purchasedgoodController.getTypesofpurchase);
router.post("/purchaseGoodsAllcategories", auth, purchasedgoodController.purchaseGoodsAllcategories);
router.post("/getpruchaseProductCode", auth, purchasedgoodController.getpruchaseProductCode);

module.exports = router;