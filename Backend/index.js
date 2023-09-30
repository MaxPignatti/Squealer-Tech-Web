const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const mongoDB = 'mongodb://localhost:27017/test';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.on('connected', console.error.bind(console, 'MongoDB connected:'));

const app = express();

app.get('/', (req, res) => {
  res.send('hello world')
})

module.exports = app;

/*
// Connessione a MongoDB
mongoose.connect("mongodb://localhost:27017/test", {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

// Definizione dello schema del documento
const userSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true // Add validation for the 'nome' field
  },
});

// Creazione del modello User basato sullo schema
const User = mongoose.model("Usr", userSchema);


// Gestione della richiesta POST per la creazione di un nuovo utente
app.post('/test', async (req, res) => {
  try {
    // Salvataggio del documento nel database
    const newUser = new User(req.body);
    await newUser.save();
    console.log('User saved successfully');
    res.send('User saved successfully');
  } catch (err) {
    console.error('Error saving user:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = app;
*/