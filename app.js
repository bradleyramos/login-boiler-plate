const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');

app.use(cors());
app.use(bodyParser.json());
// passport.use(strategy);

let db = require('./server/config/sequelize.js')();

const routes = require('./server/config/routes.js')(app, db);
const secureRoute = require('./server/config/secure-routes.js')(db);

app.use('/', routes);
app.use('/secure', passport.authenticate('jwt', { session : false }), secureRoute );


const server = app.listen(8000, function () {
  console.log("listening on port 8000");
})

const io = require('socket.io')(server);
let history = [];

class Message {
    constructor(name, msg) {
        this.sender = name;
        this.message = msg;
    }
}

io.on('connection', function (socket) {
    socket.emit('send', history);
    socket.on('message', function(data) {
        console.log(data);
        let obj = new Message(data.name,data.msg);
        history.push(obj);
        socket.emit('send', [obj]);
        socket.broadcast.emit('send', [obj]);
    })
});