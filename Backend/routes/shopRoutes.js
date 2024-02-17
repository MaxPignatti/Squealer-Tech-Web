const express = require("express");
const router = express.Router();
const shopController = require("../controllers/shopController");
const { body, validationResult } = require("express-validator");

router.patch("/purchase", shopController.purchaseRemChar);

module.exports = router;
