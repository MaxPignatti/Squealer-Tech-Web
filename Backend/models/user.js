const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  fotoProfilo: {
    type: String
  },
  username: {
    type: String
  },
  email: {
    type: String,
    unique: true,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
  },
  password: {
    type: String
  },
  socialMediaManagerEmail: {
    type: String,
  },
  remChar: {
    type: Number,
  },
  debChar: {
    type: Number
  },
  accountType: {
    type: Number
  },
  smm: {
    type: Boolean
  },
});

module.exports = mongoose.model('User', userSchema);
