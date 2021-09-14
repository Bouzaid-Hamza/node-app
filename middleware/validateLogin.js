const Joi = require('joi');
const passwordComplexity = require('joi-password-complexity');

module.exports = (req, res, next) => {
    const options = {
        min: 8,
        max: 24,
        upperCase: 1,
        numeric: 1,
        requirementCount: 2
    };

    const schema = {
        email: Joi.string().min(3).max(50).email().required(),
        password: passwordComplexity(options)
    }

    const validator = Joi.object(schema);

    const { error } = validator.validate(req.body, { abortEarly: false });

    if (error) {
        const messages = [];
        error.details.forEach((item, index) => {
            messages[index] = item.message;
        });
        return res.status(400).send(messages.join(', '));
    }

    next();
}
