const express = require('express');
const router = express.Router();
const { auth, authorizeRole } = require('../middleware/auth');
const { getStats, listUsers } = require('../controllers/adminController');

router.get('/stats', auth, authorizeRole('admin'), getStats);
router.get('/users', auth, authorizeRole('admin'), listUsers);

module.exports = router;