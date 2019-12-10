let winston = require('winston');

/**
 * An utility class for logger
 */
class Logger {

    constructor(){
        // lets create a global logger
        this.logger = winston.createLogger({
            level: 'debug',
            format: winston.format.json(),
            transports: [
                new winston.transports.Console({
                    level: 'debug',
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.simple()
                    )
                })
            ]
        });
    }
    
    info(message) {
        this.logger.info(message);
    }

    debug(message) {
        this.logger.debug(message);
    }

    error(message) {
        this.logger.error(message);
    }
}

module.exports = Logger;