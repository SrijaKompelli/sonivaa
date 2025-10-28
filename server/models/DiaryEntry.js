const mongoose = require('mongoose');

const DiaryEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  track: { type: mongoose.Schema.Types.ObjectId, ref: 'Track', required: true },
  text: String,
  mood: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DiaryEntry', DiaryEntrySchema);