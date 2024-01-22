const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");

router.post("/create", messageController.createMessage);
router.get("/squeals/:username", messageController.getAllSqueals);
router.get("/sentSqueals/:username", messageController.getPublicMessagesByUser);
router.get("/replies/:messageId", messageController.getRepliesToMessage);
router.get("/privateMessages/:username", messageController.getPrivateMessages);
router.post("/reply", messageController.reply);
router.post("/squeals/reaction/:messageId", messageController.addReaction);
router.post("/squeals/edit/:messageId", messageController.updateMessage);
router.post("/position/:messageId", messageController.updatePosition);
router.post(
	"/squeals/updateChannels/:messageId",
	messageController.updateMessageChannels
);
router.get("/message/:id", messageController.getMessageById);
router.post(
	"/message/incrementImpressions/:messageId",
	messageController.incrementImpressions
);
router.get(
	"/squeals/hashtag/:username/:hashtag",
	messageController.getMessageByHashtag
);
router.get(
	"/privateMessages/hashtag/:username/:hashtag",
	messageController.getPrivateMessByHashtag
);
router.post("/messages/acknowledgeBeep/:id", messageController.acknowledgeBeep);

router.get(
	"/squeals/targetUsername/:username/:targetUsername",
	messageController.getMessageByUser
);
router.get(
	"/privateMessages/targetUsername/:username/:targetUsername",
	messageController.getPrivateMessByUser
);
router.get(
	"/squeals/channel/:username/:channel",
	messageController.getMessageByChannel
);
router.get(
	"/privateMessages/channel/:username/:channel",
	messageController.getPrivateMessByChannel
);
router.get("/squeals/text/:username/:text", messageController.getMessageByText);
router.get(
	"/privateMessages/text/:username/:text",
	messageController.getPrivateMessByText
);
router.get("/allMessages", messageController.getAllMessages);

module.exports = router;
