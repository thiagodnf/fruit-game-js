
var EventHandler = require('./handlers/event-handler');
var MoveToDownAction = require('./actions/move-to-down-action');
var MoveToLeftAction = require('./actions/move-to-left-action');
var MoveToRightAction = require('./actions/move-to-right-action');
var MoveToUpAction = require('./actions/move-to-up-action');
var Random = require('./utils/random');
var UUID = require('./utils/uuid');

/** 
 * Class representing a game. 
 */
class Game {
    
    /**
     * @constructor
     * @param {string} name - The name of the room.
     * @param {Scenario} scenario - The scenario design.
     * @param {number} [lines=10] - The number of lines of the grid.
     * @param {number} [columns=10] - The number of columns of the grid.
     */
    constructor(name, scenario, gameMode, lines = 10, columns = 10) {
        
        // Properties
        this.actions = {};
        this.id = UUID.createUUID();
        this.name = name;
        this.maxFruits = 5;
        this.timeFruits = 500;
        this.isRunning = false;
        this.gameMode = gameMode;
        this.eventHandler = new EventHandler();

        this.state = {
            players: {},
            fruits: {},
            lines: lines,
            columns: columns,
            walls: scenario.createWalls(lines, columns)
        };

        // Define the actions where the property is the key pressed on the keyboard
        this.actions[38] = new MoveToUpAction();
        this.actions[40] = new MoveToDownAction();
        this.actions[37] = new MoveToLeftAction();
        this.actions[39] = new MoveToRightAction();

        var that = this;

        this.gameMode.on("game.mode.changed", function(game, state){
            that.eventHandler.emit("game.mode.changed", game, state);
        });
    }

    /**
     * Add a new player to the game
     *
     * @param {string} id - The identifier of the player. 
     * @param {string} name - The name of the player.
     * @returns the player instance
     */
    addPlayerRandomly(id, name){

        let emptySpaces = this.getEmptySpaces();
        
        let emptySpace = Random.randElement(emptySpaces);

        if (!emptySpaces) {
            // There is not empty space so we are not able to add it
            return;
        }

       return this.addPlayer(id, name, emptySpace.x, emptySpace.y);
    }

    addPlayer(id, name, x, y){
        
        let player = {
            id: id,
            name: name,
            score: 0,
            x: x,
            y: y,
        }

        this.state.players[player.id] = player;

        if (this.getPlayersAsArray().length >= 1) {
            this.gameMode.startTimer(this);
        }

        return player;
    }

    removePlayer(playerId){
        
        delete this.state.players[playerId];

        this.eventHandler.emit("removed.player", playerId);

        if (this.getPlayersAsArray().length === 0) {
            this.stop();
        }
    }

    hasPlayer(x, y) {
        return this.getPlayersAsArray().filter(e => e.x == x && e.y == y).length !== 0;
    }

    getPlayersAsArray(){
        return Object.keys(this.state.players) .map(i => this.state.players[i])
    }

    /**
     * Get an action related to the key pressed 
     * 
     * @param {number} keyPressed - The number meaning the key pressed on keyboard.
     * @returns {Action} The actions associated to the keyboard or it returns undefined.
     */
    getAction(keyPressed){
        return this.actions[keyPressed] || undefined;
    }

    performAction(playerId, action){

        if (action) {
            action.action(this, playerId);
        }
    }

    checkEndGame(player){

        if (!player) {
            return;
        }

        if (!this.isRunning) {
            return;
        }

        let winner = this.gameMode.getWinner(this);

        if (winner) {
            this.eventHandler.emit("end.game", this, winner);
        } 
    }

    checkCollision(player){

        if (!player) {
            return;
        }

        for (const fruitId in this.state.fruits) {

            let fruit = this.state.fruits[fruitId];

            if (player.x === fruit.x && player.y === fruit.y) {
                
                player.score++;
                
                delete this.state.fruits[fruitId];

                this.eventHandler.emit("eaten.fruit", player);
            }
        }
    }

    hasFruit(x, y) {
        return this.getFruitsAsArray().filter(e => e.x == x && e.y == y).length !== 0;
    }

    addFruitRandomly(){

        let emptySpaces = this.getEmptySpaces();
        
        let emptySpace = Random.randElement(emptySpaces);

        if (!emptySpaces) {
            // There is not empty space so we are not able to add it
            return;
        }

        return this.addFruit(emptySpace.x, emptySpace.y);
    }

    addFruit(x, y){

        if (this.getFruitsAsArray().length >= this.maxFruits) {
            return;
        }

        let fruit = {
            id: UUID.createUUID(),
            x: x,
            y: y
        }

        this.state.fruits[fruit.id] = fruit;

        this.eventHandler.emit("added.fruit", this, fruit);

        return fruit;
    }

    getFruitsAsArray(){
        return Object.keys(this.state.fruits).map(i => this.state.fruits[i])
    }

    on(eventName, callback){
        this.eventHandler.append(eventName, callback);
    }

    getEmptySpaces(){

        let emptySpaces = [];

        for (let i = 0; i < this.state.lines; i++) {

            for (let j = 0; j < this.state.columns; j++) {

                if (!this.hasWall(i,j)) {
                    emptySpaces.push({x: j, y: i});
                }
            }
        }

        emptySpaces = emptySpaces.filter(e => !this.hasFruit(e.x, e.y));
       
        return emptySpaces;
    }

    // /**
    //  * Start the game by generating the walls
    //  */
    // startTimer(){

    //     if (this.isRunning) {
    //         return;
    //     }

    //     let seconds = 5 + 1;

    //     let that = this;

    //     var interval = setInterval(() => {

    //         seconds--;

    //         if (seconds === 0) {
    //             that.start();
    //             clearInterval(interval);
    //         }

    //         this.eventHandler.emit("timer.changed", that, seconds);

    //     }, 1000); 
    // }

    /**
     * Start the game by generating the walls
     */
    start(){

        if (this.isRunning) {
            return;
        }

        this.eventHandler.emit("game.started", this);

        this.gameMode.start(this);

        this.isRunning = true;

        var that = this;

        var interval = setInterval(() => {

            if (that.isRunning) {
                that.addFruitRandomly();
            } else {
                clearInterval(interval);
            }

        }, this.timeFruits); 
    }

    stop(){

        console.log("Stop");

        this.isRunning = false;

        this.gameMode.stop();

        this.state.fruits = {};

        this.eventHandler.emit("game.stopped", this);
    }

    restart(){
       
        this.stop();

        Object.keys(this.state.players).forEach( (el, i) => {
            this.state.players[el].score=0
        });

        ///this.startTimer();
    }

    hasWall(x, y){

        for (const i in this.state.walls) {

            if (this.state.walls[i].x === x && this.state.walls[i].y === y) {
                return true
            }
        }
        
        return false;
    }
}

module.exports = Game;