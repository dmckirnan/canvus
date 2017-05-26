const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const userController = require('./userController');

const app = express();

const PORT = 3000;

mongoose.connect('mongodb://jeffreyma:jeffreyma@ec2-52-89-83-246.us-west-2.compute.amazonaws.com:27017/scratchDB', function() {
  mongoose.connection.db.dropDatabase();
});
mongoose.connection.once('open', () => {
  console.log('Connected to Database');
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/home/home.html');
})

// check the database
app.get('/check', userController.getAllUsers);

app.get('/rooms/:room', (req, res) => {
  res.sendFile(__dirname + '/public/host/host.html');
});

// click event creates user from req.body (obj)
app.post('/create', userController.createUser);

// client side grabs username from url to generate this link to reach this route
app.get('/notes/:user', userController.getUser);

app.put('/notes/:user', userController.updateUser);

const onConnection = (socket) => {
    //Waits for drawing emit from main.js THEN broadcasts & emits the data to socket in main.js (line 32)
    socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));
    //Waits for cleared emit from canvas.html THEN broadcasts & emits data to socket in canvas.html (line 35)
    socket.on('cleared', (data) => socket.broadcast.emit('clearCanvas', data));
}

//On initial server connection, socket passed to onConnection function.
io.on('connection', onConnection);

http.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`));
