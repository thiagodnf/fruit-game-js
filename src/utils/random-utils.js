class RandomUtils {

    static randInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    static randDouble(){
        return Math.random();
    }
}

module.exports = RandomUtils;
