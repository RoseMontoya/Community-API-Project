'use strict';

const { User } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await User.bulkCreate([
      {
        firstName: "Leliana",
        lastName: "Oisine",
        email: "leliana@spymaster.com",
        username: "TheNightingale",
        "hashedPassword": bcrypt.hashSync("chantrysecrets")
      },
      {
          firstName: "Solas",
          lastName: "Wolf",
          email: "theDreadWolf@fade.com",
          username: "ApostateSolas",
          "hashedPassword": bcrypt.hashSync("fadewalker123")
      },
      {
          firstName: "Vivienne",
          lastName: "de Fer",
          email: "vivienne.defer@example.com",
          username: "MadameDeFer",
          "hashedPassword": bcrypt.hashSync("imperialenvy999")
      },
      {
        firstName: "Alistair",
        lastName: "Theirin",
        email: "alistair.theirin@gmail.com",
        username: "greywardenlover",
        hashedPassword: bcrypt.hashSync("greywarden123")
      },
      {
        firstName: "Morrigan",
        lastName: "Flemeth",
        email: "morrigan.flemeth@yahoo.com",
        username: "WickedWitchofTheWilds",
        hashedPassword: bcrypt.hashSync("darkritual")
      },
      {
        firstName: "Varric",
        lastName: "Tethras",
        email: "varric.tethras@hotmail.com",
        username: "VarricT",
        hashedPassword: bcrypt.hashSync("bianca987")
      },
      {
        firstName: "Cassandra",
        lastName: "Pentaghast",
        email: "cassandra.pentaghast@example.com",
        username: "SeekerCassandra",
        hashedPassword: bcrypt.hashSync("righteousness777")
      },
      {
        firstName: "Dorian",
        lastName: "Pavus",
        email: "dorian.pavus@tevinter.imperium",
        username: "DorianPavus",
        hashedPassword: bcrypt.hashSync("magisterial123")
      },
      {
        firstName: "Josephine",
        lastName: "Montilyet",
        email: "josephine.montilyet@inquisition.com",
        username: "AmbassadorJosephine",
        hashedPassword: bcrypt.hashSync("diplomacy123")
      }
    ], { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Users';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      username: { [Op.in]: ["TheNightingale", "ApostateSolas", "MadameDeFer","greywardenlover", "WickedWitchofTheWilds", "VarricT", "SeekerCassandra", "DorianPavus", "AmbassadorJosephine"] }
    }, {});
  }
};
