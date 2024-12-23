const express = require('express');
const axios = require('axios');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();
const UserRoute = require('./routes/userRoutes');
const Pusher = require('pusher');

// Initialize Pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
});
const app = express();

// Allowed Origins
const allowedOrigins = ['http://localhost:3000', 'https://kville-nation-frontend.vercel.app'];

app.use(
  cors({
    origin: function (origin, callback) {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

// Configure session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      ttl: 14 * 24 * 60 * 60,
    }),
    cookie: {
      secure: false,
      httpOnly: true,
    },
  })
);

// Global Variables
let isCheckInProgress = false;
let activeTents = [];
let numCheckers = 1;

// Route to start check
app.post('/api/start-check', (req, res) => {
  const { tents, numCheckers: clientNumCheckers } = req.body;
  if (isCheckInProgress) {
    return res.status(400).json({ error: 'Check already started' });
  }

  isCheckInProgress = true;
  numCheckers = clientNumCheckers || 1;
  const chunkSize = Math.ceil(tents.length / numCheckers);
  let assignedTents = [...tents];

  for (let i = 0; i < numCheckers; i++) {
    const start = i * chunkSize;
    const end = start + chunkSize;
    const groupTents = assignedTents.slice(start, end);
    groupTents.forEach((tent) => {
      tent.groupIndex = i;
    });
  }

  activeTents = assignedTents;

  // Trigger Pusher event instead of io.emit
  pusher.trigger('kville-nation', 'checkStarted', activeTents);
  console.log('A new check has started');
  res.status(200).json({ success: true });
});

// Route to cancel the check
app.post('/api/cancel-check', (req, res) => {
  try {
    isCheckInProgress = false;
    activeTents = [];
    numCheckers = 1;

    // Trigger Pusher event
    pusher.trigger('kville-nation', 'checkCanceled', {});
    console.log('Check canceled successfully');
    res.status(200).send('Check canceled successfully');
  } catch (error) {
    console.error('Error canceling check:', error.message);
    res.status(500).send('Failed to cancel check');
  }
});

// Route to update tent status (Miss or Make)
app.post('/api/tent-checks/update', async (req, res) => {
  const { id, misses, lastCheck, dateOfLastCheck, lastMissLM, dateOfLastMiss } = req.body;

  const fieldsToUpdate = {};
  if (misses !== undefined) fieldsToUpdate['Number of Misses'] = misses;
  if (lastCheck) fieldsToUpdate['Last Check'] = lastCheck;
  if (dateOfLastCheck) fieldsToUpdate['Date of Last Check'] = dateOfLastCheck;
  if (lastMissLM) fieldsToUpdate['Last Miss LM'] = lastMissLM;
  if (dateOfLastMiss) fieldsToUpdate['Date of Last Miss'] = dateOfLastMiss;

  try {
    await axios.patch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_ID}/${id}`,
      { fields: fieldsToUpdate },
      { headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}` } }
    );

    activeTents = activeTents.filter((tent) => tent.id !== id);
    pusher.trigger('kville-nation', 'tentStatusUpdated', { id });

    res.status(200).send('Tent data updated successfully');
  } catch (error) {
    console.error('Error updating tent data in Airtable:', error.response?.data || error.message);
    res.status(500).send('Failed to update tent data');
  }
});

// Route to get tent data
app.get('/api/tent-checks', async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_ID}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        },
      }
    );

    const tents = response.data.records.map((record) => ({
      id: record.id,
      order: record.fields['Order'] || 0,
      captain: record.fields['Captain'] || '',
      members: record.fields['Members'] || '',
      type: record.fields['Type'] || '',
      dayNumber: record.fields['Day Number'] || null,
      nightNumber: record.fields['Night Number'] || null,
      numberOfMisses: record.fields['Number of Misses'] || 0,
      lastCheck: record.fields['Last Check'] || null,
      dateOfLastCheck: record.fields['Date of Last Check'] || null,
      lastMissLM: record.fields['Last Miss LM'] || null,
      dateOfLastMiss: record.fields['Date of Last Miss'] || null,
    }));

    tents.sort((a, b) => a.order - b.order);
    res.json(tents);
  } catch (error) {
    console.error('Error fetching tent data from Airtable:', error.response?.data || error.message);
    res.status(500).send('Failed to fetch tent data');
  }
});

// Route to get check status
app.get('/api/check-status', (req, res) => {
  try {
    res.json({
      isCheckInProgress,
      activeTents: isCheckInProgress ? activeTents : [],
    });
  } catch (error) {
    console.error('Error fetching check status:', error.message);
    res.status(500).send('Failed to fetch check status');
  }
});

app.get('/', (req, res) => {
  res.send('Hello from the server side!');
});

// Mount user routes
app.use('/api/profile', UserRoute);


const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// module.exports = app;