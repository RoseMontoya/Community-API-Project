'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Attendance extends Model {

    static associate(models) {
      // define association here
      Attendance.belongsTo(models.User, {
        foreignKey: 'userId'
      });

      Attendance.belongsTo(models.Event, {
        foreignKey: 'eventId'
      })
    }
  }
  Attendance.init({
    eventId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Events'
      },
      onDelete: 'CASCADE'
  },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users'
      },
      onDelete: 'CASCADE'
  },
    status: {
      type: DataTypes.ENUM('attending', 'waitlist', 'pending'),
      defaultValue: 'pending'
  },
  }, {
    sequelize,
    modelName: 'Attendance',
  });
  return Attendance;
};
