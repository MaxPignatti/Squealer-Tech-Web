const User = require('../models/user');
const bcrypt = require('bcrypt'); // Importa il modulo bcrypt

// Controller function to get user data by ID
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user by their ID in the database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user data (excluding sensitive information like the password)
    const userData = {
      username: user.username,
      email: user.email,
      // Add other user properties as needed
    };

    res.json(userData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//
exports.updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, username, email, newPassword } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Check if the new email is already in use
    if (email && email !== user.email) {
      const existingUserWithEmail = await User.findOne({ email });
      if (existingUserWithEmail) {
        return res.status(400).json({ error: 'Email is already in use' });
      }
    }

    // Check if the new username is already in use
    if (username && username !== user.username) {
      const existingUserWithUsername = await User.findOne({ username });
      if (existingUserWithUsername) {
        return res.status(400).json({ error: 'Username is already in use' });
      }
    }

    user.username = username || user.username;
    user.email = email || user.email;
    user.firstName=firstName|| user.firstName;
    user.lastName=lastName|| user.lastName;
    
    // If password changed, crypt and hast it.
    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
    }

    // Save the updated user data to the database
    await user.save();

    res.json({ message: 'User profile updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
