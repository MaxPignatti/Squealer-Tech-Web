const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  user: {
    type: String,
    ref: 'User',
    required: true,
  },
  image: {
    type: Buffer,
    required: false,
  },
  imageType: {
    type: String,
    required: false,
  },
  text: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  positiveReactions: {
    type: Number,
    default: 0,
    required: true,
  },
  negativeReactions: {
    type: Number,
    default: 0,
    required: true,
  },
});

module.exports = mongoose.model('Message', messageSchema);
