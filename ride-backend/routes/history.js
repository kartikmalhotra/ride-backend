const express = require('express');
const router = express.Router();
const { getRiderHistory, getDriverHistory } = require('../controllers/historyController');

router.get('/rider/:userId', getRiderHistory);
router.get('/driver/:userId', getDriverHistory);

module.exports = router;
