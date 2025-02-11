import React, { useState } from 'react';
import { Square, Circle, Type ,PenTool} from 'react-feather';

const Toolbar = ({ onToolChange, onColorChange, onBrushSizeChange }) => {
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);

  const tools = [
    { 
      name: 'rectangle', 
      icon: <Square className="w-5 h-5" />,
      tooltip: 'Rectangle'
    },
    { 
      name: 'circle', 
      icon: <Circle className="w-5 h-5" />,
      tooltip: 'Circle'
    },
    { 
      name: 'text', 
      icon: <Type className="w-5 h-5" />,
      tooltip: 'Text'
    },
    { name: 'brush', 
      icon: <PenTool className='w-5'/>, tooltip: 'Brush' }
  ];

  const handleToolSelect = (tool) => {
    setSelectedTool(tool);
    onToolChange(tool);
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    onColorChange(color);
  };

  const handleBrushSizeChange = (size) => {
    setBrushSize(size);
    onBrushSizeChange(size);
  };

  return (
    <div className="flex items-center bg-white shadow-md rounded-lg p-4 space-x-4">
      {/* Tool Selection */}
      <div className="flex space-x-2">
        {tools.map((tool) => (
          <button
            key={tool.name}
            onClick={() => handleToolSelect(tool.name)}
            className={`p-2 rounded ${selectedTool === tool.name ? 'bg-gray-300' : ''}`}
            title={tool.tooltip}
          >
            {tool.icon}
          </button>
        ))}
      </div>
      {/* Color Selection */}
      <input
        type="color"
        value={selectedColor}
        onChange={(e) => handleColorSelect(e.target.value)}
        className="ml-2 border rounded"
      />
      {/* Brush Size Selection */}
      <input
        type="range"
        min="1"
        max="50"
        value={brushSize}
        onChange={(e) => handleBrushSizeChange(e.target.value)}
        className="ml-2"
      />
    </div>
  );
};

export default Toolbar;