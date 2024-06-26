const express = require('express');
const { Sequelize, Op } = require('sequelize');

const { requireAuth } = require('../../utils/auth');
const { makeGroupObj, notFound, forbidden} = require('../../utils/helpers')
const { Group, Membership, GroupImage, User, Venue } = require('../../db/models');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

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
        group: 'Group.id',
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
        group: 'Group.id',
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

    group.dataValues.numMembers = await Membership.count({
        where: { groupId: group.id}
    })

    res.json(group)
})

// POST
// Creates and returns a new group
router.post('/', requireAuth, groupValidator, async (req, res) => {
    const newGroup = await Group.create({ organizerId: req.user.id, ...req.body});
    res.status(201).json(newGroup);
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

// PUT
// edit a group
router.put('/:groupId', requireAuth, groupValidator, async (req, res, next) => {
    const group = await Group.findByPk(req.params.groupId);

    if (!group) return next(notFound('Group'));

    if (req.user.id !== group.organizerId) return next(forbidden());

    await group.update(req.body);

    res.json(group)
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
