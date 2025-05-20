const express = require('express');
const bodyParser = require('body-parser');
const xhub = require('express-x-hub');

// Initialize express app
const app = express();

// Environment variables
const PORT = process.env.PORT || 8080;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'token';
const APP_SECRET = process.env.APP_SECRET || 'your_app_secret';

// Middleware
app.use(xhub({ algorithm: 'sha1', secret: APP_SECRET }));
app.use(bodyParser.json());

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
  // Verify webhook signature
  if (!req.isXHubValid()) {
    console.log('Warning - request header X-Hub-Signature not present or invalid');
    return res.sendStatus(401);
  }

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
        // Process each entry
        console.log('Processing entry:', entry.id);
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
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Webhook URL: http://your-domain/instagram`);
  console.log(`Verify Token: ${VERIFY_TOKEN}`);
});
app.listen();