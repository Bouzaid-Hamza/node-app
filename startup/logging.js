require('express-async-errors');
const { rejExHandler } = require('../middleware/error');

module.exports = () => {
    process.on('uncaughtException', rejExHandler);
    process.on('unhandledRejection', rejExHandler);
}
