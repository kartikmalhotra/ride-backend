const express = require('express');
const router = express.Router();
const { addRating, getUserRatings } = require('../controllers/ratingController');

router.post('/', addRating);
router.get('/:userId', getUserRatings);

module.exports = router;
