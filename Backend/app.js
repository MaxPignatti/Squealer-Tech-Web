const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors'); // Import the cors middleware
const Channel = require('./models/channel');

const app = express();
const port = 3500;

// Load environment variables
require('./config/env');


app.use(bodyParser.json({ limit: '10mb' })); // Imposta il limite di dimensioni del body a 100 MB

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

app.use(authRoutes);
app.use(secureRoutes);
app.use(userRoutes);
app.use(messageRoutes);
app.use(channelRoutes);



mongoose.connect('mongodb://localhost:27017/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.on('connected', console.error.bind(console, 'MongoDB connected:'));

const channel = Channel.findOne({ name: 'public' });
if (!channel) {
  const publicChannel = new Channel({ name: 'public', founder: 'Squealer'});
  publicChannel.save();
}
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.use('/messages', messageRoutes);

module.exports = app;
