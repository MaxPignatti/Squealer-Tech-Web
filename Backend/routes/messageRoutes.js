const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");

router.post("/create", messageController.createMessage);
router.get("/squeels/:username", messageController.getAllSqueels);
router.get("/privateMessages/:username", messageController.getPrivateMessages);
router.post("/reply", messageController.reply);
router.post("/squeels/reaction/:messageId", messageController.addReaction);
router.post("/Squeels/edit/:messageId", messageController.updateMessage);
router.post("/position/:messageId", messageController.updatePosition);
router.get("/message/:id", messageController.getMessageById);
router.post(
  "/message/incrementImpressions/:messageId",
  messageController.incrementImpressions
);
router.get(
  "/squeels/:username/:hashtag",
  messageController.getMessageByHashtag
);
router.get(
  "/privateMessages/:username/:hashtag",
  messageController.getPrivateMessByHashtag
);
router.post("/messages/acknowledgeBeep/:id", messageController.acknowledgeBeep);

module.exports = router;
