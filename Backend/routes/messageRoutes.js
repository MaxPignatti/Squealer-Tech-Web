const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");

router.post("/create", messageController.createMessage);
router.get("/squeals/:username", messageController.getAllSqueals);
router.get("/privateMessages/:username", messageController.getPrivateMessages);
router.post("/reply", messageController.reply);
router.post("/squeals/reaction/:messageId", messageController.addReaction);
router.post("/squeals/edit/:messageId", messageController.updateMessage);
router.post("/position/:messageId", messageController.updatePosition);
router.get("/message/:id", messageController.getMessageById);
router.post(
  "/message/incrementImpressions/:messageId",
  messageController.incrementImpressions
);
router.get(
  "/squeals/:username/:hashtag",
  messageController.getMessageByHashtag
);
router.get(
  "/privateMessages/:username/:hashtag",
  messageController.getPrivateMessByHashtag
);
router.post("/messages/acknowledgeBeep/:id", messageController.acknowledgeBeep);

module.exports = router;
