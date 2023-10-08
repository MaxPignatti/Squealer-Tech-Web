const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  fotoProfilo: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
  },
  password: {
    type: String,
    required: true,
  },
  confirmPassword: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return this.password === value;
      },
      message: 'Passwords do not match',
    },
  },
  socialMediaManagerEmail: {
    type: String,
    required: true,
  },
  remChar: {
    type: Number,
    required: true,
  },
  debChar: {
    type: Number,
    required: true,
  },
  accountType: {
    type: Number,
    required: true,
  },
  smm: {
    type: Boolean,
    required: true,
  },
});

module.exports = mongoose.model('User', userSchema);
