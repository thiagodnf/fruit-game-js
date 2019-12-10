
var EventHandler = require('../handlers/event-handler');

class GameMode {
    
    constructor(){
        this.eventHandler = new EventHandler();
        this.isStarted = false;
    }

    on(eventName, callback){
        this.eventHandler.append(eventName, callback);
    }

    static get STATE_WAITING() {
        return 1;
    }

    static get STATE_RUNNING() {
        return 2;
    }

    static get STATE_WINNERS() {
        return 3;
    }

    startTimer(game){

        if (this.isStarted) {
            return;
        }

        this.isStarted = true;

        let seconds = 5;

        this.eventHandler.emit("game.mode.changed", game, { status: GameMode.STATE_WAITING, value: seconds });

        var interval = setInterval(() => {

            seconds--;

            if (seconds === 0) {
                clearInterval(interval);
                game.start();
            }

            this.eventHandler.emit("game.mode.changed", game, { status: GameMode.STATE_WAITING, value: seconds });

        }, 1000); 
    }

    // addFruitRandomly(){

    //     console.log("add Fruit Randomly");

    //     var that = this;

    //     var interval = setInterval(() => {

    //         if (that.isRunning) {
    //             that.addFruitRandomly();
    //         } else {
    //             clearInterval(interval);
    //         }

    //     }, this.timeFruits); 
    // }

    /**
     * Implementation required
     */
    isEnded(game, player){
        throw new Error('You have to implement the method doSomething!');
    }

    start(game){
        throw new Error('You have to implement the method doSomething!');
    }

    stop(game){
        throw new Error('You have to implement the method doSomething!');   
    }
}

module.exports = GameMode;