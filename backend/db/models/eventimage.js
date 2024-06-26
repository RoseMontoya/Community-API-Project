'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EventImage extends Model {
    static associate(models) {
      // define association here
      EventImage.belongsTo(models.EventImage, {
        foreignKey: 'eventId'
      })

    }
  }
  EventImage.init({
    eventId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Events'
      },
      onDelete: 'CASCADE'
  },
    url: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isUrl: true
      }
  },
    preview: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
  },
  }, {
    sequelize,
    modelName: 'EventImage',
  });
  return EventImage;
};