import mongoose from "mongoose";

const WhiteboardSchema = new mongoose.Schema({
  name: String,
  data: Object, 
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Whiteboard', WhiteboardSchema);
