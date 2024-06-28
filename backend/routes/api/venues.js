const express = require('express');
const { Sequelize, Op } = require('sequelize');

const { requireAuth } = require('../../utils/auth');
const { makeGroupObj, notFound, forbidden} = require('../../utils/helpers')
const { Group, Membership, GroupImage, User, Venue } = require('../../db/models');

const { check } = require('express-validator');
const { handleValidationErrors, venueValidator } = require('../../utils/validation');

const router = express.Router();

// Edit a Venue
router.put('/:venueId', requireAuth, venueValidator, async (req, res, next) => {
    const venue = await Venue.findByPk(req.params.venueId, {
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

    });

    // Check if venue was found
    if (!venue) return next(notFound('Venue'));

    const group = venue.Group;
    // console.log(group)

    // Check if user id matches one of the co-hosts
    const cohosts = group.Memberships;
    let userCohost= false;
    cohosts.forEach( cohost => {
        console.log(req.user.id)
        if (req.user.id === cohost.userId) userCohost = true;
    })

    // Check if user is not the organizer or a co-host
    if (req.user.id !== group.organizerId && userCohost === false) return next(forbidden());

    await venue.update(req.body)

    venue.dataValues.Group = undefined;
    venue.dataValues.updatedAt = undefined;
    res.json(venue)
})

module.exports = router;
