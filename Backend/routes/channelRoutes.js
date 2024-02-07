const express = require("express");
const router = express.Router();
const channelController = require("../controllers/channelController");
const { body, validationResult } = require("express-validator");

const validate = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	next();
};

router.post(
	"/channels",
	[
		body("name")
			.notEmpty()
			.withMessage("Il nome del canale è obbligatorio")
			.trim()
			.escape(),
		body("description").optional().trim().escape(),
		body("creator").trim().escape(),
		body("isMod")
			.isBoolean()
			.withMessage("isMod deve essere un valore booleano"),
	],
	validate,
	channelController.createChannel
);

router.get("/channels/created", validate, channelController.yourChannels);

router.delete(
	"/channels/delete/:channelId",
	validate,
	channelController.deleteChannel
);

router.get(
	"/channels/subscribed/:username",
	validate,
	channelController.getSubscribedChannels
);

router.post(
	"/channels/subscribe/:channelId",
	[
		body("username")
			.notEmpty()
			.withMessage("Il nome utente è obbligatorio")
			.trim()
			.escape(),
	],
	validate,
	channelController.subscribe
);

router.get(
	"/channels/all/:username",
	validate,
	channelController.getAllChannels
);

router.post(
	"/channels/removeMember/:channelId",
	[
		body("username")
			.notEmpty()
			.withMessage("Il nome utente è obbligatorio")
			.trim()
			.escape(),
	],
	validate,
	channelController.removeMember
);

router.get("/api/topMessages", validate, channelController.getTopMessages);

router.get(
	"/channels/moderator/:isMod",
	validate,
	channelController.modChannels
);

router.post(
	"/channels/update/:channelId",
	[
		body("name").optional().trim().escape(),
		body("description").optional().trim().escape(),
	],
	validate,
	channelController.updateChannel
);

module.exports = router;
