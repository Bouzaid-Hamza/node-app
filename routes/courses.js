const express = require('express');
const Joi = require('joi');
const router = express.Router();

const courses = [
    { id: 1, name: 'course1' },
    { id: 2, name: 'course2' },
    { id: 3, name: 'course3' }
]

router.get('/', (req, res) => {
    res.send(courses);
});

router.get('/:id', (req, res) => {
    const { params } = req;
    const course = courses.find(c => params.id === c.id.toString());
    course ? res.send(course) : res.status(404).send(('The course was not found'));
});

router.post('/', (req, res) => {
    const { error } = validateCourse(req.body)
    if (error) return res.status(400).send(error.details[0].message);
    const course = { id: courses.length + 1, name: req.body.name };
    courses.push(course);
    res.send(courses);
});

router.put('/:id', (req, res) => {
    const { body, params } = req;
    const course = courses.find(c => c.id.toString() === params.id);
    if (!course) return res.status(404).send('There is no such course');
    const { error } = validateCourse(body);
    if (error) return res.status(400).send(error.details[0].message);
    course.name = body.name;
    res.send(courses);
});

router.delete('/:id', (req, res) => {
    const { params } = req;
    const course = courses.find(c => c.id.toString() === params.id);
    if (!course) return res.status(404).send('There is no such course');
    const index = courses.indexOf(course);
    courses.splice(index, 1);
    res.send(courses);
});

function validateCourse (course) {
    const schema = Joi.object({
        name: Joi.string().min(3).required()
    });

    return schema.validate(course);
}

module.exports = router;
