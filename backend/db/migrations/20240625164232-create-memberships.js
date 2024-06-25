'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Memberships', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users'
        },
        onDelete: 'CASCADE'
      },
      groupId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Groups'
        },
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('co-host', 'member', 'pending'),
        defaultValue: 'pending'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, options);

    options.tableName = "Memberships"
    await queryInterface.addIndex(
      options,
      ['groupId', 'userId'],
      {
        unique: true,
        name: 'idx_group_user'
      })
  },
  async down(queryInterface, Sequelize) {
    options.tableName = 'Memberships'
    await queryInterface.removeColumn(options, 'idx_group_user')
    return await queryInterface.dropTable(options);
  }
};
