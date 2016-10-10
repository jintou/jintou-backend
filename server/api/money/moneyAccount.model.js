'use strict';

export default function(sequelize, DataTypes) {
  return sequelize.define('moneyAccount', {
    _id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    ownerId: DataTypes.INTEGER,
    owner: DataTypes.ENUM,
    issueSpaceId: DataTypes.INTEGER,
    type: DataTypes.ENUM,
    balance: DataTypes.NUMBER,
    moneyUnitId: DataTypes.INTEGER,
    active: DataTypes.boolean,
    status: DataTypes.ENUM
  });
}
