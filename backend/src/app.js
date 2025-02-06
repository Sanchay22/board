import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { v4 as uuidv4 } from 'uuid';
import Whiteboard from './models/whiteboard.models.js';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

app.get('/create-room', (req, res) => {
  const roomId = uuidv4(); // Generate unique Room ID
  res.json({ roomId });
});

app.post('/save', async (req, res) => {
  try {
    const { name, data } = req.body;
    const whiteboard = new Whiteboard({ name, data });
    await whiteboard.save();
    res.json({ message: 'Whiteboard saved', id: whiteboard._id });
  } catch (error) {
    res.status(500).json({ error: 'Error saving whiteboard' });
  }
});

app.get('/load/:id', async (req, res) => {
  try {
    const whiteboard = await Whiteboard.findById(req.params.id);
    if (!whiteboard) return res.status(404).json({ error: 'Not found' });
    res.json(whiteboard);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

export { app };