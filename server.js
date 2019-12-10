let express = require('express');
let app = express();
let http = require('http').createServer(app);
let io = require('socket.io')(http);
let liveReload = require('livereload');
let project = require('./package.json');
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let session = require("express-session");
let partials = require('express-partials')
let flash = require("express-flash");
const { validationResult, check} = require('express-validator');

let PORT = process.env.PORT || 3000;
let MAX_NUMBER_OF_CLIENTS = process.env.MAX_NUMBER_OF_CLIENTS || 3;
let MAX_LINES = process.env.MAX_LINES || 13;
let MAX_COLUMNS = process.env.MAX_COLUMNS || 13;

// Custom Classes
let Game = require('./app/game');
let Logger = require('./app/utils/logger');
let RoomHandler = require('./app/handlers/room-handler');

var liveReloadServer = liveReload.createServer()

liveReloadServer.watch(__dirname)

let logger = new Logger();
let roomHandler = new RoomHandler();

var generalRoom = newRoom({
    roomName: 'General',
    password: '',
    maxPlayers: 10,
    scenario: 'bordered',
    gameModeType: 'timed',
    gameModeValue: 10
});

function newRoom(data){

    var room = roomHandler.newRoom(data);

    room.on("added.fruit", function(game, fruit){
        io.sockets.in(room.id).emit('game-state', game.state);
    });

    room.on("game.mode.changed", function(game, state){
        console.log(state);
        io.sockets.in(room.id).emit('game-mode-state', state);
    });

    return room;
}

app.set('view engine', 'ejs');

// Load expressjs middlewares
app.use(partials());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/views'));
app.use(cookieParser());
app.use(flash());
app.use(session({ 
    secret: 'keyboard cat', 
    cookie: { maxAge: 60000 },
    resave: true,
    saveUninitialized: true
}));
app.use(function (err, req, res, next) {
    console.log("ola")
    logger.error(err.stack)
    req.flash('error', JSON.stringify(err));
    return res.redirect('/');
    res.status(500).send('Something broke!')
})

app.get('/', function(req, res){

    logger.debug(`Showing index page`);

    return res.redirect('/room/'+generalRoom.id);
});

app.get('/rooms', function(req, res){
    
    logger.debug(`Showing rooms page`);

    res.render('rooms.ejs',{
        rooms: roomHandler.rooms
    });
});

// The get acesss to /room is forbidden
// We have to redirect the user to the index page
app.get('/room/:roomId', [
    check('roomId').trim().escape().isLength({min: 1}).withMessage('must be not empty'),
], (req, res) => {

    logger.debug(`Showing roomId ${req.params.roomId}`);

     // Finds the validation errors in this request and 
    // wraps them in an object with handy functions
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        errors.array().map(e => req.flash('error', JSON.stringify(e)));
        return res.redirect('/');
    }

    let data = req.params;

    let room = roomHandler.getRoom(data.roomId);

    if (!room) {
        req.flash('error', 'This room does not exists. Try to refresh the page');
        return res.redirect('/rooms');
    }

    if (room.isFull()) {
        req.flash('error', 'This room is full. Try a different one');
        return res.redirect('/rooms');
    }
    
    res.render('room.ejs',{
        room: room
    });
});

app.post('/room', [
    check('roomId').trim().escape().isLength({min: 1}).withMessage('must be not empty'),
    check('playerName').trim().escape().isLength({min: 1}).withMessage('must be not empty'),
    check('password').trim().escape(),
], (req, res) => {

    // Finds the validation errors in this request and 
    // wraps them in an object with handy functions
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    if (!roomHandler.hasRoomId(req.body.roomId)) {
        req.flash('error', 'This room does not exists. Try to refresh the page');
        return res.redirect('/');
    }

    if (roomHandler.isFull(req.body.roomId)) {
        req.flash('error', 'This room is full. Try a different one');
        return res.redirect('/');
    }

    res.header("roomId", req.body.roomId);

    res.render('room.ejs',{
        room: roomHandler.getRoom(req.body.roomId),
        name: req.body
    });
});

app.post('/new-room', [
    check('roomName').trim().escape().isLength({min: 5, max: 50}).withMessage('must be have between 5 and 50 characters'),
    check('password').trim().escape(),
    check('maxPlayers').trim().escape().isInt({min:2, max: 50}).toInt().withMessage('must be have between 2 and 50'),
    check('scenario').trim().escape().custom(value => roomHandler.scenarioFactory.hasKey(value)).withMessage('must be a valid scenario'),
    check('gameModeType').trim().escape().custom(value => roomHandler.gameModeFactory.hasKey(value)).withMessage('must be a valid game mode'),
    check('gameModeValue').trim().escape().isInt({min:10, max: 200}).toInt().withMessage('must be have between 10 and 200')
], (req, res) => {
    
    // Finds the validation errors in this request and 
    // wraps them in an object with handy functions
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    newRoom(req.body);
    
    res.redirect('/');
});

io.on('connection', function(socket){

    let playerId = socket.id;
    
    logger.info(`Player Connected: ${playerId}`);

    if (io.engine.clientsCount > MAX_NUMBER_OF_CLIENTS) {
        socket.emit('room-error', "The server reached the maximum number of clients");
        socket.conn.close();
        return;
    }

    socket.on('join-game', (roomId, playerName, password) => {
        
        logger.debug(`Join: ${playerName} in the roomId ${roomId}`);

        roomHandler.join(roomId, playerId, playerName).then(function(value) {
            socket.join(roomId);
            socket.emit('joined', value.state, value.player);
            io.sockets.in(roomId).emit('game-state', value.state);
        }).catch(error => {
            socket.emit('room-error', error);
            socket.conn.close();
        });
    });

    socket.on('player-move', (roomId, keyPressed) => {

        logger.debug(`Move: ${playerId} pressed the key ${keyPressed}`);

        roomHandler.move(roomId, playerId, keyPressed).then(function(value) {
            socket.emit('player-state', value.player);
            io.sockets.in(roomId).emit('game-state', value.state);
        }).catch(error =>{
            socket.emit('room-error', error);
            socket.conn.close();
        });
    });

    socket.on('disconnect', () => {
        
        logger.info(`Player Disconnected: ${playerId}`);
        
        roomHandler.leave(playerId).then(function(value) {
            io.sockets.in(value.roomId).emit('game-state', value.state);
        }).catch(error =>{
            socket.emit('room-error', error);
            socket.conn.close();
        });

        logger.info(`Number of players: ${io.engine.clientsCount}`);
    });

    logger.info(`Number of players: ${io.engine.clientsCount}`);
});

http.listen(PORT, function(){

    logger.info('Running app:')
    logger.info('\t' + project.name)
    logger.info('LiveReload Server is watching:')
    logger.info('\t' + __dirname)
    logger.info('Settings:')
    logger.info('\tMAX_NUMBER_OF_CLIENTS: ' + MAX_NUMBER_OF_CLIENTS)

    logger.info('Listening on *:'+PORT);
});