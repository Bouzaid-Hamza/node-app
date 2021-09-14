const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const passwordComplexity = require('joi-password-complexity');
const config = require('config');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 200
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024
    },
    isAdmin: Boolean
});

// userSchema.methods.generateAuthToken = function () {
//     return jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, process.env.JWT_PRIVATE_KEY);
// }

const User = mongoose.model('User', userSchema);

User.prototype.generateAuthToken = function () {
    return jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, config.get('JWT_PRIVATE_KEY'));
}

function validateUser (user, put = false) {
    const options = {
        min: 8,
        max: 24,
        upperCase: 1,
        numeric: 1,
        requirementCount: 2
    };

    const schema = {
        name: Joi.string().min(3).max(50),
        email: Joi.string().min(3).max(50).email(),
        password: passwordComplexity(options)
    }

    if (!put) {
        for (const key in schema) {
            schema[key] = schema[key].required();
        }
    }

    const validator = Joi.object(schema);

    return validator.validate(user, { abortEarly: false });
}

module.exports = { User, validateUser };
