import { useRef, useEffect, useState } from 'react';

const useCanvas = (socket, selectedColor, brushSize, roomId) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState([[]]);
  const [isHost, setIsHost] = useState(false);
  const [drawingEnabled, setDrawingEnabled] = useState(true);

  // Initialize canvas and context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Get the container dimensions
    const container = canvas.parentElement;
    const { width, height } = container.getBoundingClientRect();

    // Set canvas dimensions with device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    
    // Set display size
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const context = canvas.getContext('2d');
    context.scale(dpr, dpr);
    context.lineCap = 'round';
    context.strokeStyle = selectedColor;
    context.lineWidth = brushSize;
    contextRef.current = context;

    // Join room
    socket.emit('join-room', roomId);

    socket.on('room-state', ({ pages, drawingEnabled }) => {
      setPages(pages);
      setDrawingEnabled(drawingEnabled);
      // Redraw the current page
      redrawPage(pages[currentPage]);
    });

    socket.on('set-host', () => {
      setIsHost(true);
    });

    // Listen for drawing events from other users
    socket.on('drawing', ({ offsetX, offsetY, type, color, size, page }) => {
      if (page !== currentPage || !contextRef.current) return;

      const ctx = contextRef.current;
      ctx.strokeStyle = color;
      ctx.lineWidth = size;

      switch (type) {
        case 'start':
          ctx.beginPath();
          ctx.moveTo(offsetX, offsetY);
          break;
        case 'draw':
          ctx.lineTo(offsetX, offsetY);
          ctx.stroke();
          break;
        case 'end':
          ctx.closePath();
          break;
      }
    });

    return () => {
      socket.off('room-state');
      socket.off('set-host');
      socket.off('drawing');
    };
  }, [socket, roomId, currentPage]);

  // Update context when color or brush size changes
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = selectedColor;
      contextRef.current.lineWidth = brushSize;
    }
  }, [selectedColor, brushSize]);

  const startDrawing = ({ nativeEvent }) => {
    if (!isHost && !drawingEnabled) return;
    if (!contextRef.current) return;

    const { offsetX, offsetY } = getCoordinates(nativeEvent);
    
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);

    // Emit drawing start
    socket.emit('drawing', {
      roomId,
      offsetX,
      offsetY,
      type: 'start',
      color: selectedColor,
      size: brushSize,
      page: currentPage
    });
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing || !contextRef.current) return;
    if (!isHost && !drawingEnabled) return;

    const { offsetX, offsetY } = getCoordinates(nativeEvent);
    
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();

    // Emit drawing movement
    socket.emit('drawing', {
      roomId,
      offsetX,
      offsetY,
      type: 'draw',
      color: selectedColor,
      size: brushSize,
      page: currentPage
    });
  };

  const endDrawing = () => {
    if (!contextRef.current) return;
    if (!isHost && !drawingEnabled) return;
    
    contextRef.current.closePath();
    setIsDrawing(false);

    // Emit drawing end
    socket.emit('drawing', {
      roomId,
      type: 'end',
      color: selectedColor,
      size: brushSize,
      page: currentPage
    });
  };

  // Helper function to get coordinates for both mouse and touch events
  const getCoordinates = (event) => {
    let x, y;
    if (event.touches) { // Touch event
      const rect = event.target.getBoundingClientRect();
      x = event.touches[0].clientX - rect.left;
      y = event.touches[0].clientY - rect.top;
    } else { // Mouse event
      x = event.offsetX;
      y = event.offsetY;
    }
    return { offsetX: x, offsetY: y };
  };

  const nextPage = () => {
    setCurrentPage(prev => {
      const newPage = prev + 1;
      if (newPage >= pages.length) {
        setPages([...pages, []]);
      }
      redrawPage(pages[newPage]);
      return newPage;
    });
  };

  const prevPage = () => {
    setCurrentPage(prev => {
      const newPage = Math.max(prev - 1, 0);
      redrawPage(pages[newPage]);
      return newPage;
    });
  };

  const redrawPage = (page) => {
    if (!contextRef.current || !page) return;
    contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    page.forEach(({ offsetX, offsetY, type, color, size }) => {
      const ctx = contextRef.current;
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      switch (type) {
        case 'start':
          ctx.beginPath();
          ctx.moveTo(offsetX, offsetY);
          break;
        case 'draw':
          ctx.lineTo(offsetX, offsetY);
          ctx.stroke();
          break;
        case 'end':
          ctx.closePath();
          break;
      }
    });
  };

  return {
    canvasRef,
    startDrawing,
    draw,
    endDrawing,
    nextPage,
    prevPage,
    currentPage,
    pages,
    isHost,
    drawingEnabled
  };
};

export default useCanvas;