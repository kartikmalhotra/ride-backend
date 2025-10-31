// routes/rides.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { findRide, selectMatch } = require('../controllers/requestController');
const { offerRide, getRide, startRide, endRide } = require('../controllers/rideController');

router.post('/offer', auth, offerRide);
router.post('/:rideId/start', auth, startRide);
router.post('/:rideId/end', auth, endRide);
router.post('/find', auth, findRide);
router.post('/:requestId/select', auth, selectMatch);

module.exports = router;
