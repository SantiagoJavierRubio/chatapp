const express =  require('express');
const cors = require('cors');
const app = express();
const http = require('http');;
const socketio =  require('socket.io');

// Express setup
app.set('port', process.env.PORT || 3001);
app.use(express.json({limit: '50mb'}));
app.use(cors());
app.use(express.static(__dirname + '/static'));
app.set('trust proxy', 1);

const server = http.createServer(app).listen(app.get('port'), () => {
    console.log(`Server listening to port ${app.get('port')}`);
});

app.get('/', (req, res) => {
    res.send('Welcome to the server');
});

// handle image requests
const images = {}

app.post('/img_upload', (req, res) => {
    let img = req.body.file;
    let string_code =  img.substring(20,30).replace(/\W/g, '');
    let img_code = `${string_code}-${Date.now()}`
    images[img_code] = img;
    res.json({ code: img_code });
})

app.get('/images/:code', (req, res) => {
    let code = req.params.code;
    res.send(images[code]);
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
        let username;
        for(user of active_users){
            if(user.id === msg_data.usr_id){
                username = user.username;
                break;
            }
        }

        let new_msg = {
            sender_id: msg_data.usr_id,
            message_id: msg_data.msg_id,
            username: username,
            text: msg_data.text,
            isImg: msg_data.isImg,
            file: msg_data.file,
            tags: msg_data.tags
        }

        io.emit('msg', new_msg);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
        let index = null;
        for(user of active_users) {
            if(user.id === socket.id){
                index = active_users.indexOf(user);
                break;
            }
        }
        if(index !== null){
            active_users.splice(index, 1);
            io.emit('users', active_users);
        }
        socket.removeAllListeners();
    })
});

