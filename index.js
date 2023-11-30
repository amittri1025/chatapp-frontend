const http = require('http');
const express = require('express');
const cors = require('cors');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(cors());

const port = process.env.PORT || 4500;
const users = {};

app.get('/', (req, res) => {
    res.send("Hello");
});

io.on("connection", (socket) => {
    console.log("New connection");

    socket.on('joined', ({ username }) => {
        users[socket.id] = username;
        console.log(`${username} joined the chat`);
        socket.broadcast.emit('message', { user: "Admin", content: `${users[socket.id]} joined the chat` });
        socket.emit('message', { user: "Admin", content: `Welcome to the chat, ${users[socket.id]}` });
    });

    socket.on('disconnect', () => {
        if (users[socket.id]) {
            console.log(`${users[socket.id]} disconnected`);
            socket.broadcast.emit('leave', { user: "Admin", content: `${users[socket.id]} left the chat` });
            delete users[socket.id];
        }
    });

    socket.on('message', ({ content, id }) => {
        io.emit('message', { user: users[id], content, id });
    });
});

server.listen(port, () => {
    console.log("Server is running on port " + port);
});
