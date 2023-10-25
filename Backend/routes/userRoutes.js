const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Define user-related routes
router.get('/usr/:userid', userController.getUserById);

module.exports = router;
