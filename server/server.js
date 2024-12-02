const express = require('express');
const axios = require('axios');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

const PORT = process.env.PORT || 8081;

// Middleware
app.use(cors());
app.use(express.json());

// Global variables
let isCheckInProgress = false;
let activeTents = [];
let numCheckers = 1; // Initialize numCheckers

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('startCheck', (data) => {
    const { tents, numCheckers: clientNumCheckers } = data;
    if (isCheckInProgress) {
      socket.emit('checkAlreadyStarted');
    } else {
      isCheckInProgress = true;
      numCheckers = clientNumCheckers || 1; // Update numCheckers
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
      activeTents = assignedTents; // Set active tents with groupIndex
      console.log('Assigned Tents with groupIndex:', activeTents);
      io.emit('checkStarted', activeTents);
      console.log('A new check has started');
    }
  });

  socket.on('cancelCheck', () => {
    isCheckInProgress = false;
    activeTents = [];
    numCheckers = 1; // Reset numCheckers
    io.emit('checkCanceled');
    console.log('Check canceled');
  });

  socket.on('updateTentStatus', (data) => {
    // Update activeTents to remove the processed tent
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
      order: record.fields['Order'],
      captain: record.fields['Captain'],
      members: record.fields['Members'],
      type: record.fields['Type'],
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
    numCheckers = 1; // Reset numCheckers
    io.emit('checkCanceled');
    res.status(200).send('Check canceled successfully');
    console.log('Check canceled successfully');
  } catch (error) {
    console.error('Error canceling check:', error.message);
    res.status(500).send('Failed to cancel check');
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});