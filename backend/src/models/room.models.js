import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
  name: String,
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  allowDrawing: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Room', RoomSchema);