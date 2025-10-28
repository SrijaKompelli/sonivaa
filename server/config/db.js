const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mern-music';
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected');
    // seed sample tracks if database empty
    try {
      const { seedSampleTracks } = require('../utils/seed');
      seedSampleTracks();
    } catch (err) {
      console.warn('Seed skipped:', err.message);
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectDB;