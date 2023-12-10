const User = require('../models/user');
const Channel = require('../models/channel');
const Message = require('../models/message');
const user = require('../models/user');

exports.createChannel = async (req, res) => {
  try {
    const { name, description, creator } = req.body;

    // Verifica se esiste già un canale con lo stesso nome
    const existingChannel = await Channel.findOne({ name });
    if (existingChannel) {
      return res.status(400).json({ error: "Un canale con lo stesso nome esiste già." });
    }

    // Crea un nuovo canale
    const newChannel = new Channel({
      name,
      description,
      creator,
      members: [creator], // Aggiunge il creatore come membro iniziale del canale
    });

    await newChannel.save();

    // Aggiunge il canale agli array dello user
    await User.updateOne(
      { username: creator },
      { $push: { createdChannels: name} }
    );

    res.status(201).json({ message: "Canale creato con successo.", channel: newChannel });
  } catch (error) {
    console.error("Errore durante la creazione del canale:", error);
    res.status(500).json({ error: "Errore interno del server." });
  }
}

exports.yourChannels = async (req, res) => {
  try {
    const { creator } = req.query;

    // Trova i canali in cui l'utente è il creatore
    const userChannels = await Channel.find({ creator });

    res.json(userChannels);
  } catch (error) {
    console.error("Errore durante il recupero dei canali:", error);
    res.status(500).json({ error: "Errore interno del server." });
  }
};

exports.deleteChannel = async (req, res) => {
  try {
    const channelId = req.params.channelId;
    const { username } = req.body;

    // Step 1: Elimina il canale dal database
    await Channel.findByIdAndDelete(channelId);

    // Step 2: Elimina tutti i messaggi associati a quel canale
    await Message.deleteMany({ channel: channelId });

    // Step 3: Rimuovi il canale dal campo `channels` di tutti gli utenti iscritti
    await User.updateMany(
      { channels: channelId },
      { $pull: { channels: channelId } }
    );

    // Step 4: Rimuovi il canale dal campo `createdChannels` del creatore
    await User.updateOne(
      { username },
      { $pull: { createdChannels: channelId } }
    );

    // Restituisci una risposta di successo
    res.sendStatus(200);
  } catch (error) {
    console.error("Errore durante l'eliminazione del canale:", error);
    res.status(500).json({ error: "Errore interno del server." });
  }
}


exports.getSubscribedChannels = async (req, res) => {
  try {
    const username = req.params.username;
    const subscribedChannels = await Channel.find({ members: username });
    res.json(subscribedChannels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.unsubscribe = async (req, res) => {
  try {
    const { username } = req.body;
    const channelId = req.params.id;
    const channel = await Channel.findById(channelId);

    if (!channel) {
      return res.status(404).json({ message: 'Canale non trovato' });
    }

    channel.members = channel.members.filter(member => member !== username);
    await channel.save();
    
    res.json({ message: 'Disiscrizione avvenuta con successo' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.subscribe = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { username } = req.body;

    console.log(channelId)
    console.log(username)
    
    const channel = await Channel.findById(channelId);

    console.log(channel)

    if (!channel) {
      return res.status(404).json({ message: 'Canale non trovato' });
    }

    const user = await User.findOne({username})

    if (!user) {
      return res.status(404).json({ message: 'User non trovato' });
    }

    // Verifica se l'utente è già iscritto al canale
    if (channel.members.includes(username)) {
      return res.status(400).json({ message: 'Sei già iscritto a questo canale' });
    }

    // Aggiungi l'utente come membro del canale
    channel.members.push(username);
    await channel.save();

    user.channels.push(channel.name);
    await user.save();
    res.json({ message: 'Iscrizione avvenuta con successo' });
  } catch (error) {
    console.error("Errore durante la sottoscrizione del canale:", error);
    res.status(500).json({ error: "Errore interno del server." });
  }
};

exports.getAllChannels = async (req, res) => {
  try {
    const { username } = req.params;

    // Trova tutti i canali eccetto quelli a cui l'utente è iscritto
    const allChannels = await Channel.find({ members: { $nin: [username] } });

    res.json(allChannels);
  } catch (error) {
    console.error("Errore durante il recupero di tutti i canali:", error);
    res.status(500).json({ error: "Errore interno del server." });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { username } = req.body;

    const channel = await Channel.findById(channelId);
    const user = await User.findOne({username})

    if (!channel) {
      return res.status(404).json({ error: 'Canale non trovato' });
    }
    if (!user) {
      console.log("zio pera 2")
      return res.status(404).json({ error: 'User non trovato' });
    }

    // Verifica se il membro è effettivamente presente nel canale
    if (!channel.members.includes(username)) {
      return res.status(400).json({ error: 'Membro non trovato in questo canale' });
    }

    // Rimuovi il membro dal canale
    channel.members.pull(username);
    await channel.save();

    user.channels.pull(channel.name)
    await user.save();

    res.status(200).json({ message: 'Membro rimosso con successo' });
  } catch (error) {
    console.error('Errore durante la rimozione del membro dal canale:', error);
    res.status(500).json({ error: 'Si è verificato un errore durante la rimozione del membro dal canale' });
  }
}
