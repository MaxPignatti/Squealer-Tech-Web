const Message = require("../models/message");
const User = require("../models/user");
const Channel = require("../models/channel");
const consts = require("../consts");

exports.replyToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const {
      username,
      image,
      text,
      dailyCharacters,
      weeklyCharacters,
      monthlyCharacters,
      location,
    } = req.body;

    const originalMessage = await Message.findById(messageId);
    if (!originalMessage) {
      return res
        .status(404)
        .json({ error: "Messaggio originale non trovato." });
    }

    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const replyMessage = new Message({
      user: username,
      profileImage: user.profileImage,
      image: image ? image.toString("base64") : null,
      text: text,
      channel: originalMessage.channel,
      replyTo: messageId,
      location: location ? [location.latitude, location.longitude] : null,
    });

    const savedReply = await replyMessage.save();
    if (user.privateMessagesReceived.includes(messageId)) {
      const senderUser = await User.findOne({ username: originalMessage.user });

      if (senderUser) {
        await User.updateOne(
          { _id: senderUser._id },
          { $push: { privateMessagesReceived: savedReply._id } }
        );
      }
    }

    user.dailyChars = dailyCharacters;
    user.weeklyChars = weeklyCharacters;
    user.monthlyChars = monthlyCharacters;
    await user.save();

    res
      .status(201)
      .json({ message: "Risposta creata con successo", reply: savedReply._id });
  } catch (error) {
    console.error("Errore durante la creazione della risposta:", error);
    res.status(500).json({ error: "Errore interno del server." });
  }
};

exports.createMessage = async (req, res) => {
  try {
    const {
      userName,
      image,
      text,
      dailyCharacters,
      weeklyCharacters,
      monthlyCharacters,
      recipients,
      updateInterval,
      maxSendCount,
      nextSendTime,
      location,
      isLive,
    } = req.body;

    const user = await User.findOne({ username: userName });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // Extract user mentions and channels
    const userMentions = await extractUserMentions(text);
    const channelMentions = await extractChannelMentions(text);
    const latitude = location ? parseFloat(location[1]) : null;
    const longitude = location ? parseFloat(location[0]) : null;

    const newMessage = new Message({
      user: userName,
      profileImage: user.profileImage,
      image: image ? image.toString("base64") : null,
      text: text,
      channel: recipients.channels,
      updateInterval: updateInterval,
      maxSendCount: maxSendCount,
      nextSendTime: nextSendTime,
      location: location ? [longitude, latitude] : null,
      beepRequested: updateInterval !== null,
      hashtags: extractHashtags(text),
      userMentions: userMentions,
      channelMentions: channelMentions,
      isLive: isLive,
    });

    const savedMessage = await newMessage.save();

    // Se il messaggio è live, aggiorna liveLocation con la coppia di coordinate
    if (isLive) {
      await Message.findByIdAndUpdate(savedMessage._id, {
        $push: {
          liveLocation: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
        },
      });
    }

    if (recipients.users && recipients.users.length > 0) {
      await User.updateMany(
        { username: { $in: recipients.users } },
        { $push: { privateMessagesReceived: savedMessage._id } }
      );
    }

    user.dailyChars = dailyCharacters;
    user.weeklyChars = weeklyCharacters;
    user.monthlyChars = monthlyCharacters;
    await user.save();

    return res.status(201).json({
      message: "Message created successfully",
      _id: savedMessage._id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.getMessageById = async (req, res) => {
  try {
    const messageId = req.params.id;
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Messaggio non trovato" });
    }
    return res.status(200).json(message);
  } catch (error) {
    console.error("Errore durante il recupero del messaggio:", error);
    return res.status(500).json({ error: "Errore interno del server" });
  }
};

exports.getAllSqueals = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userChannels = await User.findOne({ username: username }).select(
      "channels"
    );

    const messages = await Message.find({
      channel: { $in: userChannels.channels },
    });

    res.json({ messages: messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getPrivateMessages = async (req, res) => {
  try {
    const username = req.params.username;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "Utente non trovato" });
    }

    // Trova tutti i messaggi privati ricevuti dall'utente
    const privateMessages = await Message.find({
      _id: { $in: user.privateMessagesReceived },
    });

    res.json({ messages: privateMessages });
  } catch (error) {
    console.error("Errore durante il recupero dei messaggi privati:", error);
    res.status(500).json({ error: "Errore interno del server." });
  }
};

exports.getPublicMessagesByUser = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "Utente non trovato" });
    }

    // I messaggi pubblici sono quelli in cui il campo 'channel' non è un array vuoto
    const publicMessages = await Message.find({
      user: username,
      channel: { $ne: [] },
    });

    res.json({ messages: publicMessages });
  } catch (error) {
    console.error("Errore durante il recupero dei messaggi pubblici:", error);
    res.status(500).json({ error: "Errore interno del server." });
  }
};

exports.getRepliesToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const originalMessage = await Message.findById(messageId);
    if (!originalMessage) {
      return res
        .status(404)
        .json({ error: "Messaggio originale non trovato." });
    }

    const replies = await Message.find({ replyTo: messageId });

    res.json(replies);
  } catch (error) {
    console.error("Errore durante il recupero delle risposte:", error);
    res.status(500).json({ error: "Errore interno del server." });
  }
};

// Helper Functions
async function findMessageAndUser(messageId, username) {
  const message = await Message.findById(messageId);
  if (!message) throw new Error("Message not found");
  const user = await User.findOne({ username });
  if (!user) throw new Error("User not found");
  return { message, user };
}

function updateReactionArrays({ user, message, messageId, reaction }) {
  const reactionFieldMap = {
    like: "likeReactionsGiven",
    love: "loveReactionsGiven",
    dislike: "dislikeReactionsGiven",
    angry: "angryReactionsGiven",
  };

  // Controlla se l'utente ha già dato questa specifica reazione
  const currentReactionField = reactionFieldMap[reaction];
  if (!user[currentReactionField].includes(messageId)) {
    // Rimuovi qualsiasi reazione precedente dell'utente a questo messaggio
    Object.keys(reactionFieldMap).forEach((reactionKey) => {
      const field = reactionFieldMap[reactionKey];
      if (user[field].includes(messageId)) {
        const index = user[field].indexOf(messageId);
        user[field].splice(index, 1);
        message[`${reactionKey}Reactions`] -= 1;
      }
    });

    // Aggiungi la nuova reazione
    user[currentReactionField].push(messageId);
    message[`${reaction}Reactions`] += 1;
  }
}

function adjustUserChars(user, adjustment) {
  user.dailyChars += adjustment;
  user.weeklyChars += adjustment;
  user.monthlyChars += adjustment;
}

function determineMessagePopularityAndAdjustChars({
  message,
  user,
  cm,
  messageId,
  newChar,
}) {
  let popularityChange = null;

  if (
    message.likeReactions + message.loveReactions > cm &&
    message.angryReactions + message.dislikeReactions <= cm
  ) {
    popularityChange = "popular";
  } else if (
    message.likeReactions + message.loveReactions <= cm &&
    message.angryReactions + message.dislikeReactions > cm
  ) {
    popularityChange = "unpopular";
  }

  if (
    popularityChange === "popular" &&
    !user.positiveMessages.includes(messageId)
  ) {
    message.popularity = "popular";
    if (!user.positiveMessages.includes(messageId)) {
      user.positiveMessages.push(messageId);
    }
    adjustUserChars(user, newChar);
  } else if (
    popularityChange === "unpopular" &&
    !user.negativeMessages.includes(messageId)
  ) {
    message.popularity = "unpopular";
    if (!user.negativeMessages.includes(messageId)) {
      user.negativeMessages.push(messageId);
    }
    adjustUserChars(user, -newChar);
  }

  if (
    (popularityChange === "popular" &&
      user.negativeMessages.includes(messageId)) ||
    (popularityChange === "unpopular" &&
      user.positiveMessages.includes(messageId))
  ) {
    message.popularity = "controversial";
    if (!user.controversialMessages.includes(messageId)) {
      user.controversialMessages.push(messageId);
    }
  }
}

exports.addReactionToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { reaction, username } = req.body;

    const { message, user } = await findMessageAndUser(messageId, username);
    updateReactionArrays({
      user,
      message,
      messageId,
      reaction: reaction,
    });

    const cm = consts.CMParameter * message.impressions.length;
    const newChar = 10;

    determineMessagePopularityAndAdjustChars({
      message,
      user,
      cm,
      messageId,
      newChar,
    });

    await Promise.all([message.save(), user.save()]);

    res.json({
      message: "Reaction added successfully",
      likeReactions: message.likeReactions,
      loveReactions: message.loveReactions,
      dislikeReactions: message.dislikeReactions,
      angryReactions: message.angryReactions,
    });
  } catch (error) {
    console.error(error);
    const statusCode =
      error.message === "Message not found" ||
      error.message === "User not found"
        ? 404
        : 500;
    res.status(statusCode).json({ error: error.message });
  }
};

// Retrieve a message by ID
exports.getMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    return res.status(200).json(message);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.updateMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text, username } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const userMentions = await extractUserMentions(text);
    const channelMentions = await extractChannelMentions(text);
    const oldTextLength = message.text.length;

    if (text) {
      message.text = text;
      message.hashtags = extractHashtags(text);
      message.userMentions = userMentions;
      message.channelMentions = channelMentions;
    }

    const newTextLength = message.text.length;

    const charDifference = newTextLength - oldTextLength;

    user.dailyChars -= charDifference;
    user.weeklyChars -= charDifference;
    user.monthlyChars -= charDifference;

    await Promise.all([message.save(), user.save()]);

    res.json({
      text: message.text,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

// Delete a message by ID
exports.deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.id;

    const result = await Message.findByIdAndRemove(messageId);
    if (!result) {
      return res.status(404).json({ error: "Message not found" });
    }
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.updateLivePosition = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { position } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (
      !position ||
      position.length !== 2 ||
      !position.every(Number.isFinite)
    ) {
      return res.status(400).json({ error: "Invalid position format" });
    }

    // Crea un oggetto GeoJSON Point con le coordinate fornite
    const geoJsonPoint = {
      type: "Point",
      coordinates: [position[0], position[1]],
    };

    message.liveLocation.push(geoJsonPoint);

    await message.save();
    res.json({ message: "Live position added successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.incrementImpressions = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { username } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Messaggio non trovato" });
    }

    if (!message.impressions.includes(username)) {
      message.impressions.push(username);
      await message.save();
    }

    res.status(200).json({ message: "Impressions incrementate" });
  } catch (error) {
    console.error("Errore durante l'incremento delle impressions:", error);
    res.status(500).json({ error: "Errore interno del server" });
  }
};

exports.getMessageByHashtag = async (req, res) => {
  try {
    const { username, hashtag } = req.params;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "Utente non trovato" });
    }

    // Prendi i canali dell'utente e filtra i messaggi pubblici in base all'hashtag
    const userChannels = await User.findOne({ username }).select("channels");
    const messages = await Message.find({
      channel: { $in: userChannels.channels },
      hashtags: hashtag,
    });

    let response = {
      messages: messages,
      publicMessage: "",
    };

    if (messages.length === 0) {
      response.publicMessage = `Nessun messaggio trovato con l'hashtag '${hashtag}'`;
    }

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getPrivateMessByHashtag = async (req, res) => {
  try {
    const { username, hashtag } = req.params;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "Utente non trovato" });
    }

    const privateMessages = await Message.find({
      _id: { $in: user.privateMessagesReceived },
      hashtags: hashtag,
    });

    let response = {
      messages: privateMessages,
      privateMessage: "",
    };

    if (privateMessages.length === 0) {
      response.privateMessage = `Nessun messaggio Privato trovato con l'hashtag '${hashtag}'`;
    }

    res.json(response);
  } catch (error) {
    console.error("Errore durante il recupero dei messaggi privati:", error);
    res.status(500).json({ error: "Errore interno del server." });
  }
};

exports.getMessageByUser = async (req, res) => {
  try {
    const { username, targetUsername } = req.params;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "Utente non trovato" });
    }

    const userChannels = await User.findOne({ username }).select("channels");
    const messages = await Message.find({
      channel: { $in: userChannels.channels },
      user: targetUsername,
      replyTo: null,
    });

    let response = {
      messages: messages,
      publicMessage: "",
    };

    if (messages.length === 0) {
      response.publicMessage = `Nessun messaggio di '${targetUsername}' trovato`;
    }

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getPrivateMessByUser = async (req, res) => {
  try {
    const { username, targetUsername } = req.params;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "Utente non trovato" });
    }

    const privateMessages = await Message.find({
      user: targetUsername,
      replyTo: null,
      _id: { $in: user.privateMessagesReceived },
    });

    let response = {
      messages: privateMessages,
      privateMessage: "",
    };

    if (privateMessages.length === 0) {
      response.privateMessage = `Nessun messaggio Privato di '${targetUsername}' trovato`;
    }

    res.json(response);
  } catch (error) {
    console.error("Errore durante il recupero dei messaggi privati:", error);
    res.status(500).json({ error: "Errore interno del server." });
  }
};
exports.getMessageByChannel = async (req, res) => {
  try {
    const { username, channel } = req.params;

    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(404)
        .json({ error: "Utente non trovato", messages: [] });
    }

    const channelExists = await Channel.findOne({ name: channel });
    if (!channelExists) {
      return res.json({ publicMessage: "Il canale non esiste", messages: [] });
    }

    const isSubscribed = user.channels.includes(channel);
    if (!isSubscribed) {
      return res.json({
        publicMessage: "Devi iscriverti per vedere i messaggi di questo canale",
        messages: [],
      });
    }

    const messages = await Message.find({ channel: channel });
    res.json({ messages: messages });
  } catch (error) {
    console.error("Errore durante il recupero dei messaggi:", error);
    res.status(500).json({ error: "Errore interno del server.", messages: [] });
  }
};

exports.getPrivateMessByChannel = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "Utente non trovato" });
    }

    // Poiché i messaggi privati non sono associati a canali, restituisci un array vuoto e un messaggio personalizzato
    const response = {
      messages: [],
      privateMessage:
        "I messaggi privati non sono associati a canali specifici, vai nella sezione Pubblici se vuoi vedere i canali.",
    };

    res.json(response);
  } catch (error) {
    console.error("Errore durante il recupero dei messaggi privati:", error);
    res.status(500).json({ error: "Errore interno del server." });
  }
};

exports.getMessageByText = async (req, res) => {
  try {
    const { username, text } = req.params;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "Utente non trovato" });
    }

    const userChannels = await User.findOne({ username }).select("channels");
    const messages = await Message.find({
      channel: { $in: userChannels.channels },
      text: { $regex: text, $options: "i" },
    });

    let response = {
      messages: messages,
      publicMessage: "",
    };

    if (messages.length === 0) {
      response.publicMessage = `Nessun messaggio pubblico contiene '${text}'`;
    }

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getPrivateMessByText = async (req, res) => {
  try {
    const { username, text } = req.params;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "Utente non trovato" });
    }

    // Prendi i messaggi privati dell'utente che contengono il testo specificato
    const privateMessages = await Message.find({
      _id: { $in: user.privateMessagesReceived },
      text: { $regex: text, $options: "i" },
    });

    let response = {
      messages: privateMessages,
      privateMessage: "",
    };

    if (privateMessages.length === 0) {
      response.privateMessage = `Nessuno dei tuoi messaggi privati contiene'${text}'`;
    }

    res.json(response);
  } catch (error) {
    console.error("Errore durante il recupero dei messaggi privati:", error);
    res.status(500).json({ error: "Errore interno del server." });
  }
};

exports.getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find({});
    res.json(messages);
  } catch (error) {
    console.error("Errore durante il recupero di tutti i messaggi:", error);
    res.status(500).json({ error: "Errore interno del server" });
  }
};

const extractHashtags = (text) => {
  const hashtagRegex = /#(\w+)/g;
  let match;
  const hashtags = new Set();
  while ((match = hashtagRegex.exec(text)) !== null) {
    hashtags.add(match[1]);
  }
  return Array.from(hashtags);
};

const extractUserMentions = async (text) => {
  const userMentionRegex = /@(\w+)/g;
  let match;
  const userMentionsSet = new Set();

  while ((match = userMentionRegex.exec(text)) !== null) {
    const username = match[1];
    const userExists = await User.findOne({ username: username }).exec();
    if (userExists) {
      userMentionsSet.add(username);
    }
  }

  return Array.from(userMentionsSet);
};

const extractChannelMentions = async (text) => {
  const channelMentionRegex = /§(\w+)/g;
  let match;
  const channelMentionsSet = new Set();

  while ((match = channelMentionRegex.exec(text)) !== null) {
    const channelName = match[1];
    const channelExists = await Channel.findOne({ name: channelName }).exec();
    if (channelExists) {
      channelMentionsSet.add(channelName);
    }
  }

  return Array.from(channelMentionsSet);
};

exports.acknowledgeMessage = async (req, res) => {
  try {
    const messageId = req.params.id;

    // Trova e aggiorna il messaggio impostando beepRequested a false
    const message = await Message.findByIdAndUpdate(
      messageId,
      { beepRequested: false },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    return res.status(200).json({
      message: "Beep acknowledged",
      beepRequested: message.beepRequested,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.updateMessageChannels = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { channels } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Messaggio non trovato" });
    }

    message.channel = channels;
    await message.save();

    res.status(200).json({
      message: "Canali aggiornati con successo",
      updatedChannels: message.channel,
    });
  } catch (error) {
    console.error(
      "Errore durante l'aggiornamento dei canali del messaggio:",
      error
    );
    res.status(500).json({ error: "Errore interno del server" });
  }
};

exports.updateReactions = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { loveReactions, likeReactions, dislikeReactions, angryReactions } =
      req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    message.loveReactions = loveReactions;
    message.likeReactions = likeReactions;
    message.dislikeReactions = dislikeReactions;
    message.angryReactions = angryReactions;
    await message.save();

    res.status(200).json({
      message: "Reactions updated successfully",
      updatedMessage: message,
    });
  } catch (error) {
    console.error("Error updating reactions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
