const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  user: {
    type: String,
    ref: 'User',
    required: true,
  },
  image: {
    type: String,
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
  channel: {
    type: String,
    default: "public",
    required: true,
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
