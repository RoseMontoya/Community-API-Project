'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Membership extends Model {

    static associate(models) {
      // define association here
      Membership.belongsTo(models.Group, {
        foreignKey: 'groupId'
      });

      Membership.belongsTo(models.User, {
        foreignKey: 'userId'
      })
    }
  }
  Membership.init({
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users'
      },
      onDelete: 'CASCADE'
  },
    groupId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Groups'
      },
      onDelete: 'CASCADE'
  },
    status: {
      type: DataTypes.ENUM('co-host', 'member', 'pending'),
      defaultValue: 'pending',
      validate: {
        isIn: {
          args: [['co-host', 'member', 'pending']],
          msg: "Status must be 'co-host', 'member', or 'pending"
        }
      }
  },
  }, {
    sequelize,
    modelName: 'Membership',
    indexes: [
      {
        unique: true,
        fields: ['groupId', 'userId'],
        name: 'idx_group_user'
      }
    ]
  });
  return Membership;
};
