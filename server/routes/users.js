const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getFavorites, addFavorite, removeFavorite } = require('../controllers/userController');

router.get('/favorites', auth, getFavorites);
router.post('/favorites', auth, addFavorite);
router.delete('/favorites/:trackId', auth, removeFavorite);

module.exports = router;
