'use strict';

export default function(sequelize, DataTypes) {
  return sequelize.define('moneyBank', {
    _id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    accountId: DataTypes.INTEGER,
    bankName: DataTypes.STRING,
    bankAlias: DataTypes.STRING,
    active: DataTypes.BOOLEAN,
    status: DataTypes.ENUM
  });
}
