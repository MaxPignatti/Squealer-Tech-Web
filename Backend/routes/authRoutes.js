const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/loginSMM', authController.loginSMM);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.login);
router.post('/protectedEndpoint', authController.protectedEndpoint);
router.get('/verifyTokenSMM', authController.verifyTokenSMM);
module.exports = router;
