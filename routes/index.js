const express = require('express');
const path = require('path');
const router = express.Router();

// Home route
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/index.html'));
});

// Webhook verification endpoint (GET)
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('Webhook verification attempt:', { mode, token, challenge });

  if (mode && token) {
    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
      console.log('Webhook verified successfully');
      res.status(200).send(challenge);
    } else {
      console.log('Webhook verification failed: Token mismatch');
      res.sendStatus(403);
    }
  } else {
    console.log('Webhook verification failed: Missing parameters!');
    res.sendStatus(400);
  }
});

// Webhook event handler (POST)
router.post('/webhook', (req, res) => {
  console.log('Received webhook payload:', req.body);
  
  const { type, data } = req.body;
  
  // Process the webhook data based on type
  switch(type) {
    case 'mention':
      console.log('Processing mention:', data);
      break;

    default:
      console.log('Unhandled webhook type:', type);
  }

  res.status(200).json({
    message: 'Webhook received',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
