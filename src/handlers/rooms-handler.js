const Room = require('../models/room-model');
const Player = require('../models/player-model');

class RoomsHandler {

    constructor() {
        this.rooms = {};
    }

    create(roomName, roomTime) {

        const room = new Room(roomName, roomTime);

        this.rooms[room.id] = room;

        return room;
    }

    getRoomById(roomId) {
        return this.rooms[roomId];
    }

    getAllRooms() {
        return Object.values(this.rooms);
    }

    join(roomId, playerName) {

        const that = this;

        return new Promise(function (resolve, reject) {

            let room = that.getRoomById(roomId);

            if (room) {

                const pos = room.getRandPosition();

                const player = new Player(pos.x, pos.y, playerName);

                room.addPlayer(player);

                resolve({
                    roomId: room.id,
                    game: room.game,
                    player: player
                });

            } else {
                reject('The room does not exists');
            }
        });
    }

    start(roomId) {

        const that = this;

        return new Promise(function (resolve, reject) {

            let room = that.getRoomById(roomId);

            if (room && !room.game.isRunning) {

                room.start();

                resolve({
                    roomId: room.id,
                    game: room.game
                });

            } else {
                reject('The room does not exists');
            }
        });
    }

    move(roomId, playerId, keyPressed) {

        var that = this;

        return new Promise(function (resolve, reject) {

            const room = that.getRoomById(roomId);

            if (room) {

                const player = room.getPlayerById(playerId);

                if (player) {

                    room.move(player, keyPressed);

                    resolve({
                        roomId: room.id,
                        game: room.game,
                        player: player
                    });

                } else {
                    reject('The player id was not found');
                }
            } else {
                reject('The room does not exists');
            }
        });
    }

    leave(roomId, playerId) {

        var that = this;

        return new Promise(function (resolve, reject) {

            const room = that.getRoomById(roomId);

            if (room) {

                const player = room.getPlayerById(playerId);

                if (player) {

                    room.leave(player);

                    if (room.isEmpty()) {

                        delete that.rooms[roomId];

                        room.delete();
                    }

                    resolve({
                        roomId: room.id,
                        game: room.game,
                        player: player
                    });

                } else {
                    reject('The player id was not found');
                }
            } else {
                reject('The room does not exists');
            }
        });
    }

    on(roomId, event, callback) {

        const room = this.getRoomById(roomId);

        if (room) {
            room.on(event, callback);
        }
    }
}

module.exports = RoomsHandler;
