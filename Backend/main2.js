const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require("body-parser")

const mongoDB = "mongodb://localhost:27017/test";
mongoose.connect(mongoDB);
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))
const userSchema = new mongoose.Schema({
    nome: {
      type: String,
      required: true // Add validation for the 'nome' field
    },
});
