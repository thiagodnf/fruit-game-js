
/**
 * An utility class for random operations
 */
class Random {
    
    /**
     * This method returns a random number between min and max (both included)
     * 
     * @param {number} min - The minimum value
     * @param {number} max - The maximum value
     * @returns a random number in [min,max]
     */
    static randInt(min, max){
        return Math.floor(Math.random() * (max - min + 1) ) + min;
    }

    /**
     * This method returns a random element from an array
     * 
     * @param {Array} array - The array
     * @returns a random element from array or undefined
     */
    static randElement(array){

        if (!array || array.length === 0) {
            return undefined;
        }

        let index = Random.randInt(0, array.length - 1);

        return array[index];
    }
}

module.exports = Random;