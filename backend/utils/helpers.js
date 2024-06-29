const { format } = require('date-fns')

// * Groups
const makeGroupObj = (group) => {
    private = group.private === 0? false: true;
    numMembers = group['Memberships.numMembers']? +group['Memberships.numMembers'] : 'No members';
    previewImage = group['GroupImages.url']? group['GroupImages.url'] : 'No preview image available';
    groupObj = {
        id: group.id,
        organizerId: group.organizerId,
        name: group.name,
        about: group.about,
        type: group.type,
        private: private,
        city: group.city,
        state: group.state,
        createdAt: format(group.createdAt, 'yyyy-MM-dd HH:mm:ss'),
        updatedAt: format(group.updatedAt, 'yyyy-MM-dd HH:mm:ss'),
        numMembers: numMembers,
        previewImage: previewImage
    };
    return groupObj;
};

const makeEventObj = (event) => {
    // console.log(typeof parseFloat(event.price.toFixed()))
    const obj = {
        id: event.id,
        groupId: event.groupId,
        venueId: event.venueId,
        name: event.name,
        type: event.type,
        capacity: event.capacity,
        price: parseFloat(event.price.toFixed(2)), // ! need to fix price to number with correct decimals
        description: event.description,
        startDate: format(event.startDate, 'yyyy-MM-dd HH:mm:ss'),
        endDate: format(event.endDate, 'yyyy-MM-dd HH:mm:ss')
    }
    return obj;
}

const notFound = (type) => {
    let err;
    if (type === 'Membership') {
        err = new Error(`Membership between the user and the group does not exist`)
    } else {
        err = new Error(`${type} couldn't be found`)
    }
    err.status = 404;
    return err;
};

const forbidden = () => {
    const err = new Error('Forbidden');
    err.status = 403;
    return err;
}

module.exports = { makeGroupObj, makeEventObj, notFound, forbidden}
