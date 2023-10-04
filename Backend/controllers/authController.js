const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, username, email, password, confirmPassword, socialMediaManagerEmail } = req.body;

    // Check if the user already exists in the database
    const existingUser = await User.findOne({ username });
    const existingMail = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    if (existingMail) {
      return res.status(400).json({ error: 'Mail already exists' });
    }

    // Ensure that the password and confirmPassword match
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new User instance with the hashed password
    const newUser = new User({ firstName, lastName, username, email, password: hashedPassword, socialMediaManagerEmail });

    // Save the user to the database
    await newUser.save();

    // You can generate and send an access token if needed

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
    console.log("loggato see")
    res.json({ message: 'Login successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
