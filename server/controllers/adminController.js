const User = require('../models/User');
const Playlist = require('../models/Playlist');
const Track = require('../models/Track');

exports.getStats = async (req, res) => {
  try {
    const users = await User.countDocuments();
    const playlists = await Playlist.countDocuments();
    const tracks = await Track.countDocuments();
    res.json({ users, playlists, tracks });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};