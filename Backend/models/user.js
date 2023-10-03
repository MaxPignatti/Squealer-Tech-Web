const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Define User schema fields
  firstName: String,
  lastName: String,
  foto_profilo: String,
  username: String,
  email: String,
  password: String,
  confirmPassword: String,
  socialMediaManagerEmail: String,
  rem_char: Number,
  deb_char: Number,
  account_type: Number,
  smm: Boolean
});

module.exports = mongoose.model('User', userSchema);
