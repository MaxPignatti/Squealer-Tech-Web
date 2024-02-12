const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Channel = require('../models/channel');
const authenticateWithToken = require('../middlewares/authenticationMiddlewares');
const consts = require('../consts');

// Register a new user
exports.register = async (req, res) => {
	try {
		const { firstName, lastName, username, password, confirmPassword, email } =
			req.body;
		if (
			!firstName ||
			!lastName ||
			!username ||
			!password ||
			!confirmPassword ||
			!email
		) {
			return res.status(400).json({ error: 'All fields are required' });
		}
		if (password !== confirmPassword) {
			return res.status(400).json({ error: 'Passwords do not match' });
		}

		// Check if the user already exists in the database
		const existingUser = await User.findOne({ username: username });
		if (existingUser) {
			return res.status(400).json({ error: 'Username already exists' });
		}
		const existingMail = await User.findOne({ email: email });
		if (existingMail) {
			return res.status(400).json({ error: 'Email already exists' });
		}

		// Hash the password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Crea un nuovo utente
		const newUser = new User({
			firstName,
			lastName,
			username,
			email,
			password: hashedPassword,
			dailyChars: consts.dailyCharacters,
			weeklyChars: consts.weeklyCharacters,
			monthlyChars: consts.monthlyCharacters,
			debChar: 0,
			accountType: 0,
			smm: false,
			channels: ['PUBLIC'],
		});
		await newUser.save();

		// Trova il canale "PUBLIC" e aggiungi l'utente
		const publicChannel = await Channel.findOne({ name: 'PUBLIC' });
		if (publicChannel) {
			publicChannel.members.push(username);
			await publicChannel.save();
		} else {
			console.error('Canale "PUBLIC" non trovato');
		}

		res.status(201).json({ message: 'User registered successfully' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal server error' });
	}
};

exports.login = async (req, res) => {
	const { username, password } = req.body;
	if (!username || !password) {
		return res
			.status(400)
			.json({ error: 'Username and password are required' });
	}

	try {
		const user = await User.findOne({ username });

		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		const passwordMatch = await bcrypt.compare(password, user.password);

		if (!passwordMatch) {
			return res.status(401).json({ error: 'Invalid password' });
		}

		if (user.isBlocked) {
			return res.status(402).json({ error: 'User is currently blocked' });
		}
		const userData = {
			username: user.username,
			accessToken: jwt.sign(
				{ username: user.username },
				process.env.SECRET_KEY,
				{ expiresIn: '1h' }
			),
		};

		res.cookie('user_data', JSON.stringify(userData), {
			path: '/',
			domain: 'localhost:3000',
			httpOnly: true,
		});

		res.json({ message: 'Login successful', user_data: userData });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal server error' });
	}
};

exports.protectedEndpoint = async (req, res) => {
	try {
		const user = req.user;
		res.json({ message: 'This is a protected endpoint', user });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal server error' });
	}
};

exports.loginSMM = async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return res.status(400).json({ error: 'Email and password are required' });
	}
	try {
		const smm = await User.findOne({ email });

		if (!smm) {
			return res.status(404).json({ error: 'User not found' });
		}

		if (!smm.isPro) {
			return res.status(403).json({
				error: "Non hai un account Pro, fanne richiesta sull'app principale.",
			});
		}

		const passwordMatch = await bcrypt.compare(password, smm.password);

		if (!passwordMatch) {
			return res.status(401).json({ error: 'Invalid password' });
		}

		if (!smm.vipUserName) {
			return res.status(404).json({
				error: 'Nessun VIP ti ha registrato come suo Social Media Manager',
			});
		}

		// Crea il token JWT
		const accessToken = jwt.sign({ email: smm.email }, process.env.SECRET_KEY, {
			expiresIn: '1h',
		});

		// Prepara i dati da inviare
		const userData = {
			email: smm.email,
			accessToken: accessToken,
			vip: smm.vipUserName,
		};

		// Imposta il token nel cookie
		res.cookie('authToken', accessToken, {
			path: '/',
			domain: 'localhost:8080',
			httpOnly: true,
		});

		// Invia i dati dell'utente e del VIP nella risposta
		res.json({ message: 'Login successful', user_data: userData });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal server error' });
	}
};

exports.verifyTokenSMM = async (req, res) => {
	const token = req.headers.authorization.split(' ')[1]; // Estrai il token dal header 'Authorization'

	try {
		const decoded = jwt.verify(token, process.env.SECRET_KEY);
		const email = decoded.email;
		if (!email) {
			return res.status(400).json({ error: 'Email is required' });
		}

		const smm = await User.findOne({ email });

		if (!smm) {
			return res.status(404).json({ error: 'User not found' });
		}

		// Restituisci i dati dell'utente
		const userData = {
			email: smm.email,
			vip: smm.vipUserName,
		};

		res.json(userData);
	} catch (error) {
		console.error(error);
		res.status(401).json({ error: 'Invalid or expired token' });
	}
};

exports.loginMod = async (req, res) => {
	const { username, password } = req.body;
	if (!username || !password) {
		return res
			.status(400)
			.json({ error: 'Username and password are required' });
	}
	try {
		const user = await User.findOne({ username });

		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		const passwordMatch = await bcrypt.compare(password, user.password);

		if (!passwordMatch) {
			return res.status(401).json({ error: 'Invalid password' });
		}

		if (user.isBlocked) {
			return res.status(402).json({ error: 'User is currently blocked' });
		}

		res.json({ message: 'Login successful', isMod: user.isMod });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal server error' });
	}
};
