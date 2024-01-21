const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Define user-related routes
router.get("/usr/email/:email", userController.getUserByEmail);
router
	.route("/usr/:username")
	.post(userController.updateUserProfile)
	.get(userController.getUser);
router.post("/usr/:username/password", userController.updateUserPassword);
router.get("/usr", userController.getAllUsers);
router.post("/api/updateUserChars", userController.updateUserChars);
router.delete("/api/deleteUser/:username", userController.deleteUser);
router.post("/api/toggleBlockUser/:username", userController.toggleBlockUser);
router.post("/api/toggleModUser/:username", userController.toggleModUser);

//router.get("/getSMM/:username", userController.getSMM);
module.exports = router;
