const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Define user-related routes
router.get("/usr/:email", userController.getUserByEmail);
router.post("/usr/:username", userController.updateUserProfile);
router.post("/usr/:username/password", userController.updateUserPassword);
router.get("/usr", userController.getAllUsers);
module.exports = router;
