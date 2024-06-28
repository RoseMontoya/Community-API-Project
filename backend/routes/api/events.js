const express = require('express');
const { Sequelize, Op } = require('sequelize');
const { format } = require('date-fns')

const { requireAuth } = require('../../utils/auth');
const { makeGroupObj, notFound, forbidden} = require('../../utils/helpers')
const { Group, Membership, GroupImage, User, Venue, Event, Attendence, EventImage } = require('../../db/models');


const { check } = require('express-validator');
const { handleValidationErrors, venueValidator } = require('../../utils/validation');

const router = express.Router();

// GET
// Get all Events
router.get('/', async (req, res) => {
    const events = await Event.findAll({
        include: [
            {
                model: Attendence,
                attributes: [[Sequelize.fn('COUNT', Sequelize.col('id')), 'numAttending']],
                duplicating: false
            },
            {
                model: EventImage,
                where: { preview: true },
                attributes: ['url'],
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
        group: ['Event.id', 'EventImages.url'],
        limit: 2,
        offset: 2,
        raw: true
    })
})

module.exports = router;
