class Factory {
    
    constructor() {
        
        this.instances = {};
    }

    add(key, instance){

        if (this.hasKey(key)) {
            throw new Error("The factory has already this key");
        }

        this.instances[key] = instance;
    }

    getInstance(key){

        if (!this.hasKey(key)) {
            throw new Error("The factory does not have this key");
        }

        return this.instances[key];
    }

    hasKey(key){
        return !key || this.instances[key] !== undefined;
    }
}

module.exports = Factory;