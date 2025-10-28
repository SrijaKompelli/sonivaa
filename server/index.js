require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

// connect db
connectDB();

// routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/playlists', require('./routes/playlists'));
app.use('/api/tracks', require('./routes/tracks'));
app.use('/api/diary', require('./routes/diary'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/users', require('./routes/users'));

const port = process.env.PORT || 3002;
app.listen(port, () => console.log(`Server running on port ${port}`));
