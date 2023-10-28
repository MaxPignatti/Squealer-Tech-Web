const Message = require('../models/message');
const User = require('../models/user');

// Create a new message
exports.createMessage = async (req, res) => {
  try {
    const { userName, image, text, charCount } = req.body;

    // Calculate the character count for the message
    //const charCount = calculateCharacterCount({ type, text });

    // Check if the user has enough remaining characters
    const user = await User.findOne({ username: userName });
    if (user == null) {
      return res.status(400).json({ error: 'User not found' });
    }
    if (user.remainingCharacters < charCount) {
      return res.status(400).json({ error: 'Not enough remaining characters' });
    }

    // Create the message
    const message = new Message({
      user: userName,
      profileImage: user.profileImage,
      image: (image !== null) ? image.toString('base64') : null, // Salva l'immagine come stringa Base64
      text: text,
    });

    // Save the message
    await message.save();

    // Update the user's remaining characters
    user.remainingCharacters -= charCount;
    await user.save();

    return res.status(201).json(message);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.getAllSqueels = async (req, res) => {
  try {
    //const userId = req.user.id;
    const {username} = req.params;
    
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userChannels = await User.findOne({username: username}).select('channels');

    const messages = await Message.find({ channel: { $in: userChannels.channels } });

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Retrieve a message by ID
exports.getMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    return res.status(200).json(message);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Update a message by ID
exports.updateMessage = async (req, res) => {
    try {
      const messageId = req.params.id;
      const { text, reaction } = req.body;
  
      const message = await Message.findById(messageId);
      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }
  
      // Update message text and/or reaction as needed
      if (text) {
        message.text = text;
      }
      if (reaction) {
        message.reaction = reaction;
      }
  
      // Save the updated message
      await message.save();
  
      return res.status(200).json(message);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Server error' });
    }
  };
  
  // Delete a message by ID
  exports.deleteMessage = async (req, res) => {
    try {
      const messageId = req.params.id;
  
      const message = await Message.findById(messageId);
      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }
  
      // Remove the message from the database
      await message.remove();
  
      // Optionally, update the user's remaining characters
      const user = await User.findById(message.user);
      const charCount = calculateCharacterCount(message);
      user.remainingCharacters += charCount;
      await user.save();
  
      return res.status(204).send(); // 204 No text for successful deletion
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Server error' });
    }
  };

  /*const calculateCharacterCount = (message) => {
    let charCount = 0;
  
    if (message.type === 'text') {
      charCount = message.text.length;
    } else if (message.type === 'image') {
      charCount = 50; // Images count as 50 characters (non ricordo le specifiche)
    }
  
    // Count the number of pictures in the text
    const pictureCount = message.text.split(' ').filter((word) => word.startsWith('![image]')).length;
  
    // Calculate the total character count for the message
    charCount += pictureCount * 50;
  
    return charCount;
  };*/
