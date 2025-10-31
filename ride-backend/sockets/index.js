const { Server } = require('socket.io');  // adjust path if needed
const redis = require('../config/redis');

function initSockets(server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    console.log('✅ Socket connected:', socket.id);

    // 🟢 DRIVER ONLINE — store driver in Redis
    socket.on('driver:online', async (data) => {
      try {
        const { ride_id, lat, lng } = data;
        if (!ride_id || !lat || !lng) {
          console.log('❌ Missing ride data from driver');
          return;
        }

        // Add driver’s ride to Redis GEO
        await redis.geoadd('drivers:geo', lng, lat, ride_id);
        console.log(`📍 Driver ${ride_id} added to Redis GEO at [${lat}, ${lng}]`);

        // Join socket room for that ride
        socket.join(`ride:${ride_id}`);
      } catch (err) {
        console.error('❌ Error in driver:online:', err);
      }
    });

    // 🟡 DRIVER LOCATION UPDATE
    socket.on('driver:location', async (data) => {
      const { ride_id, lat, lng } = data;
      if (ride_id && lat && lng) {
        await redis.geoadd('drivers:geo', lng, lat, ride_id);
        io.to(`ride:${ride_id}`).emit('ride:update', { lat, lng });
      }
    });

    // 🔴 DISCONNECT — remove driver from Redis if needed
    socket.on('disconnect', async () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
      // Optional: remove driver from Redis if you stored socket → ride mapping
    });
  });

  return io;
}

module.exports = { initSockets };
