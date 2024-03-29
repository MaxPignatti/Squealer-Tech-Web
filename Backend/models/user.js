const mongoose = require("mongoose");

const defaultProfileImage =
	"data:image/png;base64,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";

const userSchema = new mongoose.Schema({
	firstName: {
		type: String,
	},
	lastName: {
		type: String,
	},
	profileImage: {
		type: String,
		default: defaultProfileImage,
		required: true,
	},
	username: {
		type: String,
	},
	email: {
		type: String,
		unique: true,
		match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
	},
	password: {
		type: String,
	},
	createdChannels: {
		type: [String],
		default: [],
	},
	channels: {
		type: [String],
	},
	socialMediaManagerEmail: {
		type: String,
		default: null,
	},
	dailyChars: {
		type: Number,
		default: 0,
	},
	weeklyChars: {
		type: Number,
		default: 0,
	},
	monthlyChars: {
		type: Number,
		default: 0,
	},
	debChar: {
		type: Number,
		default: 0,
	},
	privateMessagesReceived: {
		type: [mongoose.Schema.Types.ObjectId],
		ref: "Message",
		default: [],
	},
	likeReactionsGiven: {
		type: [mongoose.Schema.Types.ObjectId],
		default: [],
	},
	loveReactionsGiven: {
		type: [mongoose.Schema.Types.ObjectId],
		default: [],
	},
	dislikeReactionsGiven: {
		type: [mongoose.Schema.Types.ObjectId],
		default: [],
	},
	angryReactionsGiven: {
		type: [mongoose.Schema.Types.ObjectId],
		default: [],
	},
	positiveMessages: {
		type: [mongoose.Schema.Types.ObjectId],
		default: [],
	},
	negativeMessages: {
		type: [mongoose.Schema.Types.ObjectId],
		default: [],
	},
	controversialMessages: {
		type: [mongoose.Schema.Types.ObjectId],
		default: [],
	},
	accountType: {
		type: Number,
	},
	isPro: {
		type: Boolean,
		default: false,
	},
	vipUserName: {
		type: String,
		default: null,
	},
	isBlocked: {
		type: Boolean,
		default: false,
	},
	isMod: {
		type: Boolean,
		default: false,
	},
	isProRequested: {
		type: Boolean,
		default: false,
	},
});

module.exports = mongoose.model("User", userSchema);
