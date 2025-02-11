import dotenv from 'dotenv';
import { app } from './app.js';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
dotenv.config({ path: './.env' });

const port = process.env.PORT || 8000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"]
  }
});

const rooms = {};

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
    if (!rooms[roomId]) {
      rooms[roomId] = { 
        host: null, 
        drawingEnabled: true,
        pages: [[]], // Store drawing data for each page
      };
    }
    if (!rooms[roomId].host) {
      rooms[roomId].host = socket.id;
      socket.emit('set-host');
    }
    // Send current room state to joining user
    socket.emit('room-state', {
      pages: rooms[roomId].pages,
      drawingEnabled: rooms[roomId].drawingEnabled
    });
  });

  socket.on('toggle-drawing', (roomId) => {
    if (socket.id === rooms[roomId].host) {
      rooms[roomId].drawingEnabled = !rooms[roomId].drawingEnabled;
      io.to(roomId).emit('update-drawing-permission', rooms[roomId].drawingEnabled);
    }
  });

  socket.on('drawing', ({ roomId, offsetX, offsetY, type, color, size, page }) => {
    // Allow drawing if user is host or drawing is enabled
    if (socket.id === rooms[roomId]?.host || rooms[roomId]?.drawingEnabled) {
      // Store drawing data
      if (!rooms[roomId].pages[page]) {
        rooms[roomId].pages[page] = [];
      }
      rooms[roomId].pages[page].push({ offsetX, offsetY, type, color, size });
      
      // Broadcast to other users
      socket.to(roomId).emit('drawing', { offsetX, offsetY, type, color, size, page });
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
  server.listen(port, () => console.log(`Server running on port ${port}`));
}).catch(err => {
  console.error('MongoDB connection error:', err);
});