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

router.get(
	"/users/:username/channel",
	validate,
	channelController.yourChannels
);

router.delete(
	"/channels/:channelId",
	validate,
	channelController.deleteChannel
);

router.get(
	"/users/:username/subscribedChannels",
	validate,
	channelController.getSubscribedChannels
);

router.put(
	"/channels/:channelId/members/:username",
	validate,
	channelController.subscribe
);

router.get("/channels", validate, channelController.getAllChannels);

router.delete(
	"/channels/:channelId/members/:username",
	validate,
	channelController.removeMember
);

router.get("/api/topMessages", validate, channelController.getTopMessages);

router.get(
	"/channels/moderator/:isMod",
	validate,
	channelController.modChannels
);

router.patch(
	"/channels/:channelId",
	[
		body("name").optional().trim().escape(),
		body("description").optional().trim().escape(),
	],
	validate,
	channelController.updateChannel
);

module.exports = router;
