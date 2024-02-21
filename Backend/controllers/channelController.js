const User = require("../models/user");
const Channel = require("../models/channel");
const Message = require("../models/message");
const user = require("../models/user");

exports.createChannel = async (req, res) => {
  try {
    const { name, description, creator, isMod } = req.body;

    if (!name || !creator) {
      return res
        .status(400)
        .json({ error: "Nome del canale e creatore sono campi obbligatori." });
    }

    // Verifica se esiste già un canale con lo stesso nome
    const existingChannel = await Channel.findOne({ name });
    if (existingChannel) {
      return res
        .status(400)
        .json({ error: "Un canale con lo stesso nome esiste già." });
    }

    const newChannel = new Channel({
      name,
      description,
      creator,
      moderatorChannel: isMod,
      members: [creator],
    });

    await newChannel.save();

    await User.updateOne(
      { username: creator },
      {
        $push: { createdChannels: name, channels: name },
      }
    );

    res
      .status(201)
      .json({ message: "Canale creato con successo.", newChannel: newChannel });
  } catch (error) {
    console.error("Errore durante la creazione del canale:", error);
    res.status(500).json({ error: "Errore interno del server." });
  }
};

exports.yourChannels = async (req, res) => {
  try {
    const { username } = req.params;

    const userChannels = await Channel.find({ creator: username });

    res.json(userChannels);
  } catch (error) {
    console.error("Errore durante il recupero dei canali:", error);
    res.status(500).json({ error: "Errore interno del server." });
  }
};

exports.deleteChannel = async (req, res) => {
  try {
    const { channelId } = req.params;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Canale non trovato" });
    }

    const channelName = channel.name;

    await Channel.findByIdAndDelete(channelId);

    await Message.updateMany(
      { channel: channelName },
      { $pull: { channel: channelName } }
    );

    await Message.deleteMany({ channel: { $size: 0 } });

    await User.updateMany(
      { channels: channelName },
      { $pull: { channels: channelName } }
    );

    res.sendStatus(200);
  } catch (error) {
    console.error(
      "Errore durante l'eliminazione del canale e dei messaggi associati:",
      error
    );
    res.status(500).json({ error: "Errore interno del server." });
  }
};

exports.getSubscribedChannels = async (req, res) => {
  try {
    const { username } = req.params;
    const subscribedChannels = await Channel.find({
      $or: [{ members: username }, { creator: username }],
    });
    res.json(subscribedChannels);
  } catch (error) {
    console.error("Errore durante il recupero dei canali sottoscritti:", error);
    res.status(500).json({ error: "Errore interno del server." });
  }
};

exports.unsubscribe = async (req, res) => {
  try {
    const { username } = req.body;
    const channelId = req.params.id;
    const channel = await Channel.findById(channelId);

    if (!channel) {
      return res.status(404).json({ message: "Canale non trovato" });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User non trovato" });
    }

    channel.members = channel.members.filter((member) => member !== username);
    await channel.save();
    const channelName = channel.name;
    user.channels = user.channels.filter((channel) => channelName !== channel);
    await user.save();

    res.json({ message: "Disiscrizione avvenuta con successo" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.subscribe = async (req, res) => {
  try {
    const { channelId, username } = req.params;
    if (!username) {
      return res
        .status(400)
        .json({ error: "Username è un campo obbligatorio." });
    }
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Canale non trovato" });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User non trovato" });
    }

    if (channel.members.includes(username)) {
      return res
        .status(400)
        .json({ message: "Sei già iscritto a questo canale" });
    }

    channel.members.push(username);
    await channel.save();

    user.channels.push(channel.name);
    await user.save();
    res.json({ message: "Iscrizione avvenuta con successo" });
  } catch (error) {
    console.error("Errore durante la sottoscrizione del canale:", error);
    res.status(500).json({ error: "Errore interno del server." });
  }
};

exports.getAllChannels = async (req, res) => {
  try {
    const filters = {};
    if (req.query.excludeSubscribedBy) {
      filters.members = { $nin: [req.query.excludeSubscribedBy] };
    }

    const channels = await Channel.find(filters);
    res.json(channels);
  } catch (error) {
    console.error("Errore durante il recupero dei canali:", error);
    res.status(500).json({ error: "Errore interno del server." });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { channelId, username } = req.params;

    const channel = await Channel.findById(channelId);
    const user = await User.findOne({ username });

    if (!channel) {
      return res.status(404).json({ error: "Canale non trovato" });
    }
    if (!user) {
      return res.status(404).json({ error: "User non trovato" });
    }

    if (!channel.members.includes(username)) {
      return res
        .status(400)
        .json({ error: "Membro non trovato in questo canale" });
    }

    channel.members.pull(username);
    await channel.save();

    user.channels.pull(channel.name);
    await user.save();

    res.status(200).json({ message: "Membro rimosso con successo" });
  } catch (error) {
    console.error("Errore durante la rimozione del membro dal canale:", error);
    res.status(500).json({
      error:
        "Si è verificato un errore durante la rimozione del membro dal canale",
    });
  }
};

exports.getTopMessages = async (req, res) => {
  try {
    const squealerId = "Squealer";
    const squealerChannels = await Channel.find({ creator: squealerId });
    const topMessagesPerChannel = [];

    for (const channel of squealerChannels) {
      const topMessages = await Message.aggregate([
        { $match: { channel: channel.name } },
        {
          $addFields: {
            totalReactions: { $sum: ["$likeReactions", "$loveReactions"] },
          },
        },
        { $sort: { totalReactions: -1 } },
        { $limit: 5 },
      ]);
      if (topMessages.length > 0) {
        topMessagesPerChannel.push({
          channelName: channel.name,
          messages: topMessages,
        });
      }
    }

    res.json(topMessagesPerChannel);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errore interno del server" });
  }
};

exports.modChannels = async (req, res) => {
  try {
    const { isMod } = req.params;
    const moderatorChannels = await Channel.find({ moderatorChannel: isMod });
    res.json(moderatorChannels);
  } catch (error) {
    console.error("Errore:", error);
    res.status(500).json({ error: "Errore interno del server" });
  }
};

exports.updateChannel = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { newName, description } = req.body;

    if (!newName && !description) {
      return res.status(400).json({
        error:
          "Fornire almeno un campo tra nome e descrizione per aggiornare il canale.",
      });
    }

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ error: "Canale non trovato" });
    }

    const oldName = channel.name;

    // Aggiorna il canale
    channel.name = newName || channel.name;
    channel.description = description || channel.description;
    await channel.save();

    // Aggiorna il nome del canale in tutti i messaggi correlati
    if (newName && oldName !== newName) {
      await Message.updateMany(
        { channel: oldName },
        { $set: { "channel.$": newName } }
      );
    }
    return res
      .status(200)
      .json({ message: "Canale e messaggi aggiornati con successo" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Errore del server" });
  }
};
