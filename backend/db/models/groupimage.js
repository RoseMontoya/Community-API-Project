'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GroupImage extends Model {

    static associate(models) {
      // define association here
      GroupImage.belongsTo(models.Group, {
        foreignKey: 'groupId'
      })
    }
  }
  GroupImage.init({
    groupId: {
      type: DataTypes.INTEGER,
        references: {
          model: 'Groups'
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
    modelName: 'GroupImage',
  });
  return GroupImage;
};
