const uuid = require("uuid");

class PlayerModel {

    constructor(x, y, playerName) {
        this.id = uuid.v4();
        this.name = playerName;
        this.score = 0;
        this.x = x;
        this.y = y;
    }

    reset(){
        this.score = 0;
    }
}

module.exports = PlayerModel;
