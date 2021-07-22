const express =  require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const http = require('http');;
const socketio =  require('socket.io');
const fileUpload = require('express-fileupload');

// Express setup
app.set('port', process.env.PORT || 3001);
app.use(express.json({limit: '50mb'}));
app.use(cors());
app.use(fileUpload());
app.use(express.static(__dirname + '/public'));

const server = http.createServer(app).listen(app.get('port'), () => {
    console.log(`Server listening to port ${app.get('port')}`);
});

app.get('/', (req, res) => {
    res.send('hola');
});


// img DB
const images = {}

app.post('/img_upload', (req, res) => {
    let img = req.body.file;
    let string_code =  img.substring(20,30).replaceAll(/\W/g, '');
    let img_code = `${string_code}-${Date.now()}`
    images[img_code] = img;
    res.json({ code: img_code });
})

app.get('/images/:code', (req, res) => {
    let code = req.params.code;
    res.send(images[code]);
})

// check file extension
const allowed_extensions = ['jpg', 'png', 'gif', 'jpeg']
const checkExt = (file_name) => {
    let ext_brut = file_name.slice((file_name.lastIndexOf('.') -1 >>> 0) +2);
    let ext = ext_brut.toLowerCase();
    return allowed_extensions.includes(ext);
}

// Upload endpoint
app.post('/upload', (req, res) => {
    if(req.files === null) {
        return res.status(400).json({msg: 'No file uploaded'});
    }
    let file = req.files.file;
    if (checkExt(file.name)){
        let filename = `${Date.now()}-${file.name.replace(/\s+/g, '')}`;
        file.mv(`${__dirname}/public/${filename}`, err => {
            if(err) {
                console.log(err);
                return res.status(500).send(err);
            }
            res.json({ fileName: file.name, filePath: `/${filename}`});
        })
    } else {
        return res.status(400).json({ msg: 'File format is not supported' });
    }
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
            if(user.id === msg_data.id){
                username = user.username;
                break;
            }
        }

        let new_msg = {
            sender_id: msg_data.id,
            username: username,
            text: msg_data.text,
            isImg: msg_data.isImg,
            file: msg_data.file,
            tags: msg_data.tags
        }

        io.emit('msg', new_msg);
    });

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

