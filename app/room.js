
let MAX_LINES = process.env.MAX_LINES || 13;
let MAX_COLUMNS = process.env.MAX_COLUMNS || 13;

let Game = require('./game');
var UUID = require('./utils/uuid');

/** 
 * Class representing a room. 
 */
class Room {
    
    /**
     * @constructor
     * @param {string} name - The name of the room.
     */
    constructor(data, game) {
        
        // Properties
        this.name = data.roomName;
        this.password = data.password;
        this.maxPlayers = data.maxPlayers;
        this.game = game;
        this.id = UUID.createUUID();
    }

    addPlayer(playerId, playerName){
        
        var that = this;

        return new Promise(function(resolve, reject) {
        
            let player = that.game.addPlayerRandomly(playerId, playerName);

            if (player) {
                resolve(player);
            } else {
                reject("There is no empty space to position a player");
            }
        });
    }

    performAction(playerId, keyPressed){
        
        let action = this.game.getAction(keyPressed);

        this.game.performAction(playerId, action);
    }

    getNumberOfPlayers(){
        return this.game.getPlayersAsArray().length;
    }

    isFull(){
        return 5 == this.maxPlayers;
    }

    on(event, callback){
        this.game.on(event, callback);
    }
}

module.exports = Room;