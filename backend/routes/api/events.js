const express = require('express');
const { Sequelize, Op } = require('sequelize');
const { format } = require('date-fns')

const { requireAuth } = require('../../utils/auth');
const { makeGroupObj, notFound, forbidden} = require('../../utils/helpers')
const { Group, Membership, GroupImage, User, Venue, Event, Attendance, EventImage } = require('../../db/models');


const { check } = require('express-validator');
const { handleValidationErrors, venueValidator } = require('../../utils/validation');

const router = express.Router();

// GET
// Get all Events
router.get('/', async (req, res) => {
    const events = await Event.findAll({
        include: [
            {
                model: Attendance,
                attributes: [],
                duplicating: false
            },
            {
                model: EventImage,
                where: { preview: true },
                attributes: [],
                duplicating: false
            },
            {
                model: Group,
                attributes: ['id', 'name', 'city', 'state']
            },
            {
                model: Venue,
                attributes: ['id', 'city', 'state']
            }
        ],
        attributes: {
            include: [
                [Sequelize.fn('COUNT', Sequelize.col('Attendances.userId')), 'numAttending'],
                [Sequelize.col('EventImages.url'), "previewImage"]
            ],
            exclude: ['updatedAt', 'createdAt', 'description', 'capacity', 'price']
        },
        group: ['Event.id', 'EventImages.url']
    })

    events.forEach(event => {
        event.dataValues.startDate = format(event.startDate, 'yyyy-MM-dd HH:mm:ss');
        event.dataValues.endDate = format(event.endDate, 'yyyy-MM-dd HH:mm:ss')
        event.dataValues.numAttending = event.dataValues.numAttending;
    })

    res.json({ Events: events })
})

module.exports = router;
