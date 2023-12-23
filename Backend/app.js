const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const Channel = require('./models/channel');

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
  Channel.findOne({ name: 'public' }).then(channel => {
    if (!channel) {
      const publicChannel = new Channel({ name: 'public', creator: 'Squealer' });
      publicChannel.save()
        .then(() => console.log('Canale "public" creato con successo.'))
        .catch(err => console.error('Errore durante il salvataggio del canale:', err));
    }
  }).catch(err => console.error('Errore durante la ricerca del canale:', err));
}).catch(err => console.error('MongoDB connection error:', err));


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.on('connected', console.error.bind(console, 'MongoDB connected:'));

const channel = Channel.findOne({ name: 'public' });
if (!channel) {
  const publicChannel = new Channel({ name: 'public', founder: 'Squealer' });
  publicChannel.save();
}

const { checkAndSendTempMessages } = require('./background-task/tempMessageTask');
checkAndSendTempMessages();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.use('/messages', messageRoutes);


module.exports = app;
