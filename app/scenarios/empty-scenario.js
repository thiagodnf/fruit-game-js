
var Scenario = require('./scenario');

class EmptyScenario extends Scenario {
    
    createWalls(lines, columns){
        return [];
    }
}

module.exports = EmptyScenario;