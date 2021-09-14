const mongoose = require('mongoose');
const Joi = require('joi');

const Customer = mongoose.model('Customer', new mongoose.Schema({
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
        validate: /^\d{6,16}$/,
        required: true
    }
}));

function validateCustomer (customer) {
    const schema = Joi.object({
        isGold: Joi.boolean(),
        name: Joi.string().min(3).max(50).required(),
        phone: Joi.string().min(5).max(12).required()
    });

    return schema.validate(customer, { abortEarly: false });
}

module.exports = { Customer, validateCustomer };
