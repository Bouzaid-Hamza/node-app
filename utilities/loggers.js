const winston = require('winston');

const eLogger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            level: 'error',
            colorize: true,
            prettyPrint: true
        }),
        new winston.transports.File({
            level: 'error',
            filename: './logs/error.log'
        })
    ]
});

const iLogger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            level: 'info',
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple())
        })
    ]
});

module.exports = { eLogger, iLogger };
