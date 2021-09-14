const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { validateReturn } = require('../models/return');
const { Rental } = require('../models/rental');
const { Movie } = require('../models/movie');

router.post('/', auth, validate(validateReturn), async (req, res) => {
    const rental = await Rental.lookup(req.body.customerId, req.body.movieId);

    if (!rental) return res.status(404).send('Rental is not found.');

    if (rental.dateReturned) res.status(400).send('Rental already processed');

    rental.return();
    await rental.save();

    await Movie.updateOne({ _id: req.body.movieId }, { $inc: { numberInStock: 1 } });

    return res.send(rental);
});

module.exports = router;
