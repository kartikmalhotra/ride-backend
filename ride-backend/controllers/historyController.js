const { pool } = require('../config/db');

// Rider history
async function getRiderHistory(req, res) {
    try {
        const { userId } = req.params;
        const result = await pool.query(
            `SELECT * FROM requests WHERE rider_id=$1 ORDER BY created_at DESC`,
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('❌ Rider history error:', err);
        res.status(500).json({ error: 'Server error' });
    }
}

// Driver history
async function getDriverHistory(req, res) {
    try {
        const { userId } = req.params;
        const result = await pool.query(
            `SELECT * FROM rides WHERE driver_id=$1 ORDER BY created_at DESC`,
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('❌ Driver history error:', err);
        res.status(500).json({ error: 'Server error' });
    }
}

module.exports = { getRiderHistory, getDriverHistory };
