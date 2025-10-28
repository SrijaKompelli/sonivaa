const Playlist = require('../models/Playlist');
const Track = require('../models/Track');

exports.createPlaylist = async (req, res) => {
  try {
    const { title, description, moodTags, isPublic } = req.body;

    // Validation
    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Title is required and cannot be empty' });
    }
    if (moodTags && !Array.isArray(moodTags)) {
      return res.status(400).json({ message: 'Mood tags must be an array' });
    }
    const validMoods = ['happy', 'sad', 'romantic', 'energetic', 'peaceful', 'nostalgic', 'party'];
    if (moodTags && moodTags.some(tag => !validMoods.includes(tag))) {
      return res.status(400).json({ message: 'Invalid mood tag. Valid moods: ' + validMoods.join(', ') });
    }

    const playlist = new Playlist({
      title: title.trim(),
      description: description ? description.trim() : '',
      moodTags: moodTags || [],
      isPublic: isPublic || false,
      owner: req.user._id
    });
    await playlist.save();
    res.json(playlist);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getMyPlaylists = async (req, res) => {
  try {
    const lists = await Playlist.find({ owner: req.user._id }).populate('tracks');
    res.json(lists);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.updatePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    if (!playlist.owner.equals(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const { title, description, tracks, moodTags, isPublic } = req.body;
    playlist.title = title ?? playlist.title;
    playlist.description = description ?? playlist.description;
    if (tracks) playlist.tracks = tracks;
    playlist.moodTags = moodTags ?? playlist.moodTags;
    playlist.isPublic = isPublic ?? playlist.isPublic;
    await playlist.save();
    res.json(playlist);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    if (!playlist.owner.equals(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    await playlist.remove();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};