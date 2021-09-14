const mongoose = require('mongoose');
const Joi = require('joi');
const { genreSchema } = require('./genre');

const Movie = mongoose.model('Movie', new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        minlength: 3,
        maxlength: 255,
        required: true
    },
    genre: {
        type: genreSchema,
        required: true
    },
    numberInStock: {
        type: Number,
        min: 0,
        max: 200,
        required: true
    },
    dailyRentalRate: {
        type: Number,
        min: 0,
        max: 200,
        required: true
    }
}));

function validateMovie (movie, put = false) {
    const schema = {
        title: Joi.string().min(3).max(255),
        genreId: Joi.objectId(),
        numberInStock: Joi.number().min(0).max(200),
        dailyRentalRate: Joi.number().min(0).max(200)
    }

    if (!put) {
        for (const key in schema) {
            schema[key] = schema[key].required();
        }
    }

    const validator = Joi.object(schema);

    return validator.validate(movie, { abortEarly: false });
}

module.exports = { Movie, validateMovie };
