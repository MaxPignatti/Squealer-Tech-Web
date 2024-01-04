const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Define authentication routes (e.g., /register, /login)
router.post('/register', authController.register);
router.post('/registerSMM', authController.registerSMM);
router.post('/login', authController.login);
router.post('/logout', authController.login);
router.post('/protectedEndpoint', authController.protectedEndpoint);
module.exports = router;
