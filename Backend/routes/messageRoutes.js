const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

router.post('/create', (req, res) => {
    console.log(req.body);
    console.log('Richiesta ricevuta su /create');
    messageController.createMessage(req, res);
  });

module.exports = router;