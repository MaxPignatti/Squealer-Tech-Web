const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const Channel = require('./models/channel');
const cron = require('node-cron');
const User = require('./models/user'); // Assicurati che il percorso sia corretto
const consts = require('./consts')
const app = express();
const port = 3500;

// Load environment variables
require('./config/env');

app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(cookieParser());

// Routes
const authRoutes = require('./routes/authRoutes');
const secureRoutes = require('./routes/secureRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const channelRoutes = require('./routes/channelRoutes');
const shopRoutes = require('./routes/shopRoutes');

app.use(authRoutes);
app.use(secureRoutes);
app.use(userRoutes);
app.use(messageRoutes);
app.use(channelRoutes);
app.use(shopRoutes);

/*mongoose.connect('mongodb://site222327:uo9feeGu@mongo_site222327:27017/test', { Pazzesco non funziona niente :D
  useNewUrlParser: true,
  useUnifiedTopology: true
}); */

mongoose.connect('mongodb://localhost:27017/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  Channel.findOne({ name: 'PUBLIC' }).then(channel => {
    if (!channel) {
      const publicChannel = new Channel({ name: 'PUBLIC', creator: 'Squealer' });
      publicChannel.save()
        .then(() => console.log('Canale "PUBLIC" creato con successo.'))
        .catch(err => console.error('Errore durante il salvataggio del canale:', err));
    }
  }).catch(err => console.error('Errore durante la ricerca del canale:', err));
}).catch(err => console.error('MongoDB connection error:', err));


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.on('connected', console.error.bind(console, 'MongoDB connected:'));

Channel.findOne({ name: 'CONTROVERSIAL' }).then(channel => {
  if (!channel) {
    const controversialChannel = new Channel({ name: 'CONTROVERSIAL', creator: 'Squealer', moderatorChannel: true });
    controversialChannel.save()
      .then(() => console.log('Canale "CONTROVERSIAL" creato con successo.'))
      .catch(err => console.error('Errore durante il salvataggio del canale:', err));
  }
}).catch(err => console.error('Errore durante la ricerca del canale:', err));

Channel.findOne({ name: 'SQUEALER-UPDATES' }).then(channel => {
  if (!channel) {
    const updatesChannel = new Channel({ name: 'SQUEALER-UPDATES', creator: 'Squealer', moderatorChannel: true });
    updatesChannel.save()
      .then(() => console.log('Canale "SQUEALER-UPDATES" creato con successo.'))
      .catch(err => console.error('Errore durante il salvataggio del canale:', err));
  }
}).catch(err => console.error('Errore durante la ricerca del canale:', err));

Channel.findOne({ name: 'EMERGENCY' }).then(channel => {
  if (!channel) {
    const emergencyChannel = new Channel({ name: 'EMERGENCY', creator: 'Squealer', moderatorChannel: true });
    emergencyChannel.save()
      .then(() => console.log('Canale "EMERGENCY" creato con successo.'))
      .catch(err => console.error('Errore durante il salvataggio del canale:', err));
  }
}).catch(err => console.error('Errore durante la ricerca del canale:', err));

const { checkAndSendTempMessages } = require('./background-task/tempMessageTask');
checkAndSendTempMessages();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Reset giornaliero
cron.schedule('0 0 * * *', async () => {
  await User.updateMany({}, { $set: { dailyChars: consts.dailyCharacters } });
  console.log('Reset giornaliero eseguito');
});

// Reset settimanale (alla mezzanotte di lunedì)
cron.schedule('0 0 * * 1', async () => {
  await User.updateMany({}, { $set: { weeklyChars: consts.weeklyCharacters } });
  console.log('Reset settimanale eseguito');
});

// Reset mensile (il primo di ogni mese)
cron.schedule('0 0 1 * *', async () => {
  await User.updateMany({}, { $set: { monthlyChars: consts.monthlyCharacters } });
  console.log('Reset mensile eseguito');
});

// Cron job per selezionare e pubblicare il messaggio più controverso
cron.schedule('*/30 * * * *', async () => {
  try {
    // Trova tutti i messaggi controversi
    const controversialMessages = await Message.find({ _id: { $in: user.controversialMessages } });

    let mostControversialMessage = null;
    let highestReactionCount = 0;

    controversialMessages.forEach(message => {
      if (!message.channel.includes('CONTROVERSIAL')) {
        const totalReactions = message.positiveReactions + message.negativeReactions;
        if (totalReactions > highestReactionCount) {
          mostControversialMessage = message;
          highestReactionCount = totalReactions;
        }
      }
    });

    // Aggiungi il canale "CONTROVERSIAL" al messaggio selezionato
    if (mostControversialMessage) {
      mostControversialMessage.channel.push('CONTROVERSIAL');
      await mostControversialMessage.save();
      console.log('Messaggio più controverso pubblicato nel canale "CONTROVERSIAL".');
    }
  } catch (error) {
    console.error('Errore durante la selezione del messaggio controverso:', error);
  }
});

app.use('/messages', messageRoutes);

module.exports = app;
