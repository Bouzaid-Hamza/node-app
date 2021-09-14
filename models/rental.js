const mongoose = require('mongoose');
const Joi = require('joi');
const moment = require('moment');

const Rental = mongoose.model('Rental', new mongoose.Schema({
    customer: {
        type: new mongoose.Schema({
            isGold: {
                type: Boolean,
                default: false
            },
            name: {
                type: String,
                required: true,
                minlength: 3,
                maxlength: 100,
                trim: true
            },
            phone: {
                type: String,
                required: true,
                minlength: 5,
                maxlength: 15
            }
        }),
        required: true
    },
    movie: {
        type: new mongoose.Schema({
            title: {
                type: String,
                trim: true,
                minlength: 3,
                maxlength: 255,
                required: true
            },
            dailyRentalRate: {
                type: Number,
                min: 0,
                max: 200,
                required: true
            }
        }),
        required: true
    },
    dateOut: {
        type: Date,
        required: true,
        default: Date.now
    },
    dateReturned: {
        type: Date
    },
    rentalFee: {
        type: Number,
        min: 0
    }
}));

Rental.lookup = function (customerId, movieId) {
    return this.findOne({
        'customer._id': customerId,
        'movie._id': movieId
    });
}

Rental.prototype.return = function () {
    this.dateReturned = new Date();

    const rentalDays = moment().diff(this.dateOut, 'days');
    this.rentalFee = rentalDays * this.movie.dailyRentalRate;
}

function validateRental (rental, put = false) {
    const schema = {
        customerId: Joi.objectId(),
        movieId: Joi.objectId()
    }

    if (!put) {
        for (const key in schema) {
            schema[key] = schema[key].required();
        }
    }

    const validator = Joi.object(schema);

    return validator.validate(rental, { abortEarly: false });
}

function validateId (id) {
    const validator = Joi.object({
        id: Joi.objectId()
    });

    return validator.validate({ id }, { abortEarly: false });
}

module.exports = { Rental, validateRental, validateId };
