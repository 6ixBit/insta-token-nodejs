const express = require('express');
const bodyParser = require('body-parser');
const xhub = require('express-x-hub');

// Initialize express app
const app = express();

// Environment variables
const PORT = process.env.PORT || 8080;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'token';
const APP_SECRET = process.env.APP_SECRET || 'your_app_secret';

// Middleware - Move xhub after bodyParser
app.use(bodyParser.json());
app.use(xhub({ algorithm: 'sha1', secret: APP_SECRET }));

// Store received updates
const received_updates = [];

// Routes
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Instagram webhook server is running',
    updates: received_updates
  });
});

// Webhook verification
app.get('/instagram', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified');
    res.status(200).send(challenge);
  } else {
    console.log('Webhook verification failed');
    res.sendStatus(403);
  }
});

// Webhook notifications
app.post('/instagram', (req, res) => {
  // Log headers for debugging
  console.log('Headers:', req.headers);
  
  // Log the webhook
  console.log('Instagram webhook received:', {
    timestamp: new Date().toISOString(),
    body: req.body
  });

  // Store the update
  received_updates.unshift(req.body);

  // Process the webhook data
  try {
    const { object, entry } = req.body;
    
    if (object === 'instagram' && entry) {
      entry.forEach(entry => {
        console.log('\n=== Instagram Webhook Entry ===');
        console.log('Entry ID:', entry.id);
        
        // Log changes if they exist
        if (entry.changes) {
          console.log('\nChanges:');
          entry.changes.forEach(change => {
            console.log('Field:', change.field);
            console.log('Value:', JSON.stringify(change.value, null, 2));
          });
        }

        // Log messaging if it exists
        if (entry.messaging) {
          console.log('\nMessaging:');
          entry.messaging.forEach(message => {
            console.log('Sender ID:', message.sender.id);
            console.log('Recipient ID:', message.recipient.id);
            console.log('Timestamp:', message.timestamp);
            if (message.message) {
              console.log('Message:', message.message);
            }
          });
        }

        // Log mentions if they exist
        if (entry.mentions) {
          console.log('\nMentions:');
          entry.mentions.forEach(mention => {
            console.log('Media ID:', mention.media_id);
            console.log('Comment ID:', mention.comment_id);
            console.log('Username:', mention.username);
          });
        }

        console.log('===========================\n');
      });
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.sendStatus(500);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Webhook URL: https://insta-token-nodejs-production.up.railway.app/instagram`);
  console.log(`Verify Token: ${VERIFY_TOKEN}`);
  console.log(`App Secret: ${APP_SECRET}`);
});