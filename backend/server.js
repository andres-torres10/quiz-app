const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const { PORT, MONGO_URI } = require('./config');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['https://quiz-app-c56a1.web.app', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
  },
  transports: ['polling', 'websocket'],
});

app.use(cors());
app.use(express.json());
// Necesario para que el popup de Google Auth pueda cerrarse correctamente
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/quiz', require('./routes/quiz'));

// Sockets
require('./sockets/gameSocket')(io);

// DB + Start
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB conectado');
    server.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
  })
  .catch((err) => {
    console.error('Error MongoDB:', err.message);
    process.exit(1);
  });
