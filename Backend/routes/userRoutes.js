const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Define user-related routes
router.get("/usr/email/:email", userController.getUserByEmail);
router.route("/usr/:username");
router.post(userController.updateUserProfile);
router.get(userController.getUser);
router.post("/usr/:username/password", userController.updateUserPassword);
router.get("/usr", userController.getAllUsers);
//router.get("/getSMM/:username", userController.getSMM);
module.exports = router;
