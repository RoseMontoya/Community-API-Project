'use strict';
const {
  Model, Sequelize
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    static associate(models) {
      // define association here
      Group.belongsTo(models.User, {
        foreignKey: 'organizerId',
        as: 'Organizer'
      }),

      Group.hasMany(models.Membership, {
        foreignKey: 'groupId',
        onDelete: "CASCADE"
      })

      Group.hasMany(models.GroupImage, {
        foreignKey: 'groupId',
        onDelete: 'CASCADE'
      })

      Group.hasMany(models.Venue, {
        foreignKey: 'groupId',
        onDelete: 'CASCADE'
      })

      Group.hasMany(models.Event, {
        foreignKey: 'groupId',
        onDelete: 'CASCADE'
      })

    }
  }
  Group.init({
    organizerId: {
      type: DataTypes.INTEGER,
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
    // scopes: {
    //   includeMemsAndPreview: {
    //     include: [
    //       {
    //           model: 'Memberships',
    //           attributes: [[Sequelize.fn('COUNT', Sequelize.col('userId')), 'numMembers']],
    //           duplicating: false

    //       },
    //       {
    //           model: 'GroupImages',
    //           where: { preview: true},
    //           attributes: ['url'],
    //           duplicating: false,
    //       }
    //   ],
    //   group: 'Group.id',
    //   }
    // }
  });
  return Group;
};
