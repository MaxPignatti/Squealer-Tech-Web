const schedule = require('node-schedule');
const Message = require('../models/message');

const checkAndSendTempMessages = () => {
	schedule.scheduleJob('* * * * * *', async () => {
		try {
			const currentTime = new Date();
			const tempMessages = await Message.find({
				nextSendTime: { $lte: currentTime },
				maxSendCount: { $gt: 0 },
			});

			for (const message of tempMessages) {
				const newMessageData = {
					user: message.user,
					profileImage: message.profileImage,
					image: message.image,
					imageType: message.imageType,
					text: message.text,
					channel: message.channel,
					createdAt: currentTime.getTime(),
					loveReactions: message.loveReactions,
					sadReactions: message.sadReactions,
					likeReactions: message.likeReactions,
					dislikeReactions: message.dislikeReactions,
					updateInterval: message.updateInterval,
					maxSendCount: message.maxSendCount - 1,
					nextSendTime: new Date(
						currentTime.getTime() + message.updateInterval * 60000
					),
					location: message.location,
					beepRequested: true,
					isLive: message.isLive,
					liveLocation: message.liveLocation,
				};

				const newMessage = new Message(newMessageData);
				await newMessage.save();

				// Utilizza deleteOne per eliminare il messaggio corrente
				await Message.deleteOne({ _id: message._id });
			}
		} catch (error) {
			console.error('Error checking and sending temp messages:', error);
		}
	});
};

module.exports = { checkAndSendTempMessages };
