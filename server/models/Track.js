const mongoose = require('mongoose');

const TrackSchema = new mongoose.Schema({
  fmaId: { type: String, index: true },
  title: String,
  artist: String,
  genre: String,
  coverImage: String,
  url: String,
  duration: Number,
  metadata: Object,
  moods: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Track', TrackSchema);