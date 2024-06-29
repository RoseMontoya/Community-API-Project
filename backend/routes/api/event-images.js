const express = require('express');
const { Sequelize, Op } = require('sequelize');

const { requireAuth } = require('../../utils/auth');
const { makeGroupObj, notFound, forbidden} = require('../../utils/helpers')
const { Group, Membership, GroupImage, User, Venue, EventImage, Event} = require('../../db/models');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

router.delete('/:imageId', requireAuth, async (req, res, next) => {
    const image  = await EventImage.findByPk(req.params.imageId, {
        include: [
            {
                model: Event,
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
                                attributes: ['userId'],
                                required: false
                            }
                        ]
                    }
                ]
            }

        ]
    })

    // console.log(image.Event.Group.Memberships)
    // Check if image was found
    if (!image) return next(notFound('Event Image'));

    // Check if user id matches one of the co-hosts
    const group = image.Event.Group
    const cohosts = group.Memberships;
    let userCohost= false;
    cohosts.forEach( cohost => {
        console.log(cohost.userId)
        if (req.user.id === cohost.userId) userCohost = true;
    })

    // Check if user is not the organizer or a co-host
    if (req.user.id !== group.organizerId && !userCohost ) return next(forbidden());

    await image.destroy();

    res.json({ message: 'Successfully deleted' })
})

module.exports = router
