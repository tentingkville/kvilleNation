const express = require('express');
require('dotenv').config(); 
const app = express();
const PORT = process.env.PORT || 8081;
const url = process.env.MONGO_URL;
const mongoose = require('mongoose');
const profileRoutes = require('./routes/userRoutes');

app.use(express.json()); // Use Express' built-in JSON parser

// Connect to MongoDB
mongoose.connect(url)
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB:', err));

// Middlewares for CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

app.use('/api/profile', profileRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
