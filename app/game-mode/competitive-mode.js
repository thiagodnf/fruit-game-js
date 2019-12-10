
var GameMode = require('./game-mode');

class CompetitiveMode extends GameMode {
    
    constructor(maxScore = 10) {
        super();

        this.maxScore = maxScore;
    }

    getWinner(game){

        let players = game.getPlayersAsArray();

        for (const i in players) {
            
            if (players[i].score === this.maxScore)  {
                return players[i];
            }
        }

        return undefined;
    }

    start(game){
        this.eventHandler.emit("game.mode.changed", game, "Max Score: " + this.maxScore);
    }

    stop(game){
        
    }
}

module.exports = CompetitiveMode;