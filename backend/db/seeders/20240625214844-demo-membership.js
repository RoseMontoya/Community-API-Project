'use strict';

const { Membership } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

const demoMemberships = [
  {
    groupId: 1, // Group organized by user with organizerId 1 (Leliana)
    userId: 2, // Solas
    status: "member"
  },
  {
    groupId: 1, // Group organized by user with organizerId 1 (Leliana)
    userId: 7, // Cassandra
    status: "co-host"
  },
  {
    groupId: 2, // Group organized by user with organizerId 2 (Solas)
    userId: 3, // Vivienne
    status: "member"
  },
  {
    groupId: 2, // Group organized by user with organizerId 2 (Solas)
    userId: 5, // Morrigan
    status: "pending"
  },
  {
    groupId: 3, // Group organized by user with organizerId 3 (Vivienne)
    userId: 1, // Leliana
    status: "member"
  },
  {
    groupId: 3, // Group organized by user with organizerId 3 (Vivienne)
    userId: 9, // Josie
    status: "co-host"
  },
  {
    groupId: 4, // Group organized by user with organizerId 4 (Alistair)
    userId: 1, // Leliana
    status: "member"
  },
  {
    groupId: 4, // Group organized by user with organizerId 4 (Alistair)
    userId: 5, // Morrigan
    status: "member"
  },
  {
    groupId: 5, // Group organized by user with organizerId 5 (Morrigan)
    userId: 1, // Leliana
    status: "pending"
  },
  {
    groupId: 5, // Group organized by user with organizerId 5 (Morrigan)
    userId: 3, // Vivienne
    status: "member"
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await Membership.bulkCreate(demoMemberships, { validate: true })
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Memberships';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      groupId: { [Op.in]: [1, 2, 3, 4, 5 ] }
    }, {});
  }
};
