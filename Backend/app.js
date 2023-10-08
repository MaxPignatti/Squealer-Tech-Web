const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors'); // Import the cors middleware

const app = express();
const port = 3500;

// Load environment variables
require('./config/env');

app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend's origin
  credentials: true, // You may need this if you are sending cookies or sessions
}));
app.use(bodyParser.json());
app.use(cookieParser());

// Routes
const authRoutes = require('./routes/authRoutes');
const secureRoutes = require('./routes/secureRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');

app.use(authRoutes);
app.use(secureRoutes);
app.use(userRoutes);

mongoose.connect('mongodb://localhost:27017/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.on('connected', console.error.bind(console, 'MongoDB connected:'));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.use('/messages', messageRoutes);

module.exports = app;
