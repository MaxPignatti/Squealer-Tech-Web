const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const authenticateWithToken = require('../middlewares/authenticationMiddlewares');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the user already exists in the database
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new User instance with the hashed password
    const newUser = new User({ username, password: hashedPassword });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// User login
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

    const accessToken = jwt.sign({ username: user.username }, process.env.SECRET_KEY, { expiresIn: '1h' });

    // Set the access_token cookie
    res.cookie('access_token', accessToken, {
      path: '/',
      domain: 'localhost:3000', 
      httpOnly: true, // Cookie cannot be accessed via JavaScript
      secure: true,   // Requires HTTPS
      sameSite: 'Strict', // Recommended for security
    });

    res.json({ message: 'Login successful', access_token: accessToken });
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