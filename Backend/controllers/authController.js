const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Controller function for user registration
exports.register = async (req, res) => {
  try {
    const { username, email, password, rememberMe } = req.body;

    // Check if the user already exists in the database
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new User instance with the hashed password
    const newUser = new User({ username, email, password: hashedPassword });

    // Save the user to the database
    await newUser.save();

    // If "Remember Me" is checked, create a long-lived access token
    if (rememberMe) {
      const accessToken = jwt.sign({ username: newUser.username }, process.env.SECRET_KEY, { expiresIn: '30d' }); // Adjust expiration as needed
      res.cookie('access_token', accessToken, { httpOnly: true });
    }

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Controller function for user login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user by their username in the database
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Compare the provided password with the stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Password is correct; you can consider the user authenticated
    // Create and send an access token
    const accessToken = jwt.sign({ username: user.username }, process.env.SECRET_KEY, { expiresIn: '1h' }); // Adjust expiration as needed
    res.cookie('access_token', accessToken, { httpOnly: true });

    res.json({ message: 'Login successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
