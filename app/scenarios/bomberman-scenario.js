
var BorderedScenario = require('./bordered-scenario');

class BombermanScenario extends BorderedScenario {
    
    createWalls(lines, columns){

        let walls = super.createWalls(lines, columns);

        for (let i = 2; i < lines - 1 ; i += 2) {

            for (let j = 2; j < columns - 1; j += 2) {
                walls.push({x: j, y: i});
            }
        }

        return walls;
    }
}

module.exports = BombermanScenario;