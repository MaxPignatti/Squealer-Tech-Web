const Message = require('../models/message');
const User = require('../models/user');

// Create a new message
exports.createMessage = async (req, res) => {
    try {
        const { userId, type, content, reaction } = req.body;
    
        // Calculate the character count for the message
        const charCount = calculateCharacterCount({ type, content });
    
        // Check if the user has enough remaining characters
        const user = await User.findById(userId);
        if (user.remainingCharacters < charCount) {
          return res.status(400).json({ error: 'Not enough remaining characters' });
        }
    
        // Create the message
        const message = new Message({
          user: userId,
          type,
          content,
          reaction,
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
      const { content, reaction } = req.body;
  
      const message = await Message.findById(messageId);
      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }
  
      // Update message content and/or reaction as needed
      if (content) {
        message.content = content;
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
  
      return res.status(204).send(); // 204 No Content for successful deletion
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Server error' });
    }
  };

  const calculateCharacterCount = (message) => {
    let charCount = 0;
  
    if (message.type === 'text') {
      charCount = message.content.length;
    } else if (message.type === 'image') {
      charCount = 50; // Images count as 50 characters
    } else if (message.type === 'video') {
      // Implement logic for counting video characters if needed
    }
  
    // Count the number of pictures in the content
    const pictureCount = message.content.split(' ').filter((word) => word.startsWith('![image]')).length;
  
    // Calculate the total character count for the message
    charCount += pictureCount * 50;
  
    return charCount;
  };
