const express =  require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const http = require('http');;
const socketio =  require('socket.io');

app.set('port', process.env.PORT || 3001);
app.use(express.json());
app.use(cors());

const server = http.createServer(app).listen(app.get('port'), () => {
    console.log(`Server listening to port ${app.get('port')}`);
});

app.get('/', (req, res) => {
    res.send('hola');
})

const active_users = []

// Socket io
const io = socketio(server);
io.on('connection', (socket) => {
    console.log(`User connected with socket: ${socket.id}`);

    socket.on('login', (username) => {
        let new_user = {
            id: socket.id,
            username: username,
        }
        active_users.push(new_user);
        io.emit('users', active_users);
    })

    socket.on('disconnect', () => {
        let index;
        let gotUser = false;
        for(user of active_users) {
            if(user.id === socket.id){
                index = active_users.indexOf(user);
                gotUser = true;
                break;
            }
        }
        if(gotUser){
            active_users.splice(index, 1);
            io.emit('users', active_users);
        }
    })
});

