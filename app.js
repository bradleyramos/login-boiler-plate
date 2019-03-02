const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const passport = require('passport');
const path = require('path');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// passport.use(strategy);

let db = require('./server/config/sequelize.js')();

const routes = require('./server/config/routes.js')(app, db);
const secureRoute = require('./server/config/secure-routes.js')(db);

app.use('/static', express.static(path.join(__dirname, 'server/static_files')));
app.use('/', routes);
app.use('/secure', passport.authenticate('jwt', { session : false }), secureRoute );


const server = app.listen(8000, function () {
  console.log("listening on port 8000");
})

const io = require('socket.io')(server);
let history = [];
let connectedUsers = {};

class Message {
    constructor(name, msg) {
        this.sender = name;
        this.message = msg;
    }
}

io.on('connection', function (socket) {
    // add socket to connectedUsers with empty fields on initiation
    connectedUsers[socket.id] = {
        'first_name': 'fill',
        'last_name': 'fill',
        'latitude': -1,
        'longitude': -1
    }

    socket.on('disconnect', function() {
        delete connectedUsers[socket.id]
    })

    socket.emit('allUsers' ,Object.values(connectedUsers).filter(d => d.latitude != -1 || d.longitude != -1));
    socket.emit('send', history);
    socket.on('message', function(data) {
        console.log(data);
        let obj = new Message(data.name,data.msg);
        history.push(obj);
        socket.emit('send', [obj]);
        socket.broadcast.emit('send', [obj]);
    })

    socket.on('shareUser', function(data) {
        let token = data['token'];
        // do a user look up using token
        axios.get(`/secure/profile?secret_token=${token}`)
            .then(res => {
                connectedUsers[socket.id].first_name = res.data.first_name;
                connectedUsers[socket.id].last_name = res.data.last_name;
                socket.emit('status', {'msg': 'User info updated!'});
            })
            .catch(err => {
                console.log(err);
            })
    })

    socket.on('shareLocation', function(data) {
        connectedUsers[socket.id].latitude = data.latitude;
        connectedUsers[socket.id].longitude = data.longitude;
        socket.broadcast.emit('newUser' ,connectedUsers[socket.id]);
        socket.emit('status', {'msg': 'User location shared!'});
    })
});