const User = require('../models/user');
const Channel = require('../models/channel');
const Message = require('../models/message');

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
      { $push: { createdChannels: name, channels: name } }
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
