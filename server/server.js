const express = require('express');
const axios = require('axios');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const session = require('express-session'); // Add session support
const MongoStore = require('connect-mongo'); // For MongoDB session storage
require('dotenv').config();
const UserRoute = require('./routes/userRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

const PORT = process.env.PORT || 8081;

// Allowed Origins
const allowedOrigins = ['http://localhost:3000', 'https://kville-nation-frontend.vercel.app'];

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Enable credentials
  })
);
app.use(express.json());

// Configure session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Replace with a secure secret
    resave: false, // Do not resave sessions that have not been modified
    saveUninitialized: false, // Do not save uninitialized sessions
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL, // MongoDB connection string
      ttl: 14 * 24 * 60 * 60, // Session expiration in seconds (14 days)
    }),
    cookie: {
      secure: false, // Set to true if using HTTPS
      httpOnly: true, // Prevent access to cookies via JavaScript
    },
  })
);

// Global Variables
let isCheckInProgress = false;
let activeTents = [];
let numCheckers = 1; // Initialize numCheckers

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('startCheck', (data) => {
    const { tents, numCheckers: clientNumCheckers } = data;
    if (isCheckInProgress) {
      socket.emit('checkAlreadyStarted');
    } else {
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
      io.emit('checkStarted', activeTents);
      console.log('A new check has started');
    }
  });

  socket.on('cancelCheck', () => {
    isCheckInProgress = false;
    activeTents = [];
    numCheckers = 1;
    io.emit('checkCanceled');
    console.log('Check canceled');
  });

  socket.on('updateTentStatus', (data) => {
    activeTents = activeTents.filter((tent) => tent.id !== data.id);
    io.emit('tentStatusUpdated', { id: data.id });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Route to fetch tent data from Airtable
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

    console.log('Transformed tents:', tents);

    tents.sort((a, b) => a.order - b.order);
    res.json(tents);
  } catch (error) {
    console.error('Error fetching tent data from Airtable:', error.response?.data || error.message);
    res.status(500).send('Failed to fetch tent data');
  }
});

// Route to get the current check status
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

// Route to update tent data for Miss or Make
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

    activeTents = activeTents.filter((tent) => tent.id !== id); // Remove the tent from activeTents
    io.emit('tentStatusUpdated', { id });

    res.status(200).send('Tent data updated successfully');
  } catch (error) {
    console.error('Error updating tent data in Airtable:', error.response?.data || error.message);
    res.status(500).send('Failed to update tent data');
  }
});

// Route to cancel the check
app.post('/api/cancel-check', (req, res) => {
  try {
    isCheckInProgress = false;
    activeTents = [];
    numCheckers = 1;
    io.emit('checkCanceled');
    res.status(200).send('Check canceled successfully');
    console.log('Check canceled successfully');
  } catch (error) {
    console.error('Error canceling check:', error.message);
    res.status(500).send('Failed to cancel check');
  }
});

// Mount routes
app.use('/api/profile', UserRoute);

// Start the server
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

module.exports = app;