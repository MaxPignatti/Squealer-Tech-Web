const User = require("../models/user");

exports.purchaseRemChar = async (req, res) => {
	try {
		const { username, quantity } = req.body;

		const user = await User.findOne({ username });

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		user.dailyChars += quantity;
		user.weeklyChars += quantity;
		user.monthlyChars += quantity;
		await user.save();

		return res
			.status(200)
			.json({ message: `Successfully purchased ${quantity} rem_char` });
	} catch (error) {
		console.error("Error in purchaseRemChar:", error);
		return res.status(500).json({ message: "Internal Server Error" });
	}
};
