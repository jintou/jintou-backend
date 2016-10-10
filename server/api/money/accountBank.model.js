'use strict';

export default function(sequelize, DataTypes) {
  return sequelize.define('account_bank', {
    _id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    accountId: DataTypes.INTEGER,
    bankId: DataTypes.INTEGER,
    linkType: DataTypes.INTEGER,
    active: DataTypes.BOOLEAN,
    status: DataTypes.ENUM
  });
}
