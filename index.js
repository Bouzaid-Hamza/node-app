const express = require('express');
const { iLogger } = require('./utilities/loggers');
const app = express();

require('./startup/logging')();
require('./startup/config')();
require('./startup/mongo')();
require('./startup/validations')();
require('./startup/env')(app);
require('./startup/routes')(app);
require('./startup/prod')(app);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => iLogger.info(`Listening on port ${port}...`));

module.exports = server;

// const genresDb = mongoose.connection;
// genresDb.on('error', console.error.bind(console, 'Connection error:'));
// genresDb.once('open', () => console.log('Connection to Database is Successful!'));
