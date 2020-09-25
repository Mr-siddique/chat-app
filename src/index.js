const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessage, generateLocationMessage } = require("./utils/messages");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./utils/users");
const port = process.env.PORT || 3000;


const app = express();
const server = http.createServer(app);
const io = socketio(server);


//serving up public folder
app.use(express.static(path.join(__dirname, "../public")));

io.on('connection', (socket) => {
    socket.on('join', ({ username, roomname }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, roomname })
        if (error) {
            return callback(error);
        }
        socket.join(user.roomname);
        socket.emit('message', generateMessage('Admin', 'welcome!'));
        socket.broadcast.to(user.roomname).emit('message', generateMessage('Admin', `${user.username} has joined!`))
        io.to(user.roomname).emit('roomData', {
            roomname: user.roomname,
            users: getUsersInRoom(user.roomname)
        })
        callback();
    })

    socket.on('sendMessage', (message, callback) => {

        //validating the message
        const filter = new Filter();
        if (filter.isProfane(message)) {
            return callback('profanity not allowed')
        }
        const user = getUser(socket.id)
        
        io.to(user.roomname).emit('message', generateMessage(user.username, message));
        callback();
    })

    //listning for send location event
    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id);
        //sending a google link which redirects us to aur current location on google map
        io.to(user.roomname).emit("locationMessage", generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
        callback();
    })

    //disconnect is also a built in event when some one goct disconnected
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user){
            io.to(user.roomname).emit("message", generateMessage('Admin', `${user.username} has left!`));
        io.to(user.roomname).emit('roomData', {
            roomname: user.roomname,
            users: getUsersInRoom(user.roomname)
        })
    }
    })
})

server.listen(port, () => {
    console.log("server is up on port", port);
})
