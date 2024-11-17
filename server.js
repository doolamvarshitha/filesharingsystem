const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const authMiddleware = require('./middleware/authMiddleware');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/auth', authRoutes);
app.use('/files', authMiddleware, fileRoutes);  // Protect file routes

// Start server
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  }))
  .catch(err => console.log(err));
