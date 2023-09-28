const express = require('express')
var bodyparser = require('body-parser')
const app = express()
var mongoose = require('mongoose')

/*CAMPI PER USER:
Nome
Cognome
Foto profilo
Nome utente
Email 
Password
Caratteri rimanenti (giorno, settimana, mese)
debito caratteri
Canali a cui partecipa
tipo di account
Social media manager*/

mongoose.connect("mongodb://localhost:27017/test", { useUnifiedTopology: true, useNweUrlParser: true })
const schema = new mongoose.schema({
    nome: String,
    cognome: String,
    foto_profilo: String,
    nome_utente: String,
    email: String,
    password: String,
    rem_char: Number,
    deb_char: Number,
    channel: NodeList,
    account_type: Number,
    smm: Boolean
})
