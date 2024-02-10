const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const { body, validationResult } = require("express-validator");

router.post("/create", messageController.createMessage);
router.get("/squeals/:username", messageController.getAllSqueals);
router.get("/sentSqueals/:username", messageController.getPublicMessagesByUser);
router.get("/replies/:messageId", messageController.getRepliesToMessage);
router.get("/privateMessages/:username", messageController.getPrivateMessages);
router.post("/reply", messageController.reply);
router.delete("/squeals/delete/:id", messageController.deleteMessage);
router.post("/squeals/reaction/:messageId", messageController.addReaction);
router.post("/squeals/edit/:messageId", messageController.updateMessage);
router.post("/position/:messageId", messageController.updatePosition);
router.post(
	"/squeals/updateReactions/:messageId",
	messageController.updateReactions
);
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
	"/squeals/:username/hashtag/:hashtag",
	messageController.getMessageByHashtag
);
router.get(
	"/privateMessages/:username/hashtag/:hashtag",
	messageController.getPrivateMessByHashtag
);
router.post("/messages/acknowledgeBeep/:id", messageController.acknowledgeBeep);

router.get(
	"/squeals/:username/targetUsername/:targetUsername",
	messageController.getMessageByUser
);
router.get(
	"/privateMessages/:username/targetUsername/:targetUsername",
	messageController.getPrivateMessByUser
);
router.get(
	"/squeals/:username/channel/:channel",
	messageController.getMessageByChannel
);
router.get(
	"/privateMessages/:username/channel/:channel",
	messageController.getPrivateMessByChannel
);
router.get("/squeals/:username/text/:text", messageController.getMessageByText);
router.get(
	"/privateMessages/:username/text/:text",
	messageController.getPrivateMessByText
);
router.get("/allMessages", messageController.getAllMessages);

module.exports = router;

