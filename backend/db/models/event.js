'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    static associate(models) {
      // define association here
      Event.belongsTo(models.Venue, {
        foreignKey: 'venueId'
      });

      Event.belongsTo(models.Group, {
        foreignKey: 'groupId'
      });

      Event.hasMany(models.Attendance, {
        foreignKey: 'eventId',
        onDelete: 'CASCADE'
      })
    }
  }
  Event.init({
    venueId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Venues'
      },
      onDelete: "CASCADE"
  },
    groupId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Groups'
      },
      onDelete: 'CASCADE'
  },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
          len: [5, 50]
      }
  },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [50, 50000]
      }
  },
    type: {
      type: DataTypes.ENUM('Online', 'In person'),
      validate: {
        isIn: {
          args: [['Online', 'In person']],
          msg: 'Type must be Online or In person'
        }
      }
  },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true
      }
  },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0
      }
  },
    startDate: {
      type: DataTypes.DATE,
      validate: {
        isAfter: new Date().toString()
      }
  },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        // isAfter: this.startDate
      }
  },
  }, {
    sequelize,
    modelName: 'Event',
  });
  return Event;
};
