// routes/requests.js
const express = require('express');
const router = express.Router();
const { findRide, selectMatch } = require('../controllers/requestController');

router.post('/find', findRide);                 // create request & return matches
router.post('/:requestId/select', selectMatch); // rider selects particular ride

module.exports = router;
