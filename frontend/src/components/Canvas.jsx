import React from 'react';

const Canvas = ({ canvasRef, startDrawing, draw, endDrawing, nextPage, prevPage, currentPage }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full mb-2">
        <button onClick={prevPage} className="p-2 bg-gray-200 rounded">Previous Page</button>
        <span>Page {currentPage + 1}</span>
        <button onClick={nextPage} className="p-2 bg-gray-200 rounded">Next Page</button>
      </div>
      <div className="border rounded shadow-md overflow-hidden" style={{ width: '100%', height: '100%', position: 'relative' }}>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          className="absolute top-0 left-0"
        />
      </div>
    </div>
  );
};

export default Canvas;