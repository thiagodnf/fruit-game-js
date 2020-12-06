const uuid = require('uuid');

class SocketHandler {

    constructor(io, roomsHandler) {
        this.io = io;
        this.roomsHandler = roomsHandler;
        this.socketConnections = {};
    }

    triggerGameUpdate(params){

        socket.join(roomId);

        this.io.sockets.in(params.roomId).emit('game-update', params);
    }

    connect(socket){

        var that = this;

        let socketId = socket.id;

        console.log("SocketId Connected:", socketId);

        socket.on('disconnect', () => {

            console.log("SocketId Disconnected", socketId);

            const conn = that.socketConnections[socketId];

            if (conn) {

                delete that.socketConnections[socketId];

                this.roomsHandler.leave(conn.roomId, conn.playerId).then(function(response) {
                    that.io.sockets.in(conn.roomId).emit('game-update', response);
                }).catch((error) => {
                    socket.emit('room-error', error);
                });
            }
        });

        socket.on('start-game', (roomId) => {

            this.roomsHandler.on(roomId, "new-fruit", (response) => {
                that.io.sockets.in(roomId).emit('game-update', response);
            });

            this.roomsHandler.on(roomId, "countdown-change", (response) => {
                that.io.sockets.in(roomId).emit('countdown-change', response);
            });

            this.roomsHandler.on(roomId, "end-game", (response) => {
                that.io.sockets.in(roomId).emit('end-game', response);
            });

            this.roomsHandler.on(roomId, "eaten-fruit-update", (response) => {
                that.io.sockets.in(roomId).emit('eaten-fruit-update', response);
            });

            this.roomsHandler.start(roomId).then(function(response) {
                that.io.sockets.in(roomId).emit('game-update', response);
            }).catch((error) => {
                socket.emit('room-error', error);
            });
        });

        socket.on('join-game', (roomId, playerName) => {

            that.roomsHandler.join(roomId, playerName).then(function(response) {

                that.socketConnections[socketId] = {
                    playerId: response.player.id,
                    roomId: roomId
                };

                socket.join(roomId);
                socket.emit('player-joined', response);

                that.io.sockets.in(roomId).emit('game-update', response);
            }).catch((error) => {
                socket.emit('room-error', error);
            });
        });

        socket.on('player-move', (roomId, playerId, keyPressed) => {

            this.roomsHandler.move(roomId, playerId, keyPressed).then(function(response) {
                socket.emit('player-update', response);
                that.io.sockets.in(roomId).emit('game-update', response);
            }).catch(error => {
                console.error(error)
                socket.emit('room-error', error);
            });
        });
    }
}

module.exports = SocketHandler;
