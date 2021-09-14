const mongoose = require('mongoose');
const config = require('config');
const { iLogger } = require('../utilities/loggers');

module.exports = () => {
    const db = config.get('db');
    mongoose.connect(db)
        .then(() => iLogger.info(`Connected to "${db}"`));
}
