/**
 * Socket.IO handler for real-time feedback updates.
 * Admins join 'admin-room' to receive live dashboard events.
 */
const jwt = require('jsonwebtoken');

const initSockets = (io) => {
  // Auth middleware for Socket.IO
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(); // Allow anonymous connections

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { id: decoded.id, role: decoded.role };
      next();
    } catch {
      next(); // Non-fatal: socket connects but won't join admin room
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Admins join the admin room to receive live events
    if (socket.user?.role === 'admin') {
      socket.join('admin-room');
      console.log(`👑 Admin joined admin-room: ${socket.id}`);
    }

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = initSockets;
