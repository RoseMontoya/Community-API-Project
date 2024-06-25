'use strict';

const { GroupImage } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const demoGroupImages = [
  // Group 1 - Leliana's group
  {
    groupId: 1,
    url: "https://example.com/leliana_preview.jpg",
    preview: true
  },
  {
    groupId: 1,
    url: "https://example.com/leliana_non_preview.jpg",
    preview: false
  },
  // Group 2 - Solas's group
  {
    groupId: 2,
    url: "https://example.com/solas_preview.jpg",
    preview: true
  },
  {
    groupId: 2,
    url: "https://example.com/solas_non_preview.jpg",
    preview: false
  },
  // Group 3 - Vivienne's group
  {
    groupId: 3,
    url: "https://example.com/vivienne_preview.jpg",
    preview: true
  },
  {
    groupId: 3,
    url: "https://example.com/vivienne_non_preview.jpg",
    preview: false
  },
  // Group 4 - Alistair's group
  {
    groupId: 4,
    url: "https://example.com/alistair_preview.jpg",
    preview: true
  },
  {
    groupId: 4,
    url: "https://example.com/alistair_non_preview.jpg",
    preview: false
  },
  // Group 5 - Morrigan's group
  {
    groupId: 5,
    url: "https://example.com/morrigan_preview.jpg",
    preview: true
  },
  {
    groupId: 5,
    url: "https://example.com/morrigan_non_preview.jpg",
    preview: false
  }
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await GroupImage.bulkCreate(demoGroupImages, { validate: true })
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'GroupImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      groupId: { [Op.in]: [1, 2, 3, 4, 5] }
    }, {});
  }
};
