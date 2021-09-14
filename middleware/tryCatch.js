const tryCatch = (handler) => {
    return async (req, res, next) => {
        try {
            await handler(req, res);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = tryCatch;
