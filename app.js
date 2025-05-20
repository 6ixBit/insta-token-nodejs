const express = require('express');
const bodyParser = require('body-parser');
const xhub = require('express-x-hub');

const app = express();

const PORT = process.env.PORT || 8080;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'token';
const APP_SECRET = process.env.APP_SECRET || 'your_app_secret';

app.use(bodyParser.json());
app.use(xhub({ algorithm: 'sha1', secret: APP_SECRET }));

// Store received updates
const received_updates = [];

function parseWebhookData(update) {
  try {
    const { entry } = update;
    if (!entry || !entry[0]) return null;

    const { time, changes } = entry[0];
    if (!changes || !changes[0]) return null;

    const { field, value } = changes[0];

    if (field === 'mentions') {
      return {
        type: 'mention',
        timestamp: new Date(time * 1000).toISOString(),
        media_id: value.media_id,
        comment_id: value.comment_id
      };
    }

    return null;
  } catch (error) {
    console.error('Error parsing webhook data:', error);
    return null;
  }
}

// Routes
app.get('/', (req, res) => {
  // Parse all updates
  const parsedUpdates = received_updates.map(update => parseWebhookData(update)).filter(Boolean);
  
  res.json({
    status: 'ok',
    message: 'Instagram webhook server is running',
    updates: received_updates,
    parsed_updates: parsedUpdates
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
  console.log('Instagram webhook received:', {
    timestamp: new Date().toISOString(),
    body: req.body
  });

  // Store the update
  received_updates.unshift(req.body);

  // Process the webhook data
  try {
    const parsedData = parseWebhookData(req.body);
    if (parsedData) {
      console.log('Parsed webhook data:', parsedData);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.sendStatus(500);
  }
});

// Error handling middleware
app.use((err, res) => {
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
});