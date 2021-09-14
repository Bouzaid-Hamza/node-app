const express = require('express');
const { Customer, validateCustomer } = require('../models/customer');

const router = express.Router();

router.get('/', async (req, res) => {
    const customers = await Customer.find();
    res.send(customers);
});

router.get('/:id', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) return res.status(404).send('Customer with the gived ID was not found');
        res.send(customer);
    } catch (e) {
        return res.status(404).send('Customer with the gived ID was not found');
    }
});

router.post('/', async (req, res) => {
    const { error } = validateCustomer(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { isGold, name, phone } = req.body;
    const customer = new Customer({ isGold, name, phone });
    await customer.save();

    res.send(customer);
});

router.put('/:id', async (req, res) => {
    const { error } = validateCustomer(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { isGold, name, phone } = req.body;
    const customer = await Customer.findByIdAndUpdate(req.params.id, { isGold, name, phone }, { new: true });
    if (!customer) return res.status(404).send('Customer with the gived ID was not found');

    res.send(customer);
});

router.delete('/:id', async (req, res) => {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).send('Customer with the gived ID was not found');
    res.send(customer);
});

module.exports = router;
