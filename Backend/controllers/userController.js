const User = require("../models/user");
const Message = require("../models/message");
const bcrypt = require("bcrypt");

exports.getUser = async (req, res) => {
	try {
		const username = req.params.username;
		const user = await User.findOne({ username: username });
		if (!user) {
			return res.status(404).json({ message: "Utente non trovato" });
		}

		res.json(user);
	} catch (error) {
		res.status(500).json({ message: "Errore del server" });
	}
};

exports.getAllUsers = async (req, res) => {
	try {
		const { firstName, lastName, email, username, sortField, sortOrder } =
			req.query;

		let filter = {};
		if (firstName) filter.firstName = { $regex: firstName, $options: "i" };
		if (lastName) filter.lastName = { $regex: lastName, $options: "i" };
		if (email) filter.email = { $regex: email, $options: "i" };
		if (username) filter.username = { $regex: username, $options: "i" };

		let sort = {};
		if (sortField && sortOrder) {
			if (sortField === "popularity") {
				// Custom sorting logic for popularity
				sort = {
					"positiveReactionsGiven.length": sortOrder === "asc" ? 1 : -1,
				};
			} else {
				sort[sortField] = sortOrder === "asc" ? 1 : -1;
			}
		}

		const users = await User.find(filter).sort(sort);
		res.json(users);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// Controller function to get user data by ID
exports.getUserByEmail = async (req, res) => {
	try {
		const { email } = req.params;

		const user = await User.findOne({ email });
		console.log(user);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		res.json(user);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal server error" });
	}
};

exports.updateUserProfile = async (req, res) => {
	try {
		let { profileImage, firstName, lastName, oldUserName, username, email } =
			req.body;

		const newUserName = username;
		username = oldUserName;

		const user = await User.findOne({ username });

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		// Check if the new email is already in use
		if (email && email !== user.email) {
			const existingUserWithEmail = await User.findOne({ email });
			if (existingUserWithEmail) {
				return res.status(400).json({ error: "Email is already in use" });
			}
		}

		// Check if the new username is already in use
		if (newUserName && newUserName !== oldUserName) {
			const existingUserWithUsername = await User.findOne({ newUserName });
			if (existingUserWithUsername) {
				return res.status(400).json({ error: "Username is already in use" });
			}
		}

		user.username = newUserName || oldUserName;
		user.email = email || user.email;
		user.firstName = firstName || user.firstName;
		user.lastName = lastName || user.lastName;
		user.profileImage = profileImage || user.profileImage;

		await Message.updateMany(
			{ user: oldUserName },
			{ $set: { user: user.username, profileImage: user.profileImage } }
		);

		// Save the updated user data to the database
		await user.save();
		res.json({ message: "User profile updated successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal server error" });
	}
};

exports.updateUserPassword = async (req, res) => {
	try {
		let { oldUserName, newPassword, oldPassword, username } = req.body;

		const user = await User.findOne({ username });

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		if (oldPassword) {
			//check if the olderpassward match
			const passwordMatch = await bcrypt.compare(oldPassword, user.password);
			if (passwordMatch) {
				if (newPassword) {
					const hashedPassword = await bcrypt.hash(newPassword, 10);
					user.password = hashedPassword;
				} else {
					return res.status(401).json({ error: "new password miss" });
				}
			} else {
				return res
					.status(401)
					.json({ error: "the older password is incorrect" });
			}
		} else {
			return res.status(401).json({ error: "olser psw miss" });
		}

		// Save the updated user data to the database
		await user.save();

		// Create a new token with the updated user data
		/*const token = jwt.sign(
      { username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    */

		res.json({ message: "Password updated successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal server error" });
	}
};
