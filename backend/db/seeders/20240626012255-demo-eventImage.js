'use strict';

const { EventImage } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

const demoEventImages = [
  // Secrets of the Spymaster
  {
    eventId: 1,
    url: "https://example.com/secrets-of-the-spymaster-preview",
    preview: true
  },
  {
    eventId: 1,
    url: "https://example.com/secrets-of-the-spymaster-image",
    preview: false
  },

  // Exploring the Fade
  {
    eventId: 2,
    url: "https://example.com/exploring-the-fade-preview",
    preview: true
  },
  {
    eventId: 2,
    url: "https://example.com/exploring-the-fade-image",
    preview: false
  },

  // The Grand Enchanter's Gala
  {
    eventId: 3,
    url: "https://example.com/grand-enchanters-gala-preview",
    preview: true
  },
  {
    eventId: 3,
    url: "https://example.com/grand-enchanters-gala-image",
    preview: false
  },

  // Warden's Training Session
  {
    eventId: 4,
    url: "https://example.com/wardens-training-session-preview",
    preview: true
  },
  {
    eventId: 4,
    url: "https://example.com/wardens-training-session-image",
    preview: false
  },

  // Rituals of the Wilds
  {
    eventId: 5,
    url: "https://example.com/rituals-of-the-wilds-preview",
    preview: true
  },
  {
    eventId: 5,
    url: "https://example.com/rituals-of-the-wilds-image",
    preview: false
  },

  // Secrets of the Spymaster - Advanced Techniques
  {
    eventId: 6,
    url: "https://example.com/secrets-of-the-spymaster-advanced-preview",
    preview: true
  },
  {
    eventId: 6,
    url: "https://example.com/secrets-of-the-spymaster-advanced-image",
    preview: false
  },

  // The Veil and Beyond
  {
    eventId: 7,
    url: "https://example.com/veil-and-beyond-preview",
    preview: true
  },
  {
    eventId: 7,
    url: "https://example.com/veil-and-beyond-image",
    preview: false
  },

  // Imperial Elegance: A Week-Long Retreat
  {
    eventId: 8,
    url: "https://example.com/imperial-elegance-preview",
    preview: true
  },
  {
    eventId: 8,
    url: "https://example.com/imperial-elegance-image",
    preview: false
  }
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await EventImage.bulkCreate(demoEventImages, { validate: true })
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'EventImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      eventId: { [Op.in]: [1, 2, 3, 4, 5, 6, 7, 8] }
    }, {});
  }
};
