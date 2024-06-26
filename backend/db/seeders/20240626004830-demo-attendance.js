'use strict';

const { Attendance } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

const demoAttendances = [
  {
    eventId: 1,   // Event: Secrets of the Spymaster
    userId: 2,    // User: Solas
    status: "attending"
  },
  {
    eventId: 2,   // Event: Exploring the Fade
    userId: 3,    // User: Vivienne
    status: "attending"
  },
  {
    eventId: 3,   // Event: The Grand Enchanter's Gala
    userId: 1,    // User: Leliana
    status: "attending"
  },
  {
    eventId: 4,   // Event: Warden's Training Session
    userId: 7,    // User: Cassandra
    status: "attending"
  },
  {
    eventId: 5,   // Event: Rituals of the Wilds
    userId: 2,    // User: Solas
    status: "attending"
  },
  {
    eventId: 6,   // Event: Secrets of the Spymaster - Advanced Techniques
    userId: 7,    // User: Cassandra
    status: "attending"
  },
  {
    eventId: 7,   // Event: The Veil and Beyond
    userId: 8,    // User: Dorian
    status: "attending"
  },
  {
    eventId: 8,   // Event: Imperial Elegance: A Week-Long Retreat
    userId: 1,    // User: Leliana
    status: "attending"
  },
  {
    eventId: 1,   // Event: Secrets of the Spymaster (Duplicate for testing multiple attendances)
    userId: 2,    // User: Solas
    status: "pending"
  },
  {
    eventId: 2,   // Event: Exploring the Fade (Duplicate for testing multiple attendances)
    userId: 5,    // User: Morrigan
    status: "pending"
  },
  {
    eventId: 3,   // Event: The Grand Enchanter's Gala
    userId: 6,    // User: Varric
    status: "waitlist"
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await Attendance.bulkCreate(demoAttendances, {
      validate: true
    })
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Attendances';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      eventId: { [Op.in]: [1, 2, 3, 4, 5, 6, 7, 8, 9 ] }
    }, {});
  }
};
