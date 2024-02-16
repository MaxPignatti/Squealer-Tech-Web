const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { body, validationResult } = require('express-validator');

// Define user-related routes
router.get('/usr/email/:email', userController.getUserByEmail);
router
	.route('/usr/:username')
	.patch(userController.updateUserProfile)
	.get(userController.getUser);
router.patch('/usr/:username/password', userController.updateUserPassword);
router.get('/usr', userController.getAllUsers);
router.patch('/usr/:username/chars', userController.updateUserChars);
router.delete('/api/deleteUser/:username', userController.deleteUser);
router.patch('/usr/:username/block', userController.toggleBlockUser);
router.patch('/usr/:username/mod', userController.toggleModUser);
router.patch('/usr/:username/proStatus', userController.handleProAction);
router.patch('/usr/:username/proAcceptance', userController.proAcceptance);

module.exports = router;
