'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    static associate(models) {
      // define association here
      Group.belongsTo(models.User, {
        foreignKey: 'organizerId'
      })
    }
  }
  Group.init({
    organizerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users'
      },
      onDelete: 'CASCADE'
  },
    name: {
      type: DataTypes.STRING(60),
      unique: true,
      allowNull: false,
      validate: {
        len: [2, 60]
      }
  },
    about: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [50, 50000]
      }
  },
    type: {
      type: DataTypes.ENUM('In person', 'Online'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['In person', 'Online']],
          msg: "Type must be 'Online' or 'In person'"
        }
      }
  },
    private: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
  },
    city: {
      type: DataTypes.STRING(50),
      allowNull: false
  },
    state: {
      type: DataTypes.STRING(50),
      allowNull: false
  },
  }, {
    sequelize,
    modelName: 'Group',
  });
  return Group;
};
