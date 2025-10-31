// models/requestModel.js
const { pool } = require('../config/db');

async function createRequest(rider_id, origin_lat, origin_lng, dest_lat, dest_lng) {
    const q = `INSERT INTO requests (rider_id, origin_lat, origin_lng, dest_lat, dest_lng)
             VALUES ($1,$2,$3,$4,$5) RETURNING *`;
    const r = await pool.query(q, [rider_id, origin_lat, origin_lng, dest_lat, dest_lng]);
    return r.rows[0];
}

async function setRequestMatched(requestId, rideId, fare) {
    const q = `UPDATE requests SET matched_ride_id=$1, fare=$2, status='matched' WHERE id=$3 RETURNING *`;
    const r = await pool.query(q, [rideId, fare, requestId]);
    return r.rows[0];
}

module.exports = { createRequest, setRequestMatched };
