const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

router.post('/create', messageController.createMessage);
router.get('/squeels/:username', messageController.getAllSqueels);
router.post('/squeels/reaction/:messageId', messageController.addReaction);

module.exports = router;