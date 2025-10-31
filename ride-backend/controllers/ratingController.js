const { pool } = require('../config/db');

async function addRating(req, res) {
    try {
        const { rater_id, ratee_id, ride_id, score, comment } = req.body;

        if (!rater_id || !ratee_id || !ride_id || !score)
            return res.status(400).json({ error: 'Missing parameters' });

        const result = await pool.query(
            `INSERT INTO ratings (rater_id, ratee_id, ride_id, score, comment)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [rater_id, ratee_id, ride_id, score, comment || null]
        );

        // Update user's average rating
        const avgResult = await pool.query(
            `SELECT AVG(score)::NUMERIC(2,1) AS avg FROM ratings WHERE ratee_id=$1`,
            [ratee_id]
        );
        const avg = avgResult.rows[0].avg;
        await pool.query(`UPDATE users SET rating=$1 WHERE id=$2`, [avg, ratee_id]);

        res.status(201).json({ message: '⭐ Rating added!', rating: result.rows[0] });
    } catch (err) {
        console.error('❌ addRating error:', err);
        res.status(500).json({ error: 'Server error' });
    }
}

async function getUserRatings(req, res) {
    try {
        const { userId } = req.params;
        const result = await pool.query(
            `SELECT * FROM ratings WHERE ratee_id=$1 ORDER BY created_at DESC`,
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('❌ getUserRatings error:', err);
        res.status(500).json({ error: 'Server error' });
    }
}

module.exports = { addRating, getUserRatings };
