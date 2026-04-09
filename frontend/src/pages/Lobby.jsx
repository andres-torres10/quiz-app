import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getSocket } from '../services/socket';
import { useAuth } from '../services/authContext';

export default function Lobby() {
  const { quizName } = useParams();
  const { state } = useLocation();
  const roomId = state?.roomId || 'sala1';
  const { user } = useAuth();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const socket = getSocket();

    // Limpiar listeners previos antes de registrar (evita duplicados)
    socket.off('room_update');
    socket.off('new_question');
    socket.off('error_msg');

    const handleRoomUpdate = ({ players }) => setPlayers([...players]);
    const handleNewQuestion = () => navigate(`/game/${roomId}`, { state: { quizName } });
    const handleError = ({ message }) => alert(message);

    socket.on('room_update', handleRoomUpdate);
    socket.on('new_question', handleNewQuestion);
    socket.on('error_msg', handleError);

    // Unirse a la sala
    socket.emit('join_room', { roomId, username: user.username, quizName, role: user.role });

    return () => {
      socket.off('room_update', handleRoomUpdate);
      socket.off('new_question', handleNewQuestion);
      socket.off('error_msg', handleError);
    };
  }, []);

  const startGame = () => {
    getSocket().emit('start_game');
  };

  return (
    <div className="page lobby-page">
      <h2>Sala: {roomId}</h2>
      <p className="quiz-badge">{quizName}</p>

      <div className="players-list">
        <h3>Jugadores ({players.length})</h3>
        {players.length === 0 && <p className="hint">Esperando jugadores...</p>}
        {players.map((p) => (
          <div key={p.id} className="player-item">
            {p.role === 'admin' ? '👑' : '👤'} {p.username}
          </div>
        ))}
      </div>

      {user.role === 'admin' ? (
        <button className="btn-primary btn-large" onClick={startGame}>
          ▶ Iniciar Juego
        </button>
      ) : (
        <div className="waiting-msg">⏳ Esperando que el administrador inicie el juego...</div>
      )}
      <p className="hint">Comparte el ID de sala con tus amigos: <strong>{roomId}</strong></p>
    </div>
  );
}
