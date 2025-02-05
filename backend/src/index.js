import dotenv from 'dotenv';
import { app } from './app.js';
import http from 'http';
import { Server } from 'socket.io';

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
  socket.on('drawing', (data) => {
    socket.broadcast.emit('drawing', data);
  });
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(port, () => console.log(`Server running on port ${port}`));