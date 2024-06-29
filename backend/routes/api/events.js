const express = require('express');
const { Sequelize, Op } = require('sequelize');
const { format } = require('date-fns')

const { requireAuth } = require('../../utils/auth');
const { makeGroupObj, notFound, forbidden, makeEventObj} = require('../../utils/helpers')
const { Group, Membership, GroupImage, User, Venue, Event, Attendance, EventImage } = require('../../db/models');


const { check } = require('express-validator');
const { handleValidationErrors, venueValidator , eventValidator } = require('../../utils/validation');

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
        group: ['Group.id', 'Event.id', 'EventImages.id', 'Venue.id']
    })

    events.forEach(event => {
        event.dataValues.startDate = format(event.startDate, 'yyyy-MM-dd HH:mm:ss');
        event.dataValues.endDate = format(event.endDate, 'yyyy-MM-dd HH:mm:ss')
        event.dataValues.numAttending = +event.dataValues.numAttending;
    })

    res.json({ Events: events })
})

// Get details of an Event specified by its id
router.get('/:eventId', async (req, res, next) => {
    const event = await Event.findByPk( req.params.eventId, { // ! another repeat
        include: [
            {
                model: Attendance,
                attributes: [],
                duplicating: false
            },
            {
                model: Group,
                attributes: ['id', 'name', 'private', 'city', 'state']
            },
            {
                model: Venue,
                attributes: { exclude: ['updatedAt', 'createdAt', 'groupId']}
            },
            {
                model: EventImage,
                attributes: ['id', 'url', 'preview'],
            },
        ],
        attributes: {
            include: [
                [Sequelize.fn('COUNT', Sequelize.col('Attendances.userId')), 'numAttending']
            ],
            exclude: ['updatedAt', 'createdAt']
        },
        group: ['Group.id', 'Event.id', 'Venue.id', 'EventImages.id']
    })

    if (!event) return next(notFound('Event'))

    event.dataValues.startDate = format(event.startDate, 'yyyy-MM-dd HH:mm:ss');
    event.dataValues.endDate = format(event.endDate, 'yyyy-MM-dd HH:mm:ss')
    event.dataValues.numAttending = +event.dataValues.numAttending;

    res.json(event)
})

// POST
// Add an Image to an Event based on the Event's id
router.post('/:eventId/images', requireAuth , async (req, res, next ) => {
    // ! think about adding validation for req.body
    const event  = await Event.findByPk(req.params.eventId, {
        include: [
            {
                model: Group,
                attributes: ['organizerId'],
                include: [
                    {
                        // Going through group, get members with status of co-host
                        model: Membership, // ! Repeat try to dry
                        where: {
                            status: 'co-host'
                        },
                        attributes: ['userId'],
                        required: false
                    }
                ]
            },
            {
                model: Attendance,
                where: { status : 'attending'},
                attributes: ['userId'],
                required: false
            }
        ]
    })

    // Check if event was found
    if (!event) return next(notFound('Event'));

    // Check if user id matches one of the co-hosts
    const cohosts = event.Group.Memberships;
    let userCohost= false;
    cohosts.forEach( cohost => {
        if (req.user.id === cohost.userId) userCohost = true;
    })

    const attendees = event.Attendances;
    let userAttendee = false;
    if (attendees) attendees.forEach( attendee => {
        if (req.user.id === attendee.userId) userAttendee = true;
    })

    // Check if user is not the organizer or a co-host
    if (req.user.id !== event.Group.organizerId && !userCohost && !userAttendee) return next(forbidden());

    const newImage = await event.createEventImage(req.body);

    const newImageObj = {
        id: newImage.id,
        url: newImage.url,
        preview: newImage.preview
    }

    res.json(newImageObj)
})

// PUT
// Edit an Event specified by it id
router.put('/:eventId', requireAuth, eventValidator, async (req, res, next) => {
    console.log(req.body.venueId)
    if (req.body.venueId === undefined) req.body.venueId = null;

    const event  = await Event.findByPk(req.params.eventId, {
        include: [
            {
                model: Group,
                attributes: ['organizerId'],
                include: [
                    {
                        // Going through group, get members with status of co-host
                        model: Membership, // ! Repeat try to dry
                        where: {
                            status: 'co-host'
                        },
                        attributes: ['userId'],
                        required: false
                    },
                    {
                        model: Venue,
                        attributes: ['id'],
                        where: {
                            id: req.body.venueId
                        },
                        required: false
                    }
                ]
            }
        ]
    })

    // Check if event was found
    if (!event) return next(notFound('Event'));
    if (req.body.venueId && event.Group.Venues.length === 0) return next(notFound('Venue'))

    // Check if user id matches one of the co-hosts
    const cohosts = event.Group.Memberships;
    let userCohost= false;
    cohosts.forEach( cohost => {
        if (req.user.id === cohost.userId) userCohost = true;
    })

    // Check if user is not the organizer or a co-host
    if (req.user.id !== event.Group.organizerId && !userCohost ) return next(forbidden());

    await event.update(req.body);

    const eventObj = makeEventObj(event)

    res.json(eventObj)
})

// DELETE
// Delete an Event specified by its id
router.delete('/:eventId', requireAuth, async (req, res, next) => {
    const event  = await Event.findByPk(req.params.eventId, {
        include: [
            {
                model: Group,
                attributes: ['organizerId'],
                include: [
                    {
                        // Going through group, get members with status of co-host
                        model: Membership, // ! Repeat try to dry
                        where: {
                            status: 'co-host'
                        },
                        attributes: ['userId'],
                        required: false
                    }
                ]
            }
        ]
    })

    // Check if event was found
    if (!event) return next(notFound('Event'));

    // Check if user id matches one of the co-hosts
    const cohosts = event.Group.Memberships;
    let userCohost= false;
    cohosts.forEach( cohost => {
        if (req.user.id === cohost.userId) userCohost = true;
    })

    // Check if user is not the organizer or a co-host
    if (req.user.id !== event.Group.organizerId && !userCohost ) return next(forbidden());

    await event.destroy();

    res.json({ message: 'Successfully deleted' })
})

module.exports = router;
