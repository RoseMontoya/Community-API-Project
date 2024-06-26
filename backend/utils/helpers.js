// * Groups
const makeGroupObj = (group) => {
    private = group.private === 0? false: true;
    groupObj = {
        id: group.id,
        organizerId: group.organizerId,
        name: group.name,
        about: group.about,
        type: group.type,
        private: private,
        city: group.city,
        state: group.state,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
        numMembers: group['Memberships.numMembers'],
        previewImage: group['GroupImages.url']
    };
    return groupObj;
};

const notFound = (req) => {
    let type;
    if (req.params.groupId) type = "Group";
    if (req.params.venueId) type = "Venue";
    if (req.params.eventId) type = "Event";
    const err = new Error(`${type} couldn't be found`)
    err.status = 404;
    return err;
}

module.exports = { makeGroupObj, notFound}