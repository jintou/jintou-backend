'use strict';

import sqldb from '../../sqldb';
import _ from 'lodash';
var Promise = require("bluebird");

export default function (sequelize, DataTypes) {
	return sequelize.define('Space', {
		_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		name: {
			type: DataTypes.STRING,
			unique: {
				msg: 'The specified space name is already in use.'
			}
		},
		alias: DataTypes.STRING,
		description: DataTypes.STRING,
		typeId: DataTypes.INTEGER,
		active: DataTypes.BOOLEAN
	}, {
			getterMethods: {
				profile: function () {
					return {
						alias: this.alias,
						description: this.description
					}
				}
				/*
				type: function(){
					return Category.findById(typeId);
				}
				*/
			},
			classMethods: {
				getSpace: function (spaceData) {
					var isReturned = false;
					if (!isNaN(spaceData) && spaceData > 0) {
						isReturned = true;
						return this.findById(spaceData);
					}
					var findData = {};
					var whereData = {};
					if (typeof spaceData === 'string') {
						spaceData = {
							name: spaceData
						};
					}

					if (typeof spaceData === 'object') {
						if (spaceData.name) {
							findData.name = spaceData.name;
							whereData=  {
								where: {
									name: spaceData.name
								}
							}
						}
					}
					//console.log('getSpace-before find--findData:',JSON.stringify(findData));
					if (Object.keys(findData).length > 0) {
						isReturned = true;
						//console.log('2 getSpace-before find--findData:',JSON.stringify(findData));
						//console.log('getSpace-before find--whereData:',JSON.stringify(whereData));
						return this.find(whereData)
					}

					if (!isReturned) {
						//console.log('11');
						return Promise.resolve(null);
					}
				},
				getUserSpaces: function (userId) {
					UserRole.belongsTo(User);
					UserRole.blongsTo(this);
					return UserRole.findAll({
						attributes: ['spaceId', 'userId'],
						where: { userId: userId },
						include: [User, this],
						group: ['spaceId']
					});
				},
				addType: function (typeData) {
					return this.getType(typeData, true);
				},
				getType: function (typeData, autoCreated) {
					//console.log('in space Category:', typeData);
					//console.log('in space User:', User);
					//console.log('in space sqldb:', sqldb);
					var Category = sqldb.Category;
					//var Category = sqldb.Category;
					//console.log('in space Category:', Category);
					if (typeof typeData === 'string' && isNaN(typeData)) {
						var typeName = typeData;

						typeData = {};

						typeData.name = typeName;

						//console.log('in space getType');
						//console.log('in space Category:', Category);
						//console.log('space getType typeData:', JSON.stringfy(typeData));
					}

					if (!isNaN(typeData) && typeData > 0) {
						return Category.findById(typeData);
					}

					if (typeof typeData === 'object' && !_.isEmpty(typeData)) {
						typeData.owner = 'space';
						var tyName = typeData.name;
						if (tyName.substr(0, 5).toLowerCase() !== 'space') {
							tyName = 'space.' + tyName;
						}
						typeData.name = tyName;
						//console.log('space model typeData:', JSON.stringify(typeData));
						return Category.getType(typeData, true);
					}

					//otherwise return promise reject
					sequelize.Promise.reject(new Error('fail to add type!'));
				},
				//this function can use to create
				//params: {name:xxx, alias:xxx, type:xxx, roles: [...]}
				//return space with type and roles
				add: function (spaceData) {
					var that = this;
					var typeId, spaceId;
					var Category = sqldb.Category;
					var Role = sqldb.Role;
					var App = sqldb.App;

					this.hasMany(Role, { as: 'roles' });
					this.hasMany(App, { as: 'apps' });
					this.belongsTo(Category, { as: 'type' });

					if (typeof spaceData === 'object') {
						//if valid space object ,just return it
						return new Promise(function (resolve, reject) {
							if (spaceData._id && isNaN(spaceData) && spaceData._id > 0) {
								spaceId = spaceData._id;
								return Promise.resolve(spaceData);
							}
							else if (spaceData.name) { //find space, then return
								return that.find({
									where: {
										name: spaceData.name
									}
								}).then(function (space) {
									if (space && space._id && space._id > 0) {
										spaceId = space._id;
										return resolve(space);
									} else {
										return resolve(null);
									}
								})
							}
							else {
								return resolve(null);
							}
						}).then(function (space) {
							if (space && space._id > 0) {
								spaceId = space._id;
								return Promise.resolve(space);
							} else { //create new space
								return new Promise(function (resolve, reject) {
									if (spaceData.typeId) {
										typeId = spaceData.typeId;
										return resolve(spaceData.typeId);
									} else if (spaceData.type) {
										if (spaceData.type.roles) {
											spaceData.roles = spaceData.type.roles;
											delete spaceData.type.roles;
										}
										if (spaceData.type.apps) {
											spaceData.apps = spaceData.type.apps;
											delete spaceData.type.roles;
										}
										return that.addType(spaceData.type).then(function (type) {
											typeId = type._id;
											return resolve(type._id);
										})
									} else {
										return resolve(null);
									}
								}).then(function (typeId) {
									//console.log('typeId:', typeId);
									spaceData.typeId = typeId;
									return that.findOrCreate({
										where: {
											name: spaceData.name //spaceName must be unique name
										},
										defaults: spaceData
									})
								}).spread(function (space, created) {
									spaceId = space._id;
									//console.log('space', JSON.stringify(space));
									if (spaceData.roles) {
										var hasAdmin = false;
										var hasMember = false;
										//var hasCustomer = false;
										var hasPublic = false;
										spaceData.roles.forEach(function (role) {
											if (role.name === 'admin') {
												role.allowDelete = false;
												hasAdmin = true;
											}
											if (role.name === 'member') {
												role.allowDelete = false;
												hasMember = true;
											}
											/*
											if(role.name === 'customer'){
												role.allowDelete = false;
												hasCustomer = true;
											}*/
											if (role.name === 'public') {
												role.allowDelete = false;
												hasPublic = true;
											}
										})

										if (!hasAdmin) {
											spaceData.roles.push(
												{
													name: "admin",
													allowDelete: false
												}
											)
										}

										if (!hasMember) {
											spaceData.roles.push(
												{
													name: "member",
													allowDelete: false
												}
											)
										}
										/*
										if(!hasCustomer){
											spaceData.roles.push(
												{
													name: "customer",
													allowDelete: false
												}
											)
										}*/
										if (!hasPublic) {
											spaceData.roles.push(
												{
													name: "public",
													allowDelete: false
												}
											)
										}
										return that.addRoles(spaceData.roles, space._id);
									} else {
										return Promise.resolve(null);
									}
								})
									.then(function () {
										//add apps
										var listAppData = spaceData.apps || null;
										//console.log('listAppData:',JSON.stringify(listAppData));
										if (listAppData && Array.isArray(listAppData)) {
											return Promise.each(listAppData, function (appData, index) {
												return App.add(appData, spaceId);
											})
										} else {
											return Promise.resolve(null);
										}
									})
									.then(function () {
										//console.log('spaceId:', spaceId);
										return that.find({
											where: {
												_id: spaceId
											},
											include: [
												{
													model: Category, as: 'type'
												},
												{
													model: Role, as: 'roles'
												},
												{
													model: App, as: 'apps'
												}
											]
										}).then(function (space) {
											//console.log('space:',JSON.stringify(space));
											return Promise.resolve(space);
										})
									})
							}
						})
					}
					//if spaceId, return by spaceid
					else if (isNaN(spaceData) && spaceData > 0) {
						return Space.find({
							where: {
								_id: spaceData
							}
						})
					}
					else {
						return Promise.reject('not valide spacedata');
					}
				},

				addRoles: function (listRoleData, spaceId) {

					var that = this;
					var roles = [];

					return Promise.each(listRoleData, function (roleData) {

						return that.addRole(roleData, spaceId).then(function (role) {
							roles.push(role);
						})
					})
				},

				addRole: function (roleData, spaceId) {

					var Role = sqldb.Role;

					if (typeof roleData === 'string') {
						roleData = {
							name: roleData
						}
					}

					if (typeof roleData === 'object') {
						if (!isNaN(spaceId) && spaceId > 0) {
							roleData.spaceId = spaceId;
						}
						//console.log('roleData:',JSON.stringify(roleData));
						if (!roleData.spaceId || !roleData.name || roleData.name === "") {
							return Promise.reject('please provide spaceId and role name!');
						}
						//console.log('before space model add role:', JSON.stringify(roleData));
						return Role.addRole(roleData);
					} else {
						return Promise.reject('fail to add role!');
					}

				},

				addUserSpace: function (user, spaceData, roleData, joinStatus, invitor) {
					var userId;
					var that = this;
					var UserRole = sqldb.UserRole;
					var isCreated = false;
					var oSpace, oUser;

					//console.log('joinStatus:',joinStatus);

					if (!isNaN(user) && user > 0) {
						userId = user;
					}
					if (typeof user === 'object') {
						userId = user._id || user.id || null;
					}
					if (joinStatus === 'created' || joinStatus ==='create') {
						isCreated = true;
						joinStatus = 'joined';
					}
					if (!['applying', 'following', 'joined'].includes(joinStatus)) {
						joinStatus = 'applying';
					}
					//console.log('joinStatus:',joinStatus);
					//console.log('isCreated:',isCreated);
					//console.log('1 userId:', userId);
					if (userId && userId > 0) {
						//console.log('2 userId:', userId)
						return new Promise(function (resolve, reject) {
							//console.log('before create--spaceData:',spaceData);
							if (isCreated) {
								//console.log('isCreated');
								joinStatus = "joined";
								//console.log('before addSpace space:',JSON.stringify(space));
								return that.add(spaceData).then(function (space) {
									//console.log('after addSpace space:',JSON.stringify(space));
									return resolve(space);
								});
							} else {
								//console.log('else before getSpace--spaceData:',JSON.stringify(spaceData));
								return that.getSpace(spaceData).then(function (space) {
									//console.log('after getspace--space:', JSON.stringify(space));
									return resolve(space);
								});
							}
						})
							.then(function (space) {
								//console.log('addUserSpace 1');
								//console.log('after getspace:',JSON.stringify(space));
								oSpace = space;
								if (invitor) {
									//console.log('before getUser--invitor:', invitor);
									User = sqldb.User;
									return User.getUser(invitor).then(function (user) {
										if (user) {
											oUser = user;
										}
										return Promise.resolve(user);
									})
								} else {
									return Promise.resolve(null);
								}
							})
							.then(function () {
								//console.log('before addRole--oSpace:',JSON.stringify(oSpace));
								var space = oSpace;
								//console.log('before space model add userSpace:', JSON.stringify(roleData));
								if (space) {
									//console.log('addUserSpace 3',JSON.stringify(space));
									return that.addRole(roleData, space._id).then(function (role) {
										//console.log('after space model addRole:', JSON.stringify(role));
										//console.log('addUserSpace 2');
										if (typeof role === 'object') {
											var defaultData = {
												joinStatus: joinStatus,
												spaceId: role.spaceId
											};
											if (oUser) {
												defaultData.invitorId = oUser._id;
											}
											//console.log('addUserSpace 3');
											return UserRole.findOrCreate({
												where: {
													userId: userId,
													roleId: role._id
												},
												defaults: defaultData
											}).spread(function (entity, created) {
												//console.log('addUserSpace 4');
												//console.log('addUserSpace created:',created);
												return Promise.resolve(entity);
											}).catch(function (err) {
												console.log('err:', err);
											})
										} else {
											return Promise.reject('role is invalid');
										}
									})
								} else {
									return Promise.reject('invalid space');
								}
							})
					} else {
						return Promise.reject('no userId');
					}
				},
			},
			instanceMethods: {

				addRole: function (roleData) {

					var Role = sqldb.Role;

					if (typeof roleData === 'string') {
						roleData = {
							name: roleData
						}
					}

					roleData.spaceId = this._id;

					return Role.addRole(roleData);
				}

			},
			hooks: {

			}
		});
}
