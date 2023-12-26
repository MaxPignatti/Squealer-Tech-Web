const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Channel = require('../models/channel');
const authenticateWithToken = require('../middlewares/authenticationMiddlewares');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { firstName, lastName,username, password,confirmPassword, email } = req.body;

    // Check if the user already exists in the database
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    const existingMail= await User.findOne({ email });
    if (existingMail) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    if (password != confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
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
      dailyChars: 150,
      weeklyChars: 750,
      monthlyChars: 2250,
      debChar: 0,
      accountType: 0,
      smm: false,
      channels: ['public'] // Aggiungi il canale "public" all'array dei canali
    });
    await newUser.save();

    // Trova il canale "public" e aggiungi l'utente
    const publicChannel = await Channel.findOne({ name: 'public' });
    if (publicChannel) {
      publicChannel.members.push(username);
      await publicChannel.save();
    } else {
      console.error('Canale "public" non trovato');
    }

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const userData = {
      username: user.username,
      accessToken: jwt.sign({ username: user.username }, process.env.SECRET_KEY, { expiresIn: '1h' }),
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



// Logout
exports.logout = async (req, res) => {
  res.clearCookie('access_token');
  res.json({ message: 'Logout successful' });
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