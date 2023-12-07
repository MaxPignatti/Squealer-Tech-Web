const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

router.post('/create', messageController.createMessage);
router.get('/squeels/:username', messageController.getAllSqueels);
router.post('/squeels/reaction/:messageId', messageController.addReaction);
router.post('/create/private', messageController.privateMessage)
router.post('/Squeels/edit/:messageId', messageController.updateMessage);

module.exports = router;