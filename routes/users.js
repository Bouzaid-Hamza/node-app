const express = require('express');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const { User, validateUser } = require('../models/user');
const { validateId } = require('../startup/validations');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
    const users = await User.find();
    res.send(users);
});

router.get('/me', auth, async (req, res) => {
    const id = req.user._id;
    const user = await User
        .findById(id)
        .select({ name: 1, email: 1 });
    res.send(user);
});

router.get('/:id', async (req, res) => {
    const { error } = validateId(req.params.id);
    if (error) return res.status(400).send(`value "${req.params.id}" fails to match the valid mongo ID pattern`);

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send('User with the given ID is not found');
    res.send(user);
});

router.post('/', async (req, res) => {
    const { error } = validateUser(req.body);
    if (error) {
        const messages = [];
        error.details.forEach((item, index) => {
            messages[index] = item.message;
        });
        return res.status(400).send(messages.join(', '));
    }

    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).send('User already registered');

    user = new User({ name, email, password });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    await user.save();

    const token = user.generateAuthToken();

    res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email']));
});

router.put('/:id', async (req, res) => {
    const { error: idError } = validateId(req.params.id);
    if (idError) return res.status(404).send(`value "${req.params.id}" fails to match the valid mongo id pattern`);

    const { error: bodyError } = validateUser(req.body, true);
    if (bodyError) {
        const messages = [];
        bodyError.details.forEach((item, index) => {
            messages[index] = item.message;
        });
        return res.status(400).send(messages.join(', '));
    }

    const { ...update } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!user) return res.status(404).send('User with the given id is not found');

    res.send(user);
});

router.delete('/:id', async (req, res) => {
    const { error } = validateId(req.params.id);
    if (error) return res.status(400).send(`value "${req.params.id}" fails to match the valid mongo id pattern`);

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).send('User with the given id is not found');
    res.send(user);
});

module.exports = router;
