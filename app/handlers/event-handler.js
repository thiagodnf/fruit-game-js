
class EventHandler {
    
    constructor(){
        this.callbacks = {};
    }

    emit(eventName, ...targets){

        var callbacks = this.callbacks[eventName];

        if (callbacks) {
            
            for (var i in callbacks) {
                callbacks[i].apply(this, targets );
            }
        } 
    }

    append(eventName, callback){

        if (!(eventName in this.callbacks)) {
            this.callbacks[eventName] = [];
        }

        this.callbacks[eventName].push(callback);
    }
}

module.exports = EventHandler;