'use strict';

export default function(sequelize, DataTypes) {
  return sequelize.define('moneyHistory', {
    _id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    payerAccountId: DataTypes.INTEGER,
    payeeAccountId: DataTypes.INTEGER,
    changerId: DataTypes.INTEGER,
    changeTime: DataTypes.INTEGER,
    changeType: DataTypes.ENUM,
    changeAmount: DataTypes.NUMBER,
    changeUnitId: DataTypes.INTEGER,
    status: DataTypes.ENUM
  });
}
