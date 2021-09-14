const express = require('express');
const bcrypt = require('bcrypt');
const validateLogin = require('../middleware/validateLogin');
const { User } = require('../models/user');
const router = express.Router();

router.post('/', validateLogin, async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).send('Invalid email or password');

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).send('Invalid email or password');

    const token = user.generateToken();

    res.send(token);
});

module.exports = router;
