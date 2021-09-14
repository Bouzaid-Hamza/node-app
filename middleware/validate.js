module.exports = (validator) => {
    return (req, res, next) => {
        const { error } = validator(req.body);

        if (error) {
            const messages = [];
            error.details.forEach((item, index) => {
                messages[index] = item.message;
            });
            return res.status(400).send(messages.join(', '));
        }

        next();
    }
}
