const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const { PORT, MONGO_URI } = require('./config');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

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
