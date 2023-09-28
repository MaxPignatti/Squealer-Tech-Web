const express = require('express');
const mongoose = require('mongoose');
const app = express.Router();

// Connessione a MongoDB
mongoose.connect("mongodb://localhost:27017/test", {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

// Definizione dello schema del documento
const userSchema = new mongoose.Schema({
  nome: String,
});

// Creazione del modello User basato sullo schema
const User = mongoose.model("UtenteFantastico", userSchema);

// Middleware per l'analisi dei dati del corpo della richiesta
app.use(express.urlencoded({ extended: true }));

// Gestione della richiesta POST per la creazione di un nuovo utente
app.post('/submit-form', async (req, res) => {
  try {
    // Salvataggio del documento nel database
    await User.create(req.body);
    console.log('User saved successfully');
    res.send('User saved successfully');
  } catch (err) {
    console.error('Error saving user:', err);
    res.status(500).send('Internal Server Error');
  }
});
/*
const schema = new mongoose.Schema({
  nome: String,
  cognome: String,
  foto_profilo: String,
  nome_utente: String,
  email: String,
  password: String,
  rem_char: Number,
  deb_char: Number,
  channel: String,
  account_type: Number,
  smm: Boolean
});
const User = mongoose.model("UtenteFantastico", schema);
 */
module.exports = app;