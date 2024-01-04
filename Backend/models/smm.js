const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  email: {
    type: String,
    unique: true,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  vip: {
    type: String,
    default: null
  },
});

module.exports = mongoose.model('smm', userSchema);
