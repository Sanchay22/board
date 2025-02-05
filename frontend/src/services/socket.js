import io from 'socket.io-client';

const SERVER_ADDRESS = import.meta.env.VITE_SERVER_ADDRESS || '';
const socket = io(SERVER_ADDRESS);

export default socket;