const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Define User schema fields
  username: String,
  email: String,
  password: String,
});

module.exports = mongoose.model('User', userSchema);
