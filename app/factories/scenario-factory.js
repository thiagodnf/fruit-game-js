
var Factory = require('./factory');

var EmptyScenario = require('../scenarios/empty-scenario');
var BorderedScenario = require('../scenarios/bordered-scenario');
var BombermanScenario = require('../scenarios/bomberman-scenario');

class ScenarioFactory extends Factory {
    
    constructor() {
        super();

        super.add("empty", new EmptyScenario());
        super.add("bordered", new BorderedScenario());
        super.add("bomberman", new BombermanScenario());
    }
}

module.exports = ScenarioFactory;