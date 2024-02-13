const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { body, validationResult } = require('express-validator');

router.post('/messages', messageController.createMessage);

router.get(
	'/messages/public/:username',
	messageController.getPublicMessagesByUser
);
router.get(
	'/messages/:messageId/replies',
	messageController.getRepliesToMessage
);

router.post('/messages/:messageId/replies', messageController.replyToMessage);

router.delete('/messages/:id', messageController.deleteMessage);
router.post(
	'/messages/:messageId/reactions',
	messageController.addReactionToMessage
);
router.patch('/messages/:messageId', messageController.updateMessage);
router.patch(
	'/messages/:messageId/position',
	messageController.updateLivePosition
);
router.patch(
	'/messages/:messageId/reactions',
	messageController.updateReactions
);
router.patch(
	'/messages/:messageId/channels',
	messageController.updateMessageChannels
);
router.get('/message/:id', messageController.getMessageById);

router.patch(
	'/messages/:messageId/impressions',
	messageController.incrementImpressions
);

router.get(
	'/squeals/:username/hashtag/:hashtag',
	messageController.getMessageByHashtag
);
router.get(
	'/privateMessages/:username/hashtag/:hashtag',
	messageController.getPrivateMessByHashtag
);
router.patch('/messages/:id/acknowledge', messageController.acknowledgeMessage);
router.get('/privateMessages/:username', messageController.getPrivateMessages);

router.get(
	'/squeals/:username/targetUsername/:targetUsername',
	messageController.getMessageByUser
);
router.get(
	'/privateMessages/:username/targetUsername/:targetUsername',
	messageController.getPrivateMessByUser
);
router.get(
	'/squeals/:username/channel/:channel',
	messageController.getMessageByChannel
);
router.get(
	'/privateMessages/:username/channel/:channel',
	messageController.getPrivateMessByChannel
);
router.get('/squeals/:username/text/:text', messageController.getMessageByText);
router.get(
	'/privateMessages/:username/text/:text',
	messageController.getPrivateMessByText
);
router.get('/allMessages', messageController.getAllMessages);

module.exports = router;
