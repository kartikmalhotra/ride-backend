const { pool } = require('../config/db');

async function getStats(req, res) {
    try {
        const [u, r, rq] = await Promise.all([
            pool.query('SELECT COUNT(*) FROM users'),
            pool.query('SELECT COUNT(*) FROM rides'),
            pool.query('SELECT COUNT(*) FROM requests')
        ]);

        res.json({
            total_users: Number(u.rows[0].count),
            total_rides: Number(r.rows[0].count),
            total_requests: Number(rq.rows[0].count),
        });
    } catch (err) {
        console.error('❌ getStats error:', err);
        res.status(500).json({ error: 'Server error' });
    }
}

module.exports = { getStats };
