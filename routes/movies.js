const express = require('express');
const { Movie, validateMovie } = require('../models/movie');
const { Genre } = require('../models/genre');

const router = express.Router();

router.get('/', async (req, res) => {
    const movies = await Movie.find().sort('title');
    res.send(movies);
});

router.get('/:id', async (req, res) => {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).send('Movie with the given ID is not found');
    res.send(movie);
});

router.post('/', async (req, res) => {
    const { error } = validateMovie(req.body);
    if (error) {
        const messages = [];
        error.details.forEach((item, index) => {
            messages[index] = item.message;
        });
        return res.status(400).send(messages.join(', '));
    }

    const genre = await Genre.findById(req.body.genreId);
    if (!genre) return res.status(400).send('Invalid genre');

    const { title, numberInStock, dailyRentalRate } = req.body;
    const { _id, name } = genre;

    const movie = new Movie({ title, genre: { _id, name }, numberInStock, dailyRentalRate });
    await movie.save();

    res.send(movie);
});

router.put('/:id', async (req, res) => {
    const { error } = validateMovie(req.body, true);
    if (error) {
        const messages = [];
        error.details.forEach((item, index) => {
            messages[index] = item.message;
        });
        return res.status(400).send(messages.join(', '));
    }

    const { genreId, ...rest } = req.body;

    if (genreId) {
        const { _id, name } = await Genre.findById(genreId);
        if (!_id) return res.status(400).send('Invalid genre');
        rest.genre = { _id, name };
    }

    const movie = await Movie.findByIdAndUpdate(req.params.id, rest, { new: true });
    if (!movie) return res.status(404).send('Movie with the given id is not found');

    res.send(movie);
});

router.delete('/:id', async (req, res) => {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).send('Movie with the given id is not found');
    res.send(movie);
});

module.exports = router;
