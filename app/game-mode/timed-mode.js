
var GameMode = require('./game-mode');

class TimedMode extends GameMode {

    constructor(maxSeconds = 10) {
        super();

        this.isRunning = false;
        this.seconds = maxSeconds;
        this.maxSeconds = maxSeconds;
    }

    getWinner(game){

        if (this.seconds !== 0) {
            return;
        }

        let scores = {};

        game.getPlayersAsArray().forEach(player => {

            if (!scores[player.score]) {
                scores[player.score] = [];
            }

            scores[player.score].push(player);
        });

        let maxKey = -1;

        Object.keys(scores).forEach(key => {
            
            if (key > maxKey) {
                maxKey = key;
            }
        });

        return scores[maxKey];
    }

    start(game){

        var that = this;

        this.isRunning = true;

        this.seconds = this.maxSeconds;

        this.eventHandler.emit("game.mode.changed", game, {
            status: GameMode.STATE_RUNNING,
            value: this.seconds + " seconds"
        });

        var interval = setInterval(() => {

            that.seconds--;

            if (that.seconds === 0 || !this.isRunning) {
                clearInterval(interval);
            }

            this.eventHandler.emit("game.mode.changed", game, {
                status: GameMode.STATE_RUNNING,
                value: this.seconds + " seconds"
            });

        }, 1000); 
    }

    stop(game){
        this.isRunning = false;
    }
}

module.exports = TimedMode;