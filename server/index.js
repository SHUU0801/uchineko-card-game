const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const registerSocketHandlers = require('./socketHandlers');

const app = express();
app.use(cors());

app.get('/', (req, res) => {
  res.send('UchiNeko Card Game Server is Running!');
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || '*',
    methods: ['GET', 'POST'],
  },
});

registerSocketHandlers(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`UchiNeko server running on port ${PORT}`);
});
