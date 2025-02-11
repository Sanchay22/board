import React, { useEffect, useRef, useState } from 'react';

const Canvas = ({
  canvasRef,
  startDrawing,
  draw,
  endDrawing,
  nextPage,
  prevPage,
  currentPage,
  selectedTool
}) => {
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !containerRef.current) return;

      const container = containerRef.current;
      const { width, height } = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvasRef.current.width = width * dpr;
      canvasRef.current.height = height * dpr;
      canvasRef.current.style.width = `${width}px`;
      canvasRef.current.style.height = `${height}px`;

      const context = canvasRef.current.getContext('2d');
      context.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleStartDrawing = (e) => {
    if (selectedTool === 'brush') {
      startDrawing(e);
    } else if (selectedTool === 'rectangle' || selectedTool === 'circle') {
      const { offsetX, offsetY } = getCoordinates(e);
      canvasRef.current.startX = offsetX;
      canvasRef.current.startY = offsetY;
      setIsDrawing(true);
    }
  };

  const handleDraw = (e) => {
    if (selectedTool === 'brush') {
      draw(e);
    } else if (selectedTool === 'rectangle' || selectedTool === 'circle') {
      if (!isDrawing) return;
      const { offsetX, offsetY } = getCoordinates(e);
      const context = canvasRef.current.getContext('2d');
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      context.beginPath();
      if (selectedTool === 'rectangle') {
        context.rect(canvasRef.current.startX, canvasRef.current.startY, offsetX - canvasRef.current.startX, offsetY - canvasRef.current.startY);
      } else if (selectedTool === 'circle') {
        const radius = Math.sqrt(Math.pow(offsetX - canvasRef.current.startX, 2) + Math.pow(offsetY - canvasRef.current.startY, 2));
        context.arc(canvasRef.current.startX, canvasRef.current.startY, radius, 0, 2 * Math.PI);
      }
      context.stroke();
    }
  };

  const handleEndDrawing = (e) => {
    if (selectedTool === 'brush') {
      endDrawing(e);
    } else if (selectedTool === 'rectangle' || selectedTool === 'circle') {
      if (!isDrawing) return;
      const { offsetX, offsetY } = getCoordinates(e);
      const context = canvasRef.current.getContext('2d');
      context.beginPath();
      if (selectedTool === 'rectangle') {
        context.rect(canvasRef.current.startX, canvasRef.current.startY, offsetX - canvasRef.current.startX, offsetY - canvasRef.current.startY);
      } else if (selectedTool === 'circle') {
        const radius = Math.sqrt(Math.pow(offsetX - canvasRef.current.startX, 2) + Math.pow(offsetY - canvasRef.current.startY, 2));
        context.arc(canvasRef.current.startX, canvasRef.current.startY, radius, 0, 2 * Math.PI);
      }
      context.stroke();
      setIsDrawing(false);
      endDrawing(e);
    }
  };

  const getCoordinates = (event) => {
    let x, y;
    if (event.touches && event.touches.length > 0) { // Touch event
      const rect = event.target.getBoundingClientRect();
      x = event.touches[0].clientX - rect.left;
      y = event.touches[0].clientY - rect.top;
    } else if (event.clientX !== undefined && event.clientY !== undefined) { // Mouse event
      x = event.clientX;
      y = event.clientY;
    } else {
      return { offsetX: 0, offsetY: 0 };
    }
    return { offsetX: x, offsetY: y };
  };

  return (
    <div className="flex flex-col items-center w-full h-full">
      <div className="flex justify-between w-full mb-2 px-4">
        <button
          onClick={prevPage}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Previous Page
        </button>
        <span className="py-2">Page {currentPage + 1}</span>
        <button
          onClick={nextPage}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Next Page
        </button>
      </div>
      <div
        ref={containerRef}
        className="flex-1 w-full border rounded shadow-md overflow-hidden"
        style={{ touchAction: 'none' }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleStartDrawing}
          onMouseMove={handleDraw}
          onMouseUp={handleEndDrawing}
          onMouseLeave={handleEndDrawing}
          onTouchStart={handleStartDrawing}
          onTouchMove={handleDraw}
          onTouchEnd={handleEndDrawing}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

export default Canvas;