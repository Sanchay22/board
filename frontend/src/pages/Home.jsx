import React, { useState } from 'react';
import Toolbar from '../components/Toolbar';
import Canvas from '../components/Canvas';
import useCanvas from '../hooks/useCanvas';
import socket from '../services/socket';

export default function Home() {
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);

  const { canvasRef, startDrawing, draw, endDrawing, nextPage, prevPage, currentPage } = useCanvas(socket, selectedColor, brushSize);

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
    <div className="flex flex-col items-center p-4 space-y-4">
      <Toolbar onToolChange={handleToolChange} onColorChange={handleColorChange} onBrushSizeChange={handleBrushSizeChange} />
      <Canvas
        canvasRef={canvasRef}
        startDrawing={startDrawing}
        draw={draw}
        endDrawing={endDrawing}
        nextPage={nextPage}
        prevPage={prevPage}
        currentPage={currentPage}
      />
    </div>
  );
}