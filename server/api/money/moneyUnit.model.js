'use strict';

export default function(sequelize, DataTypes) {
  return sequelize.define('moneyUnit', {
    _id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    currency: DataTypes.ENUM,
    unitName: DataTypes.String,
    unitAlias: DataTypes.String,
    status: DataTypes.ENUM
  });
}
