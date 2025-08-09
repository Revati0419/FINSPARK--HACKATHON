const express = require('express');
const router = express.Router();
const { sendToDialogflow } = require('../config/dialogflow');

router.post('/whatsapp', async (req, res) => {
  try {
    const incomingMsg = req.body.Body || '';
    const senderId = req.body.From || 'default-session';

    const dialogflowResponse = await sendToDialogflow(incomingMsg, senderId);

    // Reply to WhatsApp using Twilio MessagingResponse
    const MessagingResponse = require('twilio').twiml.MessagingResponse;
    const twiml = new MessagingResponse();
    twiml.message(dialogflowResponse);

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  } catch (error) {
    console.error('Error in WhatsApp route:', error);
    res.status(500).send('Error');
  }
});

module.exports = router;
