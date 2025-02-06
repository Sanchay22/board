import { useRef, useEffect, useState } from 'react';

const useCanvas = (socket, selectedColor, brushSize, roomId) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState([[]]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const context = canvas.getContext('2d');
    context.scale(2, 2);
    context.lineCap = 'round';
    context.lineWidth = brushSize;
    contextRef.current = context;

    socket.emit('join-room', roomId);

    socket.on('drawing', ({ offsetX, offsetY, type, color, size, page }) => {
      if (page !== currentPage) return;

      const previousStrokeStyle = contextRef.current.strokeStyle;
      const previousLineWidth = contextRef.current.lineWidth;
      contextRef.current.strokeStyle = color;
      contextRef.current.lineWidth = size;
      if (type === 'start') {
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
      } else if (type === 'draw') {
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
      } else if (type === 'end') {
        contextRef.current.closePath();
      }
      contextRef.current.strokeStyle = previousStrokeStyle;
      contextRef.current.lineWidth = previousLineWidth;

      // Save the drawing command
      setPages((prevPages) => {
        const newPages = [...prevPages];
        newPages[page] = [...newPages[page], { offsetX, offsetY, type, color, size }];
        return newPages;
      });
    });

    return () => {
      socket.off('drawing');
    };
  }, [socket, brushSize, currentPage, roomId]);

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = selectedColor;
      contextRef.current.lineWidth = brushSize;
    }
  }, [selectedColor, brushSize]);

  useEffect(() => {
    // Clear the canvas
    contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Replay the drawing commands for the current page
    pages[currentPage].forEach(({ offsetX, offsetY, type, color, size }) => {
      const previousStrokeStyle = contextRef.current.strokeStyle;
      const previousLineWidth = contextRef.current.lineWidth;
      contextRef.current.strokeStyle = color;
      contextRef.current.lineWidth = size;
      if (type === 'start') {
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
      } else if (type === 'draw') {
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
      } else if (type === 'end') {
        contextRef.current.closePath();
      }
      contextRef.current.strokeStyle = previousStrokeStyle;
      contextRef.current.lineWidth = previousLineWidth;
    });
  }, [currentPage, pages]);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
    socket.emit('drawing', { roomId, offsetX, offsetY, type: 'start', color: selectedColor, size: brushSize, page: currentPage });

    // Save the drawing command
    setPages((prevPages) => {
      const newPages = [...prevPages];
      newPages[currentPage] = [...newPages[currentPage], { offsetX, offsetY, type: 'start', color: selectedColor, size: brushSize }];
      return newPages;
    });
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) {
      return;
    }
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
    socket.emit('drawing', { roomId, offsetX, offsetY, type: 'draw', color: selectedColor, size: brushSize, page: currentPage });

    // Save the drawing command
    setPages((prevPages) => {
      const newPages = [...prevPages];
      newPages[currentPage] = [...newPages[currentPage], { offsetX, offsetY, type: 'draw', color: selectedColor, size: brushSize }];
      return newPages;
    });
  };

  const endDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
    socket.emit('drawing', { roomId, type: 'end', color: selectedColor, size: brushSize, page: currentPage });

    // Save the drawing command
    setPages((prevPages) => {
      const newPages = [...prevPages];
      newPages[currentPage] = [...newPages[currentPage], { type: 'end', color: selectedColor, size: brushSize }];
      return newPages;
    });
  };

  const nextPage = () => {
    setCurrentPage((prevPage) => {
      const newPage = prevPage + 1;
      if (newPage >= pages.length) {
        setPages([...pages, []]);
      }
      return newPage;
    });
  };

  const prevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
  };

  return { canvasRef, startDrawing, draw, endDrawing, nextPage, prevPage, currentPage, pages };
};

export default useCanvas;