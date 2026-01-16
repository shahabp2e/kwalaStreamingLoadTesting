const logger = require("../lib/logger");

let x = 0;
const count = () => {
    x = x+1; 
    logger.info(`count is ${x}`);
}

module.exports = count;