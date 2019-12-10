let Game = require('../game');
let Room = require('../room');
let ScenarioFactory = require('../factories/scenario-factory');
let GameModeFactory = require('../factories/game-mode-factory');
let Logger = require('../utils/logger');

let logger = new Logger();

class RoomHandler {
    
    constructor(){
        this.rooms = {};
        this.users = {};
        this.scenarioFactory = new ScenarioFactory();
        this.gameModeFactory = new GameModeFactory();
    }

    getRoom(roomId){
        return this.rooms[roomId];
    }

    newRoom(data){

        let scenario = this.scenarioFactory.getInstance(data.scenario);
        let gameMode = this.gameModeFactory.getInstance(data.gameModeType)

        let game = new Game("", scenario, gameMode, 15, 15);
    
        // game.on("end.game", function(game, player){
        //     // io.sockets.in(game.id).emit('end-game', player);
        //     // game.restart();
        //     // io.sockets.in(game.id).emit('state-update', game.state);
        // });
    
        // game.on("timer.changed", function(game, seconds){
        //    // io.sockets.in(game.id).emit('timer-changed', seconds);
        // });
    
        // gameMode.on("game.mode.changed", function(game, seconds){
        //     //io.sockets.in(game.id).emit('game-mode-changed', seconds);
        // });
    
        let room = new Room(data, game);
    
        this.rooms[room.id] = room;

        return room;
    }

    join(roomId, playerId, playerName){
        
        var that = this;

        return new Promise(function(resolve, reject) {
            
            let room = that.getRoom(roomId);

            if (room) {

                room.addPlayer(playerId, playerName).then(function(player){

                    that.users[playerId] = room.id;

                    resolve({
                        state: room.game.state, 
                        player: player
                    });
                }).catch(error =>{
                    reject(error);
                })
            } else {
                reject("The room does not exists");
            }
        });
    }

    move(roomId, playerId, keyPressed){
        
        var that = this;

        return new Promise(function(resolve, reject) {
            
            let room = that.getRoom(roomId);

            if (room) {
                
                let player = room.game.state.players[playerId];

                if (player) {

                    room.performAction(playerId, keyPressed);
                    
                    resolve({
                        state: room.game.state, 
                        player: player
                    });
                } else {
                    reject("The player id was not found");
                }
            } else {
                reject("The room does not exists");
            }
        });
    }

    leave(playerId){
        
        var that = this;

        return new Promise(function(resolve, reject) {

            let roomId = that.users[playerId];
            
            let room = that.getRoom(roomId);

            if (room) {

                room.game.removePlayer(playerId);

                delete that.users[playerId];

                resolve({
                    roomId: roomId,
                    state: room.game.state, 
                });
            } else {
                reject("The room does not exists");
            }
        });
    }
}

module.exports = RoomHandler;