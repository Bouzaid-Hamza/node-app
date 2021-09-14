const mongoose = require('mongoose');
const Joi = require('joi');

const Return = mongoose.model('Return', new mongoose.Schema({
    customerId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    movieId: {
        type: mongoose.Types.ObjectId,
        required: true
    }
}));

const validateReturn = (ret) => {
    const schema = Joi.object({
        customerId: Joi.objectId().required(),
        movieId: Joi.objectId().required()
    });

    return schema.validate(ret, { abortEarly: false });
}

module.exports = { Return, validateReturn };
