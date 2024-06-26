'use strict';

const { Event } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

const demoEvents = [
  {
    groupId: 1, // Leliana's group
    venueId: null,
    name: "Secrets of the Spymaster",
    type: "Online",
    capacity: 50,
    price: 15.00,
    description: "An online event where Leliana shares her secrets of espionage and intrigue.",
    startDate: "2024-07-01 20:00:00",
    endDate: "2024-07-01 22:00:00"
  },
  {
    groupId: 2, // Solas's group
    venueId: null,
    name: "Exploring the Fade",
    type: "Online",
    capacity: 30,
    price: 20.00,
    description: "Join Solas as he guides you through the mysteries of the Fade.",
    startDate: "2024-07-05 18:00:00",
    endDate: "2024-07-05 20:00:00"
  },
  {
    groupId: 3, // Vivienne's group
    venueId: 3,
    name: "The Grand Enchanter's Gala",
    type: "In person",
    capacity: 100,
    price: 500.00,
    description: "A luxurious evening hosted by Vivienne, filled with magic and elegance.",
    startDate: "2024-07-10 19:00:00",
    endDate: "2024-07-10 23:00:00"
  },
  {
    groupId: 4, // Alistair's group
    venueId: 4,
    name: "Warden's Training Session",
    type: "In person",
    capacity: 25,
    price: 10.00,
    description: "Train with Alistair and learn what it takes to become a Grey Warden.",
    startDate: "2024-07-15 10:00:00",
    endDate: "2024-07-15 12:00:00"
  },
  {
    groupId: 5, // Morrigan's group
    venueId: 5,
    name: "Rituals of the Wilds",
    type: "In person",
    capacity: 10,
    price: 30.00,
    description: "Join Morrigan for an online session on ancient rituals and spells from the Korcari Wilds.",
    startDate: "2024-07-20 21:00:00",
    endDate: "2024-07-20 23:00:00"
  },
  {
    groupId: 1, // Leliana's group
    venueId: 1,
    name: "Secrets of the Spymaster - Advanced Techniques",
    type: "In person",
    capacity: 50,
    price: 20.00,
    description: "An advanced session where Leliana delves deeper into the art of espionage.",
    startDate: "2024-08-01 20:00:00",
    endDate: "2024-08-01 22:00:00"
  },
  {
    groupId: 2, // Solas's group
    venueId: 2,
    name: "The Veil and Beyond",
    type: "In person",
    capacity: 30,
    price: 25.00,
    description: "Explore the mysteries of the Veil and its impact on the world with Solas.",
    startDate: "2024-08-05 18:00:00",
    endDate: "2024-08-05 20:00:00"
  },
  {
    groupId: 3, // Vivienne's group
    venueId: 3,
    name: "Imperial Elegance: A Week-Long Retreat",
    type: "In person",
    capacity: 20,
    price: 1000.00,
    description: "Join Vivienne for a luxurious week-long retreat filled with elegance, discussions on fashion, and the intricacies of Orlesian society.",
    startDate: "2024-09-01 14:00:00",
    endDate: "2024-09-07 12:00:00"
  }
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await Event.bulkCreate(demoEvents, { validate: true})
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Events';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      groupId: { [Op.in]: [1, 2, 3, 4, 5] }
    }, {});
  }
};
