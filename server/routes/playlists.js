const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { createPlaylist, getMyPlaylists, updatePlaylist, deletePlaylist } = require('../controllers/playlistController');

router.post('/', auth, createPlaylist);
router.get('/me', auth, getMyPlaylists);
router.put('/:id', auth, updatePlaylist);
router.delete('/:id', auth, deletePlaylist);

module.exports = router;