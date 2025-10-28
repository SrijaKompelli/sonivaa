const DiaryEntry = require('../models/DiaryEntry');

exports.createEntry = async (req, res) => {
  try {
    const { track, text, mood } = req.body;

    // Validation
    if (!track) {
      return res.status(400).json({ message: 'Track is required' });
    }
    if (!mood) {
      return res.status(400).json({ message: 'Mood is required' });
    }
    const validMoods = ['happy', 'sad', 'romantic', 'energetic', 'peaceful', 'nostalgic', 'party'];
    if (!validMoods.includes(mood)) {
      return res.status(400).json({ message: 'Invalid mood. Valid moods: ' + validMoods.join(', ') });
    }

    // Check if track exists
    const Track = require('../models/Track');
    const trackExists = await Track.findById(track);
    if (!trackExists) {
      return res.status(400).json({ message: 'Track not found' });
    }

    const entry = new DiaryEntry({ user: req.user._id, track, text, mood });
    await entry.save();
    res.json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getUserEntries = async (req, res) => {
  try {
    const entries = await DiaryEntry.find({ user: req.user._id }).populate('track').sort('-createdAt');
    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getDailyMoodTrends = async (req, res) => {
  try {
    const trends = await DiaryEntry.aggregate([
      { $match: { user: req.user._id } },
      { $project: { mood: 1, day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } } },
      { $group: { _id: { day: '$day', mood: '$mood' }, count: { $sum: 1 } } },
      { $sort: { '_id.day': -1 } }
    ]);
    res.json(trends);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getMoodRecommendations = async (req, res) => {
  try {
    const { mood } = req.query;
    if (!mood) return res.status(400).json({ message: 'Mood required' });
    const entries = await DiaryEntry.find({ user: req.user._id, mood }).populate('track');
    const tracks = entries.map(e => e.track).filter(Boolean);
    res.json(tracks);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};