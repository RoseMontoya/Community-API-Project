'use strict';

const { Venue } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

const demoVenues = [
  {
    groupId: 1, // Leliana's group
    address: "123 Skyhold Lane",
    city: "Skyhold",
    state: "Frostback Mountains",
    lat: 40.712776,
    lng: -74.005974
  },
  {
    groupId: 2, // Solas's group
    address: "456 Fade St",
    city: "Fade",
    state: "Fade",
    lat: 41.878113,
    lng: -87.629799
  },
  {
    groupId: 3, // Vivienne's group
    address: "789 Orlais Ave",
    city: "Val Royeaux",
    state: "Orlais",
    lat: 29.951065,
    lng: -90.071533
  },
  {
    groupId: 4, // Alistair's group
    address: "101 Templar Rd",
    city: "Denerim",
    state: "Ferelden",
    lat: 42.360081,
    lng: -71.058884
  },
  {
    groupId: 5, // Morrigan's group
    address: "202 Wilds Blvd",
    city: "Korcari",
    state: "Wilds",
    lat: 37.774929,
    lng: -122.419418
  }
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await Venue.bulkCreate(demoVenues, { validate: true })
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Venues';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      groupId: { [Op.in]: [1, 2, 3, 4, 5] }
    }, {});
  }
};
