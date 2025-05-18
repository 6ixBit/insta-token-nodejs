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
  const { field, value } = req.body;
  
  if (field === 'mentions' && value?.media_id && value?.comment_id) {
    console.log('Mention received:', {
      mediaId: value.media_id,
      commentId: value.comment_id
    });
  } else {
    console.log('Unexpected webhook format:', req.body);
  }

  res.status(200).json({
    message: 'Webhook received',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
