'use strict';

const { Group } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

const demoGroups = [
  {
    organizerId: 1,
    name: "Gathering of the Inquisition",
    about: "A grand meeting to discuss the future of Thedas and the role of the Inquisition.",
    type: "In person",
    private: false,
    city: "Skyhold",
    state: "Frostback Mountains",
  },
  {
    organizerId: 2,
    name: "The Fade and Beyond",
    about: "A deep dive into the mysteries of the Fade, led by Solas.",
    type: "Online",
    private: true,
    city: "Fade",
    state: "Fade",
  },
  {
    organizerId: 3,
    name: "Grand Enchanter's Gala",
    about: "A prestigious event hosted by Vivienne to celebrate magical achievements.",
    type: "In person",
    private: true,
    city: "Val Royeaux",
    state: "Orlais",
  },
  {
    organizerId: 4,
    name: "Grey Warden Reunion",
    about: "A gathering of Grey Wardens to discuss darkspawn threats and future strategies.",
    type: "In person",
    private: false,
    city: "Denerim",
    state: "Ferelden",
  },
  {
    organizerId: 5,
    name: "Secrets of the Wilds",
    about: "A workshop on ancient magics and rituals, taught by Morrigan.",
    type: "Online",
    private: true,
    city: "Korcari",
    state: "Wilds",
  },
]

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await Group.bulkCreate(demoGroups, { validate: true })
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Groups';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      organizerId: { [Op.in]: [1, 2, 3, 4, 5] }
    }, {});
  }
};
