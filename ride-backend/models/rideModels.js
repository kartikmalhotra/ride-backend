// models/rideModel.js
const { pool } = require('../config/db');



async function createRide(driver_id, origin_lat, origin_lng, dest_lat, dest_lng, seats = 1) {
    const q = `INSERT INTO rides (driver_id, origin_lat, origin_lng, dest_lat, dest_lng, seats, seats_available)
             VALUES ($1,$2,$3,$4,$5,$6,$6) RETURNING *`;
    const r = await pool.query(q, [driver_id, origin_lat, origin_lng, dest_lat, dest_lng, seats]);
    return r.rows[0];
}

async function getActiveRidesByIds(ids = []) {
    if (!ids.length) return [];
    const q = `SELECT * FROM rides WHERE id = ANY($1::uuid[]) AND status='active'`;
    const r = await pool.query(q, [ids]);
    return r.rows;
}

async function getRideById(id) {
    const r = await pool.query(`SELECT * FROM rides WHERE id=$1`, [id]);
    return r.rows[0];
}

async function lockSeat(rideId) {
    // lock the row and decrement seats_available if available
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const sel = await client.query('SELECT seats_available FROM rides WHERE id=$1 FOR UPDATE', [rideId]);
        if (!sel.rows.length) { await client.query('ROLLBACK'); return false; }
        const available = sel.rows[0].seats_available;
        if (available <= 0) { await client.query('ROLLBACK'); return false; }
        await client.query('UPDATE rides SET seats_available = seats_available - 1 WHERE id=$1', [rideId]);
        await client.query('COMMIT');
        return true;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

module.exports = { createRide, getActiveRidesByIds, getRideById, lockSeat };
