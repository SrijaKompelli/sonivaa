const User = require('../models/User');
const Track = require('../models/Track');

exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    res.json(user.favorites || []);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.addFavorite = async (req, res) => {
  try {
    const { trackId, url, title, artist, genre, coverImage } = req.body;
    let track = null;
    if (trackId) track = await Track.findById(trackId);
    if (!track && url) track = await Track.findOne({ url });
    // If still no track, create minimal record
    if (!track) {
      track = new Track({ title: title || 'Unknown', artist: artist || 'Unknown', genre: genre || '', url: url || '', coverImage, metadata: {}, moods: [] });
      await track.save();
    }
    const user = await User.findById(req.user._id);
    if (!user.favorites.map(id=>id.toString()).includes(track._id.toString())) {
      user.favorites.push(track._id);
      await user.save();
    }
    res.json({ success: true, trackId: track._id });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const { trackId } = req.params;
    const user = await User.findById(req.user._id);
    user.favorites = user.favorites.filter(id => id.toString() !== trackId);
    await user.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
