const express = require("express");
const router = express.Router();
const shopController = require("../controllers/shopController");
const { body, validationResult } = require("express-validator");

// Middleware per controllare i risultati della validazione
const validate = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	next();
};

router.patch(
	"/purchase",
	[body("username").isString().trim().escape(), body("quantity").isNumeric()],
	validate,
	shopController.purchaseRemChar
);

module.exports = router;
