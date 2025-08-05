const express = require("express");
const treeController = require("../controller/treeController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/allTreedata", auth, treeController.allTreedata);

router.post("/addMainTree", auth, treeController.addMainTree);

router.post("/addRoot", auth, treeController.addRoot);

router.post("/addChildInTree", auth, treeController.addChildInTree);

router.post("/getNodedeailById", auth, treeController.getNodedeailById);

router.get("/getTreeMembers/:family_id", auth, treeController.getFamilyMembers);

router.post("/deleteNode", auth, treeController.deleteNode);

router.post("/deleteTree", auth, treeController.deleteTree);

router.post("/UpdateChildInTree", auth, treeController.UpdateChildInTree);

router.get("/getAllFamilyMembers/", auth, treeController.getAllFamilyMembers);
// /
module.exports = router;