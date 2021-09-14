const { eLogger } = require('../utilities/loggers');

const error = (err, req, res, next) => {
    eLogger.error(err.message, err);
    res.status(500).send('Something went wrong');
}

const rejExHandler = (e) => {
    eLogger.error(e.message, e);
    process.exit(1);
}

module.exports = { error, rejExHandler };
