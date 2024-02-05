const express = require("express");
const router = express.Router();

// Define secure routes that require authentication
router.get("/secure-route", (req, res) => {
	if (!req.user) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	// The user is authenticated, proceed with the secure action
	res.json({ message: "Secure action successful", user: req.user });
});

module.exports = router;
