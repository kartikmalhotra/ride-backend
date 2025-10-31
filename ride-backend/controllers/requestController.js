// controllers/requestController.js
const redis = require('../config/redis');
const { createRequest, setRequestMatched } = require('../models/requestModels');
const { getActiveRidesByIds, lockSeat } = require('../models/rideModels');
const { haversine } = require('../utils/geo');
const { calculateFare } = require('../utils/fare');

const MAX_DETOUR_KM = Number(process.env.MAX_DETOUR_KM || 3);
const NEARBY_KM = Number(process.env.NEARBY_KM || 5);

async function findRide(req, res) {
    try {
        const { rider_id, origin_lat, origin_lng, dest_lat, dest_lng } = req.body;
        if (!rider_id || !origin_lat || !origin_lng || !dest_lat || !dest_lng) {
            return res.status(400).json({ error: 'missing params' });
        }

        const request = await createRequest(rider_id, origin_lat, origin_lng, dest_lat, dest_lng);

        // find nearby active rides using Redis GEO
        const nearby = await redis.georadius('drivers:geo', origin_lng, origin_lat, NEARBY_KM, 'km', 'WITHCOORD', 'COUNT', 20, 'ASC');
        const ids = nearby.map(n => n[0]); // driver/ride ids stored as member

        let matches = [];
        if (ids.length) {
            const rides = await getActiveRidesByIds(ids);
            for (const ride of rides) {
                const d1 = haversine(origin_lat, origin_lng, ride.origin_lat, ride.origin_lng);
                const d2 = haversine(dest_lat, dest_lng, ride.dest_lat, ride.dest_lng);
                if (d1 <= MAX_DETOUR_KM && d2 <= MAX_DETOUR_KM) {
                    const riderDist = haversine(origin_lat, origin_lng, dest_lat, dest_lng);
                    const fare = calculateFare(riderDist);
                    matches.push({ ride_id: ride.id, driver_id: ride.driver_id, detour1: d1, detour2: d2, fare });
                }
            }
        }

        // return request + matches to client
        return res.status(201).json({ request, matches });
    } catch (err) {
        console.error('❌ findRide error', err);
        res.status(500).json({ error: 'server error' });
    }
}

async function selectMatch(req, res) {
    try {
        const { requestId } = req.params;
        const { rideId } = req.body;
        // lock seat (DB transaction)
        const ok = await lockSeat(rideId);
        if (!ok) return res.status(400).json({ error: 'No seats available' });

        // compute fare using request coordinates (fetch request to get coords)
        const r = await (await require('../config/db').pool.query('SELECT * FROM requests WHERE id=$1', [requestId])).rows[0];
        const dist = haversine(r.origin_lat, r.origin_lng, r.dest_lat, r.dest_lng);
        const fare = calculateFare(dist);

        const updated = await setRequestMatched(requestId, rideId, fare);

        // notify driver via Redis/socket layer (we will emit from sockets)
        // For now return matched info
        return res.json({ matched: updated });
    } catch (err) {
        console.error('❌ selectMatch error', err);
        res.status(500).json({ error: 'server error' });
    }
}

module.exports = { findRide, selectMatch };
