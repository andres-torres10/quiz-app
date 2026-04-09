const Question = require('../models/Question');

const rooms = {};
const socketMeta = {}; // socket.id -> { roomId, role }

module.exports = (io) => {
  io.on('connection', (socket) => {

    socket.on('join_room', ({ roomId, username, quizName, role }) => {
      socket.join(roomId);
      socketMeta[socket.id] = { roomId, role };

      if (!rooms[roomId]) {
        rooms[roomId] = { players: [], quizName, questions: [], started: false };
      }

      const room = rooms[roomId];
      if (!room.players.find((p) => p.id === socket.id)) {
        room.players.push({
          id: socket.id,
          username,
          score: 0,
          role,
          currentQ: 0,       // índice personal
          questions: [],     // orden aleatorio personal
          answered: false,
          timer: null,
        });
      }

      io.to(roomId).emit('room_update', { players: room.players });
    });

    socket.on('start_game', async () => {
      const meta = socketMeta[socket.id];
      if (!meta) return;
      const { roomId, role } = meta;
      const room = rooms[roomId];
      if (!room || room.started) return;

      if (role !== 'admin') {
        socket.emit('error_msg', { message: 'Solo un administrador puede iniciar el juego' });
        return;
      }

      room.started = true;

      // Cargar preguntas base una sola vez
      const baseQuestions = await Question.aggregate([
        { $match: { quizName: room.quizName } },
        { $sample: { size: 10 } },
      ]);
      room.questions = baseQuestions;

      // Enviar a cada jugador su propio orden aleatorio
      room.players.forEach((player) => {
        const shuffledQuestions = [...baseQuestions].sort(() => Math.random() - 0.5);
        player.questions = shuffledQuestions;
        player.currentQ = 0;
        sendQuestionToPlayer(io, player, roomId, room.quizName);
      });
    });

    socket.on('submit_answer', ({ answer, timeLeft }) => {
      const meta = socketMeta[socket.id];
      if (!meta) return;
      const { roomId } = meta;
      const room = rooms[roomId];
      if (!room) return;

      const player = room.players.find((p) => p.id === socket.id);
      if (!player || player.answered) return;

      player.answered = true;
      clearTimeout(player.timer);

      const q = player.questions[player.currentQ];
      if (!q) return;

      const correct = answer === q.correct;
      const points = correct ? timeLeft : 0;
      player.score += points;

      // Feedback inmediato
      socket.emit('answer_result', {
        correct,
        correctAnswer: q.correct,
        points,
        totalScore: player.score,
      });

      // Esperar 2s y pasar a la siguiente
      setTimeout(() => advancePlayer(io, player, roomId), 2000);
    });

    socket.on('disconnect', () => {
      const meta = socketMeta[socket.id];
      if (!meta) return;
      const { roomId } = meta;
      delete socketMeta[socket.id];

      if (!rooms[roomId]) return;
      const player = rooms[roomId].players.find((p) => p.id === socket.id);
      if (player) clearTimeout(player.timer);

      rooms[roomId].players = rooms[roomId].players.filter((p) => p.id !== socket.id);
      io.to(roomId).emit('room_update', { players: rooms[roomId].players });

      if (rooms[roomId].players.length === 0) {
        delete rooms[roomId];
      }
    });
  });
};

function sendQuestionToPlayer(io, player, roomId, quizName) {
  const q = player.questions[player.currentQ];
  if (!q) {
    io.to(player.id).emit('player_finished', {
      totalScore: player.score,
      username: player.username,
    });
    checkRoomFinished(io, roomId);
    return;
  }

  player.answered = false;
  const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);

  io.to(player.id).emit('new_question', {
    index: player.currentQ,
    total: player.questions.length,
    question: q.question,
    options: shuffledOptions,
    timeLimit: 30,
    quizName,
  });

  player.timer = setTimeout(() => {
    if (player.answered) return;
    player.answered = true;
    io.to(player.id).emit('time_up', { correctAnswer: q.correct });
    setTimeout(() => {
      player.currentQ++;
      sendQuestionToPlayer(io, player, roomId, quizName);
    }, 2000);
  }, 30000);
}

function advancePlayer(io, player, roomId) {
  const room = rooms[roomId];
  if (!room) return;
  player.currentQ++;
  sendQuestionToPlayer(io, player, roomId, room.quizName);
}

function checkRoomFinished(io, roomId) {
  const room = rooms[roomId];
  if (!room) return;

  const allDone = room.players.every((p) => p.currentQ >= p.questions.length);
  if (!allDone) return;

  const results = room.players
    .map((p) => ({ username: p.username, score: p.score }))
    .sort((a, b) => b.score - a.score);

  io.to(roomId).emit('game_over', { results });
  delete rooms[roomId];
}
