const express = require('express');
const { Sequelize, Op } = require('sequelize');

const { requireAuth } = require('../../utils/auth');
const { makeGroupObj, notFound, forbidden} = require('../../utils/helpers')
const { Group, Membership, GroupImage, User, Venue } = require('../../db/models');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

// Delete an Image for a Group
router.delete('/:imageId', requireAuth, async (req, res, next) => { // ! double check this route for not found image
    // Search for Image
    const image = await GroupImage.findByPk(req.params.imageId, {
        include: [
            {
                //Include organizer from group
                model: Group,
                attributes: ['organizerId'],
                include: [
                    {
                        // Going through group, get members with status of co-host
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
    });

    // Check user id matches one of the co-hosts
    const cohosts = image.Group.Memberships;
    let userCohost= false;
    cohosts.forEach( cohost => {
        if (req.user.id === cohost.userId) userCohost = true;
    })

    // Check if image was found
    if (!image) return next(notFound('Group Image'));

    // Check if user is not the organizer or a co-host
    if (req.user.id !== image.Group.organizerId && userCohost === false) return next(forbidden());

    // res.json(image)
    // Destory image and return a success
    await image.destroy();
    res.json({ "message": "Successfully deleted" })
})



module.exports = router;
