const SERVER = import.meta.env.VITE_SERVER_ADDRESS || "";

export const saveWhiteboard = async (canvasRef) => {
  const canvas = canvasRef.current;
  const data = canvas.toDataURL(); // Convert canvas to base64 image
  const name = prompt('Enter a name for this whiteboard:');

  const response = await fetch(`${SERVER}/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, data }),
  });

  const result = await response.json();
  alert(`Whiteboard saved! ID: ${result.id}`);
};

export const loadWhiteboard = async (canvasRef) => {
  const id = prompt('Enter Whiteboard ID to load:');
  const response = await fetch(`${SERVER}/load/${id}`);
  const whiteboard = await response.json();

  if (!whiteboard.data) return alert('No whiteboard found!');

  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.src = whiteboard.data;
  img.onload = () => ctx.drawImage(img, 0, 0);
};