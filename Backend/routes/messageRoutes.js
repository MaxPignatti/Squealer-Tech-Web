const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

router.post('/create', messageController.createMessage);
router.get('/squeels/:username', messageController.getAllSqueels);
router.get('/privateMessages/:username', messageController.getPrivateMessages);
router.post('/reply', messageController.reply);
router.post('/squeels/reaction/:messageId', messageController.addReaction);
router.post('/Squeels/edit/:messageId', messageController.updateMessage);
router.post('/position/:messageId', messageController.updatePosition);
router.get('/message/:id', messageController.getMessageById);

module.exports = router;