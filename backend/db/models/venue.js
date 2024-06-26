'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Venue extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Venue.belongsTo(models.Group, {
        foreignKey: 'groupId'
      });

      Venue.hasMany(models.Event, {
        foreignKey: 'venueId',
        onDelete: 'CASCADE'
      })
    }
  }
  Venue.init({
    groupId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Groups'
      },
      onDelete: 'CASCADE'
  },
    address: {
      type: DataTypes.STRING(50),
      allowNull: false
  },
    city: {
      type: DataTypes.STRING(30),
      allowNull: false
  },
    state: {
      type: DataTypes.STRING(30),
      allowNull: false
  },
    lat: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: -90,
        max: 90,
        isNumeric: true,
      }
  },
    lng: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: -180,
        max: 180,
        isNumeric: true,
      }
  },
  }, {
    sequelize,
    modelName: 'Venue',
  });
  return Venue;
};
