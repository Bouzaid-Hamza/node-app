const config = require('config');

module.exports = () => {
    if (!config.get('JWT_PRIVATE_KEY')) {
        throw new Error('FATAL ERROR: JWT_PRIVATE_KEY is not defined.');
    }
}
