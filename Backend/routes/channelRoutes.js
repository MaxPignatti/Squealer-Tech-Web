const express = require('express');
const router = express.Router();
const channelController = require('../controllers/channelController');

router.post("/channels", channelController.createChannel);
router.get("/channels/created", channelController.yourChannels);
router.delete('/channels/delete/:channelId', channelController.deleteChannel);
  
module.exports = router;