const express = require('express');
const { Sequelize, Op } = require('sequelize');
const { format } = require('date-fns')

const { requireAuth } = require('../../utils/auth');
const { makeGroupObj, makeEventObj, notFound, forbidden} = require('../../utils/helpers')
const { Group, Membership, GroupImage, User, Venue, Attendance, Event, EventImage } = require('../../db/models');


const { check } = require('express-validator');
const { handleValidationErrors, venueValidator, eventValidator } = require('../../utils/validation');

// VALIDATORS
// ! Consider refactoring all validators into a seperate file and importing them into the file.
const groupValidator = [
    check('name')
        .exists({ checkFalsy: true })
        .isLength({min: 2, max: 60})
        .withMessage('Name must be 60 characters or less'),
    check('about') // ! can add in check for uppermax
        .exists({ checkFalsy: true })
        .isLength({ min: 50})
        .withMessage('About must be 50 characters or more'),
    check('type')
        .exists({ checkFalsy: true})
        .isIn(['In person', 'Online'])
        .withMessage("Type must be 'Online' or 'In person"),
    check('private')
        .exists({ checkNull: true})
        .isIn(['false', 'true'])
        .withMessage('Private must be a boolean'),
    check('city')
        .exists({ checkFalsy: true })
        .withMessage('City is required'),
    check('state')
        .exists({ checkFalsy: true })
        .withMessage('State is required'),
    handleValidationErrors
]

const router = express.Router();

// GET

// Get all Groups
router.get('/', async (req, res) => {

    const pagination = {}
    const groups = await Group.findAll({
        include: [ // ! Try to find a way to add these query params into a scope
            {
                model: Membership,
                attributes: [[Sequelize.fn('COUNT', Sequelize.col('userId')), 'numMembers']],
                duplicating: false

            },
            {
                model: GroupImage,
                where: { preview: true},
                attributes: ['url'],
                duplicating: false,
            }
        ],
        group: ['Group.id', 'GroupImages.url'],
        ...pagination,
        raw: true
    })

    const Groups = []
    groups.forEach(group => {
        Groups.push(makeGroupObj(group));
    })

    res.json({Groups})
})

// Get all Groups joined or organzied by the Current User
router.get('/current', requireAuth, async(req, res) => {
    const groupsOrganized = await Group.findAll({ // ! Try to find away to get everything in one query
        where: { organizerId: req.user.id},
        include: [
            {
                model: Membership,
                attributes: [[Sequelize.fn('COUNT', Sequelize.col('userId')), 'numMembers']],
                duplicating: false

            },
            {
                model: GroupImage,
                where: { preview: true},
                attributes: ['url'],
                duplicating: false,
            }
        ],
        group: ['Group.id', 'GroupImages.url'],
        raw: true
    })

    const groupsMemberOf =  await Group.findAll({
        include: [
            {
                model: Membership,
                where: { userId: req.user.id},
                attributes: [[Sequelize.fn('COUNT', Sequelize.col('userId')), 'numMembers']],
                duplicating: false

            },
            {
                model: GroupImage,
                where: { preview: true},
                attributes: ['url'],
                duplicating: false,
            }
        ],
        group: ['Group.id', 'GroupImages.url'],
        raw: true
    })

    const Groups = []
    groupsOrganized.forEach(group => {
        Groups.push(makeGroupObj(group));
    })
    groupsMemberOf.forEach(group => {
        Groups.push(makeGroupObj(group))
    })

    res.json({Groups})
})

// Get all Venues for a Group specified by its id
router.get('/:groupId/venues', requireAuth, async (req, res, next) => {
    const group = await Group.findByPk(req.params.groupId, {
        attributes: ['organizerId'],
        include: [
            {
                model: Venue,
            },
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
    });

    // Check if group was found
    if (!group) return next(notFound('Group'));

    // Check if user id matches one of the co-hosts
    const cohosts = group.Memberships;
    let userCohost= false;
    cohosts.forEach( cohost => {
        if (req.user.id === cohost.userId) userCohost = true;
    })

    // Check if user is not the organizer or a co-host
    if (req.user.id !== group.organizerId && userCohost === false) return next(forbidden());

    res.json({ Venues: group.Venues})
})

// Get all Events of a Group specified by its id
router.get('/:groupId/events', async (req, res, next) => {
    const events = await Event.findAll({ // ! mostly a duplicate, try to dry
        where: { groupId: req.params.groupId},
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
                required: false,
                duplicating: false
            },
            {
                model: Group,
                attributes: ['id', 'name', 'city', 'state'],
                require: true
            },
            {
                model: Venue,
                attributes: ['id', 'city', 'state'],
            }
        ],
        attributes: {
            include: [
                [Sequelize.fn('COUNT', Sequelize.col('Attendances.userId')), 'numAttending'],
                [Sequelize.col('EventImages.url'), "previewImage"]
            ],
            exclude: ['updatedAt', 'createdAt', 'description', 'capacity', 'price']
        },
        group: ['Group.id', 'Event.id','EventImages.id', 'Venue.id']
    })

    console.log(events.groupId)
    if (events.length === 0) return next(notFound("Group"));

    events.forEach(event => {
        event.dataValues.startDate = format(event.startDate, 'yyyy-MM-dd HH:mm:ss');
        event.dataValues.endDate = format(event.endDate, 'yyyy-MM-dd HH:mm:ss')
        event.dataValues.numAttending = +event.dataValues.numAttending;
    })

    res.json({ Events: events })
})

// Get all Members of a Group specified by its id
router.get('/:groupId/members', async (req, res) => {
    const group = await Group.findByPk(req.params.groupId, {
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
    });

    // Check if group was found
    if (!group) return next(notFound('Group'));

    // Check if user id matches one of the co-hosts
    const cohosts = group.Memberships;
    let userCohost= false;
    cohosts.forEach( cohost => {
        if (req.user.id === cohost.userId) userCohost = true;
    })

    let members;
    // Check if user is the organizer or a co-host
    if (req.user.id === group.organizerId || userCohost) {
        members = await User.findAll({
            attributes: ['id', 'firstName', 'lastName', [Sequelize.col('Memberships.status'), 'Membership']],
            include: {
                model: Membership,
                where: { groupId: req.params.groupId},
                attributes: []
            }
        })
    } else {
        members = await User.findAll({
            attributes: ['id', 'firstName', 'lastName', [Sequelize.col('Memberships.status'), 'Membership']],
            include: {
                model: Membership,
                where: {
                    groupId: req.params.groupId,
                    status: {[Op.notLike]: 'pending'}
                },
                attributes: []
            }
        })
    }

    members.map( member => {
        member.dataValues.Membership = { status: member.dataValues.Membership }
    })

    res.json({ Members: members })
})

// Get details of a Group from an id
router.get('/:groupId', async (req, res, next) => {
    const group = await Group.findByPk(req.params.groupId, {
        include: [
            {
                model: Membership,
                attributes: [],
            },
            {
                model: GroupImage,
                attributes: ['id', 'url', 'preview'],
            },
            {
                model: User,
                as: 'Organizer',
                attributes: ['id', 'firstName', 'lastName']
            },
            {
                model: Venue,
                attributes: {
                    exclude: ['createdAt', 'updatedAt']
                }
            }
        ],
    });

    if (!group) return next(notFound('Group'));

    group.dataValues.updatedAt = format(group.updatedAt, 'yyyy-MM-dd HH:mm:ss');
    group.dataValues.createdAt = format(group.createdAt, 'yyyy-MM-dd HH:mm:ss');
    group.dataValues.numMembers = await Membership.count({
        where: { groupId: group.id}
    })

    res.json(group)
})

// POST
// Creates and returns a new group
router.post('/', requireAuth, groupValidator, async (req, res) => {
    const newGroup = await Group.create({ organizerId: req.user.id, ...req.body});
    const newGroupObj = makeGroupObj(newGroup)
    res.status(201).json(newGroupObj);
});

// Create and return a new image for a group specified by id
router.post('/:groupId/images', requireAuth, async (req, res, next) => {
    const group = await Group.findByPk(req.params.groupId,{
        include: {
            model: GroupImage,
            attributes: []
        }
    });

    if (!group) return next(notFound('Group'));

    if (req.user.id !== group.organizerId) return next(forbidden());

    const newImage = await group.createGroupImage(req.body);

    res.json({ id: newImage.id, url: newImage.url, preview: newImage.preview});
})

// Create a new Venue for a Group specified by its id
router.post('/:groupId/venues', requireAuth, venueValidator, async (req, res, next) => {
    const group = await Group.findByPk(req.params.groupId, {
        attributes: ['id','organizerId'],
        include: [
            {
                model: Venue,
            },
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
    });

    // Check if group was found
    if (!group) return next(notFound('Group'));

    // Check if user id matches one of the co-hosts
    const cohosts = group.Memberships;
    let userCohost= false;
    cohosts.forEach( cohost => {
        if (req.user.id === cohost.userId) userCohost = true;
    })

    // Check if user is not the organizer or a co-host
    if (req.user.id !== group.organizerId && userCohost === false) return next(forbidden());

    const newVenue = await group.createVenue(req.body)

    newVenue.dataValues.updatedAt = undefined;
    newVenue.dataValues.createdAt = undefined;
    console.log(newVenue)
    res.json(newVenue)
})

// Create an Event for a Group specified by its id
router.post('/:groupId/events', requireAuth, eventValidator, async (req, res, next) => {
    if (req.body.venueId === undefined) req.body.venueId = null;
    const group = await Group.findByPk(req.params.groupId, {
        attributes: ['id','organizerId'],
        include: [
            {
                model: Venue,
                where: { id: req.body.venueId},
                attributes: ['id'],
                required: false
            },
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
    });

    console.log(group)
    // Check if group was found
    if (!group) return next(notFound('Group'));
    if (req.body.venueId && group.Venues.length === 0) return next(notFound('Venue'))


    // Check if user id matches one of the co-hosts
    const cohosts = group.Memberships;
    let userCohost= false;
    cohosts.forEach( cohost => {
        if (req.user.id === cohost.userId) userCohost = true;
    })

    // Check if user is not the organizer or a co-host
    if (req.user.id !== group.organizerId && userCohost === false) return next(forbidden());

    const newEvent = await group.createEvent(req.body)
    const newEventObj = makeEventObj(newEvent);

    res.json(newEventObj)
})

// PUT
// edit a group
router.put('/:groupId', requireAuth, groupValidator, async (req, res, next) => {
    const group = await Group.findByPk(req.params.groupId);

    if (!group) return next(notFound('Group'));

    if (req.user.id !== group.organizerId) return next(forbidden());

    await group.update(req.body);

    const groupObj = makeGroupObj(group)
    res.json(groupObj)
});

// DELETE
// Delete an existing group
router.delete('/:groupId', requireAuth, async (req, res, next) => {
    const group = await Group.findByPk(req.params.groupId);

    if (!group) return next(notFound('Group'));

    if (req.user.id !== group.organizerId) return next(forbidden());

    await group.destroy();
    res.json({ message: 'Successfully deleted'});
})


module.exports = router;
