const express = require("express");
const router = express.Router();
const { validationResult } = require("express-validator");

// Middleware per controllare i risultati della validazione
const validate = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	next();
};

// Define secure routes that require authentication
router.get("/secure-route", validate, (req, res) => {
	if (!req.user) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	res.json({ message: "Secure action successful", user: req.user });
});

module.exports = router;
