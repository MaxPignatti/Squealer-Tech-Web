const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  creator: {
    type: String, 
    ref: 'User',
    required: true,
  },
  members: [
    {
      type: String,
      ref: 'User',
    },
  ],
});

module.exports = mongoose.model('Channel', channelSchema);
