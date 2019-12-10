
var Factory = require('./factory');

var CompetitiveGameMode = require('../game-mode/competitive-mode');
var TimedGameMode = require('../game-mode/timed-mode');

class GameModeFactory extends Factory {
    
    constructor() {
        super();

        super.add("competitive", new CompetitiveGameMode());
        super.add("timed", new TimedGameMode());
    }
}

module.exports = GameModeFactory;