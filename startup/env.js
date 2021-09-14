const currentState = 'development';

const morgan = require('morgan');
module.exports = (app) => {
    if (app.get('env') === currentState) {
        app.use(morgan('tiny'));
        const cors = require('cors');
        app.use(cors({ origin: '*' }));
        // app.use((req, res, next) => {
        //     cors({ origin: '*' });
        //     next();
        // });
    }
}
