const User = require('../models/user');
const Channel = require('../models/channel');

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
