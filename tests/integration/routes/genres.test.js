/* eslint-disable no-undef */
let server;
const request = require('supertest');
const mongoose = require('mongoose');
const { Genre } = require('../../../models/genre');
const { User } = require('../../../models/user');
const { iLogger } = require('../../../utilities/loggers');

describe('/api/genres', () => {
    beforeEach(() => { server = require('../../../index'); });
    afterEach(async () => {
        await server.close();
        await Genre.deleteMany({});
    });

    describe('GET /', () => {
        it('should get all genres', async () => {
            const genres = [
                { name: 'genre1' },
                { name: 'genre2' }
            ];

            await Genre.collection.insertMany(genres, err => {
                if (err) return iLogger.info(err);
                iLogger.info('Genres added successfully');
            });

            const res = await request(server).get('/api/genres');

            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some(g => g.name === 'genre1')).toBeTruthy();
            expect(res.body.some(g => g.name === 'genre2')).toBeTruthy();
        });
    });

    describe('GET /:id', () => {
        it('should return a genre if valid ID is passed', async () => {
            const genre = new Genre({ name: 'genre1' });

            await genre.save();

            const res = await request(server).get(`/api/genres/${genre._id}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', genre.name);
        });

        it('should return 404 if ID format is invalid', async () => {
            const res = await request(server).get('/api/genres/1');

            expect(res.status).toBe(404);
            expect(res.text).toBe('Invalid ID.');
        });

        it('should return 404 if invalid ID is passed', async () => {
            const invalidId = new mongoose.Types.ObjectId();

            const res = await request(server).get(`/api/genres/${invalidId}`);

            expect(res.status).toBe(404);
            expect(res.text).toMatch(/not found/);
        });
    });

    describe('POST /', () => {
        let token, name;

        const exec = async () => {
            return await request(server)
                .post('/api/genres')
                .set('x-auth-token', token)
                .send({ name });
        }

        beforeEach(() => {
            token = new User().generateAuthToken();
            name = 'genre1';
        });

        it('should return 401 if client not logged in', async () => {
            token = '';

            const res = await exec();

            const genre = await Genre.findById(res.body._id);

            expect(res.status).toBe(401);
            expect(res.text).toMatch(/denied/);
            expect(genre).toBeFalsy();
        });

        it('should return 400 if genre is empty', async () => {
            name = '';

            const res = await exec();

            const genre = await Genre.findById(res.body._id);

            expect(res.status).toBe(400);
            expect(genre).toBeFalsy();
        });

        it('should return 400 if genre is less than 3 characters', async () => {
            name = 'aa';

            const res = await exec();

            const genre = await Genre.findById(res.body._id);

            expect(res.status).toBe(400);
            expect(genre).toBeFalsy();
        });

        it('should return 400 if genre is more than 50 characters', async () => {
            name = 'a'.repeat(51);

            const res = await exec();

            const genre = await Genre.findById(res.body._id);

            expect(res.status).toBe(400);
            expect(genre).toBeFalsy();
        });

        it('should return 400 if genre is not of type string', async () => {
            name = 1;

            const res = await exec(1);

            const genre = await Genre.findById(res.body._id);

            expect(res.status).toBe(400);
            expect(genre).toBeFalsy();
        });

        it('should save the genre if it is valid', async () => {
            await exec();

            const genre = await Genre.findOne({ name: 'genre1' });

            expect(genre).not.toBeNull();
        });

        it('should return the genre if it is valid', async () => {
            const res = await exec('genre1');

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', 'genre1');
        });
    });

    describe('PUT /:id', () => {
        let id, token;

        const exec = async () => {
            return request(server)
                .put(`/api/genres/${id}`)
                .set('x-auth-token', token)
                .send({ name: 'updated' });
        }

        beforeEach(async () => {
            token = new User().generateAuthToken();

            const genre = new Genre({ name: 'genre1' });
            await genre.save();

            id = genre._id;
        });

        it('should return 404 if invalid ObjectID is passed', async () => {
            id = 1;

            const res = await exec();

            expect(res.status).toBe(404);
            expect(res.text).toMatch(/Invalid/);
        });

        it('should return 404 if genre with the given ID is not found', async () => {
            id = new mongoose.Types.ObjectId();

            const res = await exec();

            expect(res.status).toBe(404);
            expect(res.text).toMatch(/not found/);
        });

        it('should return 200 if valid ID is passed', async () => {
            const res = await exec();

            expect(res.status).toBe(200);
        });

        it('should update the genre if it is valid', async () => {
            const res = await exec();

            const updated = await Genre.findById(id);

            expect(updated.name).toBe('updated');
            expect(res.body).toHaveProperty('name', updated.name)
        });
    });
});
