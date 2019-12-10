
var Scenario = require('./scenario');

class BorderedScenario extends Scenario {
    
    createWalls(lines, columns){

        let walls = [];

        for (let i = 0; i < lines; i++) {

            for (let j = 0; j < columns; j++) {

                if (i == 0 || i == lines - 1 || j == 0 || j == columns - 1) {
                    walls.push({x: j, y: i});
                }
            }
        }

        return walls;
    }
}

module.exports = BorderedScenario;