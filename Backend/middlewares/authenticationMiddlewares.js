const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = async (req, res, next) => {
	// Check if the access_token cookie is present in the request
	const token = req.cookies.access_token;

	if (!token) {
		return res.status(401).json({ error: 'Unauthorized' });
	}

	try {
		const decoded = jwt.verify(token, process.env.SECRET_KEY);
		const user = await User.findOne({ username: decoded.username });

		if (!user) {
			return res.status(401).json({ error: 'Unauthorized' });
		}

		req.user = user;

		next();
	} catch (error) {
		return res.status(401).json({ error: 'Unauthorized' });
	}
};
