const express =  require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const http = require('http');;
const socketio =  require('socket.io');
const fileUpload = require('express-fileupload');

// Express setup
app.set('port', process.env.PORT || 3001);
app.use(express.json());
app.use(cors());
app.use(fileUpload());

const server = http.createServer(app).listen(app.get('port'), () => {
    console.log(`Server listening to port ${app.get('port')}`);
});

app.get('/', (req, res) => {
    res.send('hola');
})



// Upload endpoint
app.post('/upload', (req, res) => {
    if(req.files === null) {
        return res.status(400).json({msg: 'No file uploaded'});
    }
    let file = req.files.file;
    file.mv(`${__dirname}/client/public/uploads/${file.name}`, err => {
        if(err) {
            console.log(err);
            return res.status(500).send(err);
        }
        res.json({ fileName: file.name, filePath: `/uploads/${file.name}`});
    })
})

// Socket io
const active_users = []

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
    });

    socket.on('new_msg', (msg_data) => {
        let id = msg_data[0];
        let username;
        for(user of active_users){
            if(user.id === id){
                username = user.username;
                break;
            }
        }

        let new_msg = {
            sender_id: id,
            username: username,
            text: msg_data[1]
        }

        io.emit('msg', new_msg);
    })

    socket.on('disconnect', () => {
        let index = null;
        for(user of active_users) {
            if(user.id === socket.id){
                index = active_users.indexOf(user);
                gotUser = true;
                break;
            }
        }
        if(index){
            active_users.splice(index, 1);
            io.emit('users', active_users);
        }
    })
});

