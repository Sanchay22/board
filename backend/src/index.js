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

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
    io.to(roomId).emit('user-joined', { message: 'A new user has joined the room' });
  });

  // Handle drawing events
  socket.on('drawing', ({ roomId, offsetX, offsetY, type, color, size, page }) => {
    socket.to(roomId).emit('drawing', { offsetX, offsetY, type, color, size, page });
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