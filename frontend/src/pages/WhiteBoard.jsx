import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Toolbar from '../components/Toolbar';
import Canvas from '../components/Canvas';
import useCanvas from '../hooks/useCanvas';
import socket from '../services/socket';
import { saveWhiteboard, loadWhiteboard } from '../services/save.js';

const Whiteboard = () => {
  const { roomId } = useParams();
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);

  const { canvasRef, startDrawing, draw, endDrawing, nextPage, prevPage, currentPage, pages } = useCanvas(socket, selectedColor, brushSize, roomId);

  const handleToolChange = (tool) => {
    setSelectedTool(tool);
    // Handle tool change logic here
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
  };

  const handleBrushSizeChange = (size) => {
    setBrushSize(size);
  };

  return (
    <div>
      <Toolbar
        selectedTool={selectedTool}
        onToolChange={handleToolChange}
        selectedColor={selectedColor}
        onColorChange={handleColorChange}
        brushSize={brushSize}
        onBrushSizeChange={handleBrushSizeChange}
        onSave={() => saveWhiteboard(canvasRef)}
        onLoad={() => loadWhiteboard(canvasRef)}
      />
      <Canvas
        canvasRef={canvasRef}
        startDrawing={startDrawing}
        draw={draw}
        endDrawing={endDrawing}
        nextPage={nextPage}
        prevPage={prevPage}
        currentPage={currentPage}
      />
      <div style={{ marginTop: '20px' }}>
        <button onClick={() => saveWhiteboard(canvasRef)}>Save Whiteboard</button>
        <button onClick={() => loadWhiteboard(canvasRef)}>Load Whiteboard</button>
      </div>
    </div>
  );
};

export default Whiteboard;