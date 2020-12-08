const uuid = require('uuid');
const cron = require('node-cron');
const EventEmitter = require('events');
const RandomUtils = require('../utils/random-utils');
const logger = require('../utils/logger-utils');

class RoomModel {

    constructor(roomName, roomTime = 30, fruitsInSeconds = 1) {
        this.id = uuid.v4();
        this.name = roomName;
        this.createAt = new Date();
        this.roomTime = roomTime;
        this.fruitsInSeconds = fruitsInSeconds;
        this.events = new EventEmitter();
        this.admin = undefined;
        this.game = {
            players: {},
            adminId: null,
            isRunning: false,
            lines: 25,
            columns: 40,
            size: 20,
            fruits: []
        };
    }

    startFruits() {

        const that = this;

        this.fruitsCron = cron.schedule(`*/${that.fruitsInSeconds} * * * * *`, () => {

            let points = 1;

            const rand = RandomUtils.randDouble();

            if (rand >= 0 && rand <= 0.8) {
                points = 1;
            } else if (rand > 0.8 && rand <= 0.95) {
                points = 3;
            } else if (rand > 0.95 && rand <= 1.0) {
                points = 5;
            }

            that.game.fruits.push({
                x: RandomUtils.randInt(0, that.game.columns),
                y: RandomUtils.randInt(0, that.game.lines),
                points: points
            });

            that.events.emit('new-fruit', {
                roomId: that.id,
                game: that.game
            });
        });
    }

    stopFruits() {

        logger.info("Stopping fruits for the room %s", this.id);

        if (this.fruitsCron) {
            this.fruitsCron.stop();
        }
    }

    /**
     * This function is called when a given room is deleted
     */
    delete(){

        this.game.isRunning = false;

        logger.info("The room %s was successfully deleted", this.id);
    }

    reset() {

        this.game.fruits = [];

        for (var playerId in this.game.players) {
            this.game.players[playerId].score = 0;
        }
    }

    getRanking() {

        const ranking = Object.keys(this.game.players).map(e => ({
            id: this.game.players[e].id,
            name: this.game.players[e].name,
            score: this.game.players[e].score
        })).sort(function (a, b) {
            return (a.score > b.score) ? -1 : ((a.score < b.score) ? 1 : 0);
        });

        return ranking;
    }

    start() {

        const that = this;

        let remainingSeconds = that.roomTime;

        that.reset();
        that.startFruits();

        that.game.isRunning = true;

        const interval = setInterval(() => {

            if (remainingSeconds == 0 || !that.game.isRunning) {

                that.game.isRunning = false;

                clearInterval(interval);

                that.stopFruits();

                that.game.fruits = [];

                that.events.emit('end-game', {
                    roomId: that.id,
                    game: that.game,
                    ranking: that.getRanking()
                });
            }

            that.events.emit('countdown-change', {
                roomId: that.id,
                game: that.game,
                remainingSeconds: remainingSeconds
            });

            remainingSeconds--;

        }, 1000);
    }

    addPlayer(player) {

        if (Object.keys(this.game.players).length == 0){
            this.game.adminId = player.id;
        }

        this.game.players[player.id] = player;
    }

    isEmpty() {
        return Object.keys(this.game.players).length === 0;
    }

    leave(player){

        delete this.game.players[player.id];

        if (player.id == this.game.adminId) {

            const users = Object.keys(this.game.players);

            if (users.length !== 0) {
                this.game.adminId = users[0];
            }
        }
    }

    on(eventName, callback) {
        this.events.on(eventName, callback);
    }

    getPlayerById(playerId) {
        return this.game.players[playerId];
    }

    getRandPosition() {

        return {
            x: RandomUtils.randInt(0, this.game.columns),
            y: RandomUtils.randInt(0, this.game.lines)
        };
    }

    move(player, keyPressed) {

        const that = this;

        if (keyPressed == 37) {

            if (player.x > 0) {
                player.x--;
            }
        } else if (keyPressed == 38) {

            if (player.y > 0) {
                player.y--;
            }
        } else if (keyPressed == 39) {

            if (player.x < that.game.columns - 1) {
                player.x++;
            }
        } else if (keyPressed == 40) {

            if (player.y < that.game.lines - 1) {
                player.y++;
            }
        }

        that.game.fruits.forEach((fruit, i) => {

            if (player.x == fruit.x && player.y == fruit.y) {

                player.score += fruit.points;

                that.game.fruits.splice(i, 1);

                that.events.emit('eaten-fruit-update', {
                    roomId: that.id,
                    game: that.game,
                    player: player,
                    fruit: fruit
                });
            }
        });

    }
}

module.exports = RoomModel;
