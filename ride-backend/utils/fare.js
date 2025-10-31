// utils/fare.js
function calculateFare(distanceKm) {
    const base = 20; const perKm = 8;
    return Math.round(base + distanceKm * perKm);
}
module.exports = { calculateFare };
