const mongoose = require('mongoose');
const Joi = require('joi');

const genreSchema = {
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    }
};

const Genre = mongoose.model('Genre', new mongoose.Schema(genreSchema));

function validateGenre (genre) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required()
    });

    return schema.validate(genre, { abortEarly: false });
}

module.exports = { genreSchema, Genre, validateGenre };
