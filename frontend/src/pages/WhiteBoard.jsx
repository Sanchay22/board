import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Toolbar from '../components/Toolbar';
import Canvas from '../components/Canvas';
import useCanvas from '../hooks/useCanvas';
import socket from '../services/socket';
import { saveWhiteboard, loadWhiteboard } from '../services/save.js';

const Whiteboard = () => {
  const { roomId } = useParams();
  const [selectedTool, setSelectedTool] = useState('brush');
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [isHost, setIsHost] = useState(false);
  const [drawingEnabled, setDrawingEnabled] = useState(true);

  const { 
    canvasRef, 
    startDrawing, 
    draw, 
    endDrawing, 
    nextPage, 
    prevPage, 
    currentPage,
    pages
  } = useCanvas(socket, selectedColor, brushSize, roomId);

  useEffect(() => {
    // Join room on component mount
    socket.emit('join-room', roomId);

    // Listen for host status
    socket.on('set-host', () => {
      console.log('User set as host');
      setIsHost(true);
    });

    // Listen for drawing permission updates
    socket.on('update-drawing-permission', (status) => {
      console.log('Drawing permission updated:', status);
      setDrawingEnabled(status);
    });

    return () => {
      socket.off('set-host');
      socket.off('update-drawing-permission');
    };
  }, [roomId]);

  const handleToolChange = (tool) => {
    setSelectedTool(tool);
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
  };

  const handleBrushSizeChange = (size) => {
    setBrushSize(size);
  };

  const toggleDrawing = () => {
    if (isHost) {
      socket.emit('toggle-drawing', roomId);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex justify-between items-center p-4 bg-gray-100">
        <Toolbar
          onToolChange={handleToolChange}
          onColorChange={handleColorChange}
          onBrushSizeChange={handleBrushSizeChange}
        />
        {isHost && (
          <button
            onClick={toggleDrawing}
            className={`px-4 py-2 rounded ${
              drawingEnabled ? 'bg-red-500' : 'bg-green-500'
            } text-white ml-4`}
          >
            {drawingEnabled ? 'Disable Drawing' : 'Enable Drawing'}
          </button>
        )}
      </div>
      
      <div className="flex-1 relative">
        <Canvas
          canvasRef={canvasRef}
          startDrawing={startDrawing}
          draw={draw}
          endDrawing={endDrawing}
          nextPage={nextPage}
          prevPage={prevPage}
          currentPage={currentPage}
          selectedTool={selectedTool}
        />
      </div>
      
      <div className="p-4 bg-gray-100 flex justify-center space-x-4">
        <button 
          onClick={() => saveWhiteboard(canvasRef)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Save Whiteboard
        </button>
        <button 
          onClick={() => loadWhiteboard(canvasRef)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Load Whiteboard
        </button>
      </div>
    </div>
  );
};

export default Whiteboard;