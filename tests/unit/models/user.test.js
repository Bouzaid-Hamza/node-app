/* eslint-disable no-undef */
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const config = require('config');
const { User } = require('../../../models/user');

describe('generateAuthToken', () => {
    it('should return a valid user', () => {
        const payload = { _id: new mongoose.Types.ObjectId().toHexString(), isAdmin: true };
        const user = new User(payload);
        const token = user.generateAuthToken();
        const result = jwt.verify(token, config.get('JWT_PRIVATE_KEY'));

        expect(result).toMatchObject(payload);
    });
});
