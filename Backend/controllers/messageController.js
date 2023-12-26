const Message = require('../models/message');
const User = require('../models/user');

// Create a new message
exports.createMessage = async (req, res) => {
  try {
    const { userName, image, text, charCount, isTemp, recipients, updateInterval, maxSendCount,nextSendTime, location} = req.body;

    const user = await User.findOne({ username: userName });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Creare un nuovo messaggio
    const newMessage = new Message({
      user: userName,
      profileImage: user.profileImage,
      image: image ? image.toString('base64') : null,
      text: text,
      isTemp: isTemp,
      channel: recipients.channels,
      updateInterval: updateInterval,
      maxSendCount: maxSendCount,
      nextSendTime:nextSendTime,
      location: location ? [location.latitude, location.longitude] : null,
    });

    // Salvare il messaggio
    const savedMessage = await newMessage.save();

    // Aggiornare i messaggi privati ricevuti per ciascun utente destinatario
    if (recipients.users && recipients.users.length > 0) {
      await User.updateMany(
        { username: { $in: recipients.users } },
        { $push: { privateMessagesReceived: savedMessage._id } }
      );
    }

    // Aggiornare i caratteri rimanenti dell'utente
    user.remChar = charCount;
    await user.save();

    return res.status(201).json({ message: 'Message created successfully' });
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

exports.getPrivateMessages = async (req, res) => {
  try {
    const username = req.params.username;

    // Trova l'utente tramite username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    // Trova tutti i messaggi privati ricevuti dall'utente
    const privateMessages = await Message.find({
      '_id': { $in: user.privateMessagesReceived }
    });

    res.json(privateMessages);
  } catch (error) {
    console.error("Errore durante il recupero dei messaggi privati:", error);
    res.status(500).json({ error: "Errore interno del server." });
  }
};

exports.addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { reaction, username } = req.body;
    
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const user = await User.findOne({username});

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if ((reaction && user.positiveReactionsGiven.includes(messageId)) || (!reaction && user.negativeReactionsGiven.includes(messageId))) {
      return res.status(400).json({ error: 'User has already reacted to this message' });
    }

    if (reaction) {
      if (user.negativeReactionsGiven.includes(messageId)) {
        message.negativeReactions -= 1;
        user.negativeReactionsGiven.pop(messageId);
      }
      message.positiveReactions += 1;
      user.positiveReactionsGiven.push(messageId);
    } else {
      if (user.positiveReactionsGiven.includes(messageId)) {
        message.positiveReactions -= 1;
        user.positiveReactionsGiven.pop(messageId);
      }
      message.negativeReactions += 1;
      user.negativeReactionsGiven.push(messageId);
    }
    
    //console.log("reazioni positive: ", message.positiveReactions);
    const cm = 0.5 * (message.positiveReactions + message.negativeReactions); //massa critica
    const newChar = 10; // caratteri da aggiungere o togliere

    if(message.positiveReactions > cm && message.negativeReactions <= cm)//il messaggio è popolare
    { 
      //console.log("popolare");
      if(user.negativeMessages.includes(messageId)) // il messaggio è controverso
      {
        //user.negativeMessages.pop(messageId);
        if(!user.controversialMessages.includes(messageId)){
          user.controversialMessages.push(messageId);
        };

      }

      if(!user.positiveMessages.includes(messageId))
      {
        user.positiveMessages.push(messageId);
        user.dailyChars += charforReaction(user, newChar);//modifico caratteri
        user.weeklyChars += charforReaction(user, newChar);
        user.monthlyChars += charforReaction(user, newChar);
        //console.log("fatto");
      }
      
    }
    else if(message.positiveReactions <= cm && message.negativeReactions > cm)//il messaggio è impopolare
    {
      //console.log("impopolare");
      if(user.positiveMessages.includes(messageId))
      {
        //user.positiveMessages.pop(messageId);
        //console.log("tolto");
        if(!user.controversialMessages.includes(messageId)){
          user.controversialMessages.push(messageId);
        };
      }

      if (!user.negativeMessages.includes(messageId))
      {
        user.negativeMessages.push(messageId);
        user.remChar += charforReaction(user, newChar);//modifico i caratteri
      } 
    }
    //console.log("hey  ", user.positiveMessages.length);

    

    await Promise.all([message.save(), user.save()]);

    res.json({ 
      message: 'Reaction added successfully',
      positiveReactions: message.positiveReactions, // Invia il numero aggiornato di reazioni positive
      negativeReactions: message.negativeReactions, // Invia il numero aggiornato di reazioni negative
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
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


exports.updateMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text, username } = req.body; 

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    const user = await User.findOne({username});

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const oldTextLength = message.text.length;
    if (text) {
      message.text = text;
    }

    const newTextLength = message.text.length;

    const charDifference = newTextLength - oldTextLength;

    user.remChar -= charDifference;

    await Promise.all([message.save(), user.save()]);

    res.json({ 
      text: message.text,
    });
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

  exports.updatePosition = async (req, res) => {
    try{
      const { messageId } = req.params;
      const {position} = req.body;
  
      const message = await Message.findById(messageId);
  
      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }

      if(position && position != message.location){

        message.location = position;

      }

      await message.save();
      res.json({ 
        message: 'position added successfully',
      });
    } catch{
      console.error(error);
      return res.status(500).json({ error: 'Server error' });
    }

  };

  const charforReaction = (user, newChar) => {
    
    let char = 0;

    if(user.positiveMessages && user.positiveMessages.length > 10){
      char += newChar;
      
    }
    else if(user.negativeMessages && user.negativeMessages.length > 3){
      //console.log("hey");
      char -= newChar;
      
    }
    return char;
  }

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
