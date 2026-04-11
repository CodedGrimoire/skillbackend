const express = require('express');
const router = express.Router();
const { putProfile } = require('../controllers/profile.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.put('/', authenticate, putProfile);

module.exports = router;
