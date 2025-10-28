const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { search, saveTrack, getTracks, proxyAudio } = require('../controllers/trackController');

router.get('/search', auth, search);
router.get('/', getTracks);
router.post('/', auth, saveTrack);
router.get('/proxy', proxyAudio);

module.exports = router;
