const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

router.post('/create', messageController.createMessage);
router.get('/squeels/:username', messageController.getAllSqueels);

module.exports = router;