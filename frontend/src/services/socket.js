import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_API_URL || window.location.origin;

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(SERVER_URL, { transports: ['websocket'] });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
