const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const redis = require('../config/redis');

router.get('/', async (req, res) => {
  try {
    // Test Postgres
    const result = await pool.query('SELECT NOW() AS server_time');
    // Test Redis
    await redis.set('ping', 'pong');
    const ping = await redis.get('ping');

    res.json({
      message: 'Backend working ✅',
      postgres_time: result.rows[0].server_time,
      redis_ping: ping
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
