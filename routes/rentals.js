const express = require('express');
const Fawn = require('fawn');
const config = require('config');
const { Rental, validateRental, validateId } = require('../models/rental');
const { Customer } = require('../models/customer');
const { Movie } = require('../models/movie');

const router = express.Router();
Fawn.init(config.get('db'));

router.get('/', async (req, res) => {
    const rentals = await Rental.find().sort('-dateOut');
    res.send(rentals);
});

router.get('/:id', async (req, res) => {
    const { error } = validateId(req.params.id);
    if (error) return res.status(404).send('Invalid ID.');

    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).send('Rental with the given id is not found');
    res.send(rental);
});

router.post('/', async (req, res) => {
    const { error } = validateRental(req.body);
    if (error) {
        const messages = [];
        error.details.forEach((item, index) => {
            messages[index] = item.message;
        });
        return res.status(400).send(messages.join(', '));
    }

    const customer = await Customer.findById(req.body.customerId);
    if (!customer) return res.status(400).send('Invalid customer.');

    const movie = await Movie.findById(req.body.movieId);
    if (!movie) return res.status(400).send('Invalid movie.');

    if (!movie.numberInStock) return res.status(400).send('Movie is out of stock.');

    const rental = new Rental({
        customer: {
            _id: customer._id,
            name: customer.name,
            phone: customer.phone
        },
        movie: {
            _id: movie._id,
            title: movie.title,
            dailyRentalRate: movie.dailyRentalRate
        }
    });

    try {
        new Fawn.Task()
            .save('rentals', rental)
            .update('movies', { _id: movie._id }, { $inc: { numberInStock: -1 } })
            .run();

        res.send(rental);
    } catch (e) {
        res.status(500).send('Internal error occurred');
    }
});

router.put('/:id', async (req, res) => {
    const { error } = validateRental(req.body, true);
    if (error) {
        const messages = [];
        error.details.forEach((item, index) => {
            messages[index] = item.message;
        });
        return res.status(400).send(messages.join(', '));
    }

    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).send('Rental with the given id is not found');

    if (req.body.customerId) {
        const customer = await Customer.findById(req.body.customerId);
        if (!customer) return res.status(400).send('Invalid customer');
        rental.customer = {
            _id: customer._id,
            name: customer.name,
            phone: customer.phone
        }
    }

    if (req.body.movieId) {
        const movie = await Movie.findById(req.body.movieId);
        if (!movie) return res.status(400).send('Invalid movie');
        rental.movie = {
            _id: movie._id,
            title: movie.title,
            dailyRentalRate: movie.dailyRentalRate
        }
    }

    rental.save();

    res.send(rental);
});

router.delete('/:id', async (req, res) => {
    const rental = await Rental.findByIdAndDelete(req.params.id);
    if (!rental) return res.status(404).send('Rental with the given id is not found');
    res.send(rental);
});

module.exports = router;
