const express =  require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const httpServer = require('http').createServer();
const io = require('socket.io')(httpServer);

const port = process.env.PORT || 3001;

const corsOptions = {
    origin: 'http://localhost:3000/'
}

// app.use((req, res, next) => {
//     console.log(`Request_endpoint: ${req.method} ${req.url}`);
//     next();
// });

app.use(express.json());

app.use(cors(corsOptions));


app.get('/', (req, res) => {
    res.send('hola');
})

app.listen(port, () => console.log(`BACK_END_SERVICE_PORT: ${port}`));

// Socket io

io.on('connection', (socket) => {
    //console.log(`User connected with socket: ${socket.id}`);
    console.log('hola');

    socket.on('disconnect', ()=>{
        console.log(`User ${socket.id} disconnected`);
    })
});

