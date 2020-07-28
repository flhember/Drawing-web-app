const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');

const PORT = process.env.PORT || 5000;

const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(router);
app.use(cors());

io.sockets.on('connection', (socket) => {
    console.log('connection');

    socket.on('drawio', (data) => {
        io.emit('drawio', data);
    });
 
    socket.on('clean', () => {
        io.emit('clean', true);
    });

    socket.on('disconnect', function (){
        console.log('dicsonnect');
    })
});

server.listen(PORT, () => console.log(`Server has started on port ${PORT}.`));