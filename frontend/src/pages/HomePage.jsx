import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  const createRoom = async () => {
    const res = await fetch('http://localhost:5000/create-room');
    const data = await res.json();
    navigate(`/room/${data.roomId}`); // Redirect to room
  };

  const joinRoom = () => {
    if (!roomId) return alert('Enter a Room ID');
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-10">
      <button onClick={createRoom} className="px-4 py-2 bg-blue-500 text-white rounded">
        Create a Room
      </button>
      <input
        type="text"
        placeholder="Enter Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        className="p-2 border rounded"
      />
      <button onClick={joinRoom} className="px-4 py-2 bg-green-500 text-white rounded">
        Join a Room
      </button>
    </div>
  );
};

export default HomePage;