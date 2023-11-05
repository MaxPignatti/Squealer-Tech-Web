const express = require('express');
const router = express.Router();
const channelController = require('../controllers/channelController');
const channel = require('../models/channel');

router.post("/channels", channelController.createChannel);
router.get("/channels/created", channelController.yourChannels);
router.delete('/channels/delete/:channelId', channelController.deleteChannel);
router.get('/channels/subscribed/:username', channelController.getSubscribedChannels);
router.post('/channels/unsubscribe/:id', channelController.unsubscribe);

module.exports = router;