'use strict';

export default function(sequelize, DataTypes) {
  return sequelize.define('moneyCard', {
    _id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    accountId: DataTypes.INTEGER,
    cardId: DataTypes.INTEGER,
    type: DataTypes.ENUM,
    active: DataTypes.boolean,
    status: DataTypes.ENUM
  });
}
