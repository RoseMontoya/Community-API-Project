const express = require('express');
const { Sequelize, Op } = require('sequelize');
const { format } = require('date-fns')

const { requireAuth } = require('../../utils/auth');
const { makeGroupObj, notFound, forbidden, makeEventObj} = require('../../utils/helpers')
const { Group, Membership, GroupImage, User, Venue, Event, Attendance, EventImage } = require('../../db/models');


const { check } = require('express-validator');
const { handleValidationErrors, venueValidator , eventValidator, attendanceValidator } = require('../../utils/validation');

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

// Get all Attendees of an Event specified by its id
router.get('/:eventId/attendees', async (req, res, next) => {
    const event = await Event.findByPk(req.params.eventId, {
        include: [
            {
                model: Group,
                attributes: ['organizerId'],
                include: [
                    {

                        // Going through group, get members with status of co-host
                        model: Membership, // ! Repeat try to dry
                        where: { status: 'co-host'},
                        attributes: ['userId'],
                        required: false
                    }
                ]
            }
        ]

    });

    // Check if group was found
    if (!event) return next(notFound('Event'));

    // Check if user id matches one of the co-hosts
    const cohosts = event.Group.Memberships;
    let userCohost= false;
    cohosts.forEach( cohost => {
        if (req.user.id === cohost.userId) userCohost = true;
    })

    let attendees;
    // Check if user is the organizer or a co-host
    if (req.user.id === event.Group.organizerId || userCohost) {
        attendees = await User.findAll({
            attributes: ['id', 'firstName', 'lastName', [Sequelize.col('Attendances.status'), 'Attendance']],
            include: {
                model: Attendance,
                where: { eventId: req.params.eventId},
                attributes: []
            }
        })
    } else {
        attendees = await User.findAll({
            attributes: ['id', 'firstName', 'lastName', [Sequelize.col('Attendances.status'), 'Attendance']],
            include: {
                model: Attendance,
                where: {
                    eventId: req.params.eventId,
                    status: {[Op.in]: ['attending', 'waitlist']}
                },
                attributes: []
            }
        })
    }

    attendees.map( attendee => {
        attendee.dataValues.Attendance = { status: attendee.dataValues.Attendance }
    })

    res.json({ Attendees: attendees })
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

// Request to Attend an Event based on the Event's id
router.post('/:eventId/attendance', requireAuth, async (req, res, next) => {
    const event = await Event.findByPk(req.params.eventId, {
            include: [
                {
                    model: Group,
                    attributes: ['organizerId'],
                    include: [
                        {
                            model: Membership,
                            where: {
                                status: {[Op.in]: ['co-host', 'member']},
                                userId: req.user.id
                            },
                            attributes: ['status', 'userId'],
                            required: false
                        }
                    ]
                }
            ]
    });

    if (!event) return next(notFound('Event'));
    console.log(event)

    // Check if user is a member of the group
    let isMember = false
    for (const member of event.Group.Memberships) {
        console.log("MEMBER",member)
        if (member.userId === req.user.id) {
            isMember = true;
            break
        };
    }
    if (!isMember) return next(forbidden())

    // console.log(isMember)

    // Check if already in attendence
    const attendee = await Attendance.findOne({
        where: {
            eventId: event.id,
            userId: req.user.id
        }
    })

    if (attendee) {
        let err;
        if (attendee.status === 'attending') err = new Error('User is already an attendee of the event')
        else err = new Error('Attendance has already been requested');
        err.status = 400;
        return next(err);
    }


    const newAttendance = await event.createAttendance({ userId: req.user.id})

    res.json({ userId: newAttendance.userId, status: newAttendance.status})
})

// PUT
// Change the status of an attendance for an event specified by id
router.put('/:eventId/attendance', requireAuth, attendanceValidator, async (req, res, next) => {
    const event = await Event.findByPk(req.params.eventId, {
        include: [
            {
                model: Group,
                attributes: ['organizerId'],
                include: [
                    {
                        model: Membership,
                        where: {
                            status: 'co-host'
                        },
                        attributes: ['status', 'userId'],
                        required: false
                    }
                ]
            }
        ]
    });

    // Check if event exists
    if (!event) return next(notFound('Event'));

    // Check if User exists
    const user = await User.findByPk(req.body.userId);
    if (!user) return next(notFound('User'))

    // Find attendance
    const attendee = await Attendance.findOne({
        where: {
            userId: user.id,
            eventId: event.id
        }
    });

    if (!attendee) return next(notFound('Attendee'));

    // Check if user id matches one of the co-hosts
    const cohosts = event.Group.Memberships;
    let userCohost= false;
    cohosts.forEach( cohost => {
        if (req.user.id === cohost.userId) userCohost = true;
    })

    // Check if user is not the organizer or a co-host
    if (req.user.id !== event.Group.organizerId && userCohost === false) return next(forbidden());

    await attendee.update(req.body)

    const result = {
        id: attendee.id,
        eventId: attendee.eventId,
        userId: attendee.userId,
        status: attendee.status
    }

    res.json(result)
})


// Edit an Event specified by it id
router.put('/:eventId', requireAuth, eventValidator, async (req, res, next) => {
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
// Delete attendance to an event specified by id
router.delete('/:eventId/attendance/:userId', requireAuth, async (req, res, next ) => {
    const event = await Event.findByPk(req.params.eventId, {
        include: [{
            model: Group,
            attributes: ['organizerId', 'id']
        }]
    })

    // Check if event was found
    if (!event) return next(notFound('Event'));


    // Check if user exists
    const user = await User.findByPk(req.params.userId, { attributes: ['id']})
    if (!user) return next(notFound('User'))

    // Find attendance
    const attendance = await Attendance.findOne({ where: { userId: user.id, eventId: event.id }});
    if (!attendance) return next(notFound('Attendance'))

    if (req.user.id !== event.Group.organizerId && req.user.id !== user.id) return next(forbidden());

    await attendance.destroy();

    res.json({ "message": "Successfully deleted attendance from event"});
})

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
