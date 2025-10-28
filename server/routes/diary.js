const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { 
  createEntry, 
  getUserEntries, 
  getDailyMoodTrends,
  getMoodRecommendations 
} = require('../controllers/diaryController');

// Create a new diary entry
router.post('/', auth, createEntry);

// Get user's diary entries
router.get('/me', auth, getUserEntries);

// Get mood trends
router.get('/trends', auth, getDailyMoodTrends);

// Get music recommendations based on mood
router.get('/recommendations', auth, getMoodRecommendations);

module.exports = router;