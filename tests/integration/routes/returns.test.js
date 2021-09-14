/* eslint-disable no-undef */
const request = require('supertest');
const mongoose = require('mongoose');
const moment = require('moment');
const { Rental } = require('../../../models/rental');
const { User } = require('../../../models/user');
const { Movie } = require('../../../models/movie');

describe('/api/returns', () => {
    let server
    let rental;
    let customerId;
    let movieId;
    let token;

    const exec = () => {
        return request(server)
            .post('/api/returns')
            .set('x-auth-token', token)
            .send({ customerId, movieId });
    }

    beforeEach(async () => {
        server = require('../../../index');

        token = new User().generateAuthToken();

        customerId = new mongoose.Types.ObjectId();
        movieId = new mongoose.Types.ObjectId();

        rental = new Rental({
            customer: {
                _id: customerId,
                name: 'customer name',
                phone: '12345'
            },
            movie: {
                _id: movieId,
                title: 'movie title',
                dailyRentalRate: 3
            }
        });

        await rental.save();
    });

    afterEach(async () => {
        await server.close();
        await Rental.deleteMany({});
        await Movie.deleteMany({});
    });

    it('should return 401 if client is not logged in', async () => {
        token = '';

        const res = await exec();

        expect(res.status).toBe(401);
        expect(res.text).toMatch(/denied/);
    });

    it('should return 400 if customer ID is not provided', async () => {
        customerId = '';

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it('should return 400 if movie ID is not provided', async () => {
        movieId = '';

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it('should return 404 if no rental for this customer/movie', async () => {
        await Rental.deleteMany({});

        const res = await exec();

        expect(res.status).toBe(404);
        expect(res.text).toMatch(/not found/);
    });

    it('should return 400 if rental is already processed', async () => {
        rental.dateReturned = Date.now();
        await rental.save();

        const res = await exec();

        expect(res.status).toBe(400);
        expect(res.text).toMatch(/processed/);
    });

    it('should return 200 if valid request', async () => {
        const res = await exec();

        expect(res.status).toBe(200);
    });

    it('should set the return date if input is valid', async () => {
        await exec();

        const result = await Rental.findById(rental._id);

        const diff = new Date().getTime() - result.dateReturned.getTime();

        expect(diff).toBeLessThan(10 * 1000);
    });

    it('should calculate the return rentalFee if input is valid', async () => {
        rental.dateOut = moment().add(-7, 'days').toDate();
        rental.save();

        await exec();

        const result = await Rental.findById(rental._id);

        expect(result.rentalFee).toBe(21);
    });

    it('should increase the movie stock if input is valid', async () => {
        const movie = new Movie({
            _id: movieId,
            title: 'movie title',
            genre: { name: 'movie genre' },
            numberInStock: 9,
            dailyRentalRate: 3
        });

        await movie.save();

        await exec();

        const result = await Movie.findById(movieId);

        expect(result.numberInStock).toBe(movie.numberInStock + 1);
    });

    it('should return the rental if input is valid', async () => {
        const res = await exec();

        const result = await Rental.findById(rental._id);

        expect(Object.keys(res.body)).toEqual(
            expect.arrayContaining(Object.keys(result.toJSON()))
        );
    });
});
