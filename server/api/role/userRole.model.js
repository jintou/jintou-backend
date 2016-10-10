'use strict';

import _ from 'lodash';
var Promise = require("bluebird");
import TreeTable from '../../sqldb/treeTable';
import sqldb from '../../sqldb';

export default function (sequelize, DataTypes) {
	return sequelize.define('UserRole', {
		_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		userId: {
			type: DataTypes.INTEGER,
			defaultValue: -1
		},
		roleId: {
			type: DataTypes.INTEGER,
			defaultValue: -1
		},
		spaceId: {
			type: DataTypes.INTEGER,
			defaultValue: -1
		},
		invitorId: {
			type: DataTypes.INTEGER,
			defaultValue: -1
		},
		joinStatus: {
			type: DataTypes.ENUM,
			values: ['applying', 'following', 'joined', 'rejected', 'cancelled'],
			defaultValue: 'joined'
		},
		active: DataTypes.BOOLEAN
	}, {
			classMethods: {
				//params: [{userId,roleId[roleName]},...]
				batchAdd: function (params) {
					//console.log('batchAdd in userRole model:',JSON.stringify(params));
					var that = this;
					var theParams = [];
					var Role = sqldb.Role;
					if (_.isArray(params)) {
						//console.log('2 batchAdd in userRole model:',JSON.stringify(params));
						return Promise.each(params, function (ur) {
							//console.log('batchAdd in userRole model:ur:',JSON.stringify(ur));
							if (ur.roleId && ur.userId) {
								//console.log('1 theParams',JSON.stringify(theParams));
								if (ur.spaceId) {
									theParams.push(ur);
									//console.log('2 theParams',JSON.stringify(theParams));
									return Promise.resolve(null);
								} else {
									//console.log('4 theParams',JSON.stringify(theParams));
									return Role.findById(ur.roleId).then(function (role) {
										ur.spaceId = role.spaceId;
										theParams.push(ur);
										//console.log('3 theParams',JSON.stringify(theParams));
										return Promise.resolve(null);
									})
								}
							} else {
								if (ur.spaceId) {
									//console.log('6 theParams',JSON.stringify(theParams));
									var roleName, roleAlias;
									var roleData;
									if (ur.role && typeof ur.role === 'string') {
										roleName = ur.role;
									}
									if (ur.role && typeof ur.role === 'object') {
										roleName = ur.role.name;
										roleAlias = ur.role.alias;
									}
									if (ur.roleName) {
										roleName = ur.roleName;
									}
									if (roleName) {
										//console.log('7 theParams',JSON.stringify(theParams));
										return Role.add({
											name: roleName,
											alias: roleAlias || roleName,
											spaceId: ur.spaceId
										}).then(function (role) {
											//console.log('5 role',JSON.stringify(role));
											ur.roleId = role._id;
											theParams.push(ur);
											//console.log('5 theParams',JSON.stringify(theParams));
											return Promise.resolve(null);
										})
									}
								} else {
									//Promise.reject('fail to find spaceId!');
								}
							}
						}).then(function () {
							var rets = [];
							//console.log('6 theParams',JSON.stringify(theParams));
							return Promise.each(theParams, function (o) {
								return that.findOrCreate({
									where: {
										userId: o.userId,
										roleId: o.roleId,
										spaceId: o.spaceId
									},
									defaults: {}
								}).spread(function (r, created) {
									rets.push(r);
									return Promise.resolve(null);
								})
							}).then(function () {
								return Promise.resolve(rets);
							})
							//return that.bulkCreate(theParams);
						});
					}
				},
				add: function (data) {
					var params = [];
					params.push(data);
					return this.batchAdd(params).then(function (results) {
						if (_.isArray(results)) {
							return Promise.resolve(results[0]);
						} else {
							return Promise.reject('fail to add user role');
						}
					})
				}

			}
		}
	);
}
