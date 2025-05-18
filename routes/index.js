const express = require('express');
const path = require('path');
const router = express.Router();

// Home route
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/index.html'));
});

const verifyToken = 'aS9#mK2$pL5@vN8*qR4&hJ7!wX3^cF6_tY9';

// Webhook verification endpoint (GET)
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('Webhook verification attempt:', { mode, token, challenge });

  if (mode && token) {
    if (mode === 'subscribe' && token === verifyToken) {
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
  // Log the entire request
  console.log('=== Webhook Request Details ===');
  console.log('Headers:', req.headers);
  console.log('Raw Body:', req.body);
  console.log('Body Type:', typeof req.body);
  console.log('Body Keys:', Object.keys(req.body));
  console.log('===========================');

  if (req.body && typeof req.body === 'object') {
    if (req.body.object === 'instagram') {
      console.log('Instagram webhook received');
      if (req.body.entry) {
        console.log('Entries:', JSON.stringify(req.body.entry, null, 2));
      }
    } else {
      console.log('Unknown webhook object type:', req.body.object);
    }
  } else {
    console.log('Empty or invalid request body received');
  }

  res.status(200).json({
    message: 'Webhook received',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
