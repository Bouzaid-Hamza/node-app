/* eslint-disable no-undef */
let server;
const request = require('supertest');
const { User } = require('../../../models/user');
const { Genre } = require('../../../models/genre');

describe('auth middleware', () => {
    let token;

    const exec = () => {
        return request(server)
            .post('/api/genres')
            .set('x-auth-token', token)
            .send({ name: 'genre1' });
    }

    beforeEach(() => { server = require('../../../index'); });
    afterEach(async () => {
        await server.close();
        await Genre.deleteMany({});
    });

    it('should return 401 if no token is provided', async () => {
        token = '';

        const res = await exec();

        expect(res.status).toBe(401);
        expect(res.text).toMatch(/denied/);
    });

    it('should return 400 if token is invalid', async () => {
        token = 'a';

        const res = await exec();

        expect(res.status).toBe(400);
        expect(res.text).toMatch(/Invalid/);
    });

    it('should return 400 if token is valid', async () => {
        token = new User().generateAuthToken();

        const res = await exec();

        expect(res.status).toBe(200);
    });
});
