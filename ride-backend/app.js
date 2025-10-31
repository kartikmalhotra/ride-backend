require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const rateLimit = require('express-rate-limit');
const { initSockets } = require('./sockets'); // ✅ import from separate file

const PORT = process.env.PORT || 3000;

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());


app.use(
  rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 600, // limit each IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: '⏳ Too many requests, please slow down!',
    },
  })
);

// Global error handler
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Routes
app.use('/api/test', require('./routes/test'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/rides', require('./routes/rides'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/history', require('./routes/history'));
app.use('/api/ratings', require('./routes/ratings'));

// Create HTTP server
const server = http.createServer(app);

// Initialize Sockets
initSockets(server);

// Start Server
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
