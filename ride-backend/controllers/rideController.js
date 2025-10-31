// controllers/rideController.js
const { createRide, getRideById } = require('../models/rideModels');

async function offerRide(req, res) {
    try {
        const { driver_id, origin_lat, origin_lng, dest_lat, dest_lng, seats } = req.body;
        if (!driver_id || !origin_lat || !origin_lng || !dest_lat || !dest_lng) {
            return res.status(400).json({ error: 'driver_id and coords required' });
        }
        const ride = await createRide(driver_id, origin_lat, origin_lng, dest_lat, dest_lng, seats || 1);
        res.status(201).json(ride);
    } catch (err) {
        console.error('❌ offerRide error', err);
        res.status(500).json({ error: 'server error' });
    }
}

async function getRide(req, res) {
    try {
        const ride = await getRideById(req.params.rideId);
        if (!ride) return res.status(404).json({ error: 'ride not found' });
        res.json(ride);
    } catch (err) {
        res.status(500).json({ error: 'server error' });
    }
}

// Start Ride
async function startRide(req, res) {
    try {
        const { rideId } = req.params;

        // Update status
        await pool.query("UPDATE rides SET status='started' WHERE id=$1", [rideId]);
        res.json({ message: '🚗 Ride started successfully!' });
    } catch (err) {
        console.error('❌ startRide error:', err);
        res.status(500).json({ error: 'Server error' });
    }
}

// End Ride
async function endRide(req, res) {
    try {
        const { rideId } = req.params;

        // Fetch ride coords
        const result = await pool.query(
            'SELECT origin_lat, origin_lng, dest_lat, dest_lng FROM rides WHERE id=$1',
            [rideId]
        );

        if (!result.rows.length) return res.status(404).json({ error: 'Ride not found' });

        const ride = result.rows[0];
        const distanceKm = haversine(
            ride.origin_lat,
            ride.origin_lng,
            ride.dest_lat,
            ride.dest_lng
        );
        const fare = calculateFare(distanceKm);

        // Update ride + requests table
        await pool.query("UPDATE rides SET status='completed' WHERE id=$1", [rideId]);
        await pool.query(
            "UPDATE requests SET fare=$1, status='completed' WHERE matched_ride_id=$2",
            [fare, rideId]
        );

        res.json({
            message: '✅ Ride completed successfully!',
            distanceKm,
            fare,
        });
    } catch (err) {
        console.error('❌ endRide error:', err);
        res.status(500).json({ error: 'Server error' });
    }
}

module.exports = { startRide, endRide };


module.exports = { offerRide, getRide, startRide, endRide };
