const express = require('express');
const router = express.Router();
const channelController = require('../controllers/channelController');
const channel = require('../models/channel');

router.post("/channels", channelController.createChannel);
router.get("/channels/created", channelController.yourChannels);
router.delete('/channels/delete/:channelId', channelController.deleteChannel);
router.get('/channels/subscribed/:username', channelController.getSubscribedChannels);
router.post('/channels/unsubscribe/:id', channelController.unsubscribe);
router.get("/channels/all/:username", channelController.getAllChannels);
router.post("/channels/subscribe/:channelId", channelController.subscribe);
router.post("/channels/removeMember/:channelId", channelController.removeMember);

module.exports = router;