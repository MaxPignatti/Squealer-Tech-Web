const express = require("express");
const router = express.Router();
const shopController = require("../controllers/shopController");

router.post("/purchase", shopController.purchaseRemChar);

module.exports = router;
