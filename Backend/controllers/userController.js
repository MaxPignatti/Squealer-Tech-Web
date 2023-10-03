const User = require('../models/user');

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

// Controller function to update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, email, newPassword } = req.body;

    // Find the user by their ID in the database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user data based on the provided information
    user.username = username || user.username;
    user.email = email || user.email;

    // If a new password is provided, hash and update it
    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
    }

    // Save the updated user data to the database
    await user.save();

    // Return a success message
    res.json({ message: 'User profile updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
