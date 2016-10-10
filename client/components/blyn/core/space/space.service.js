'use strict';

(function () {

	function SpaceService($resource, User, $q, Util, BApp, $rootScope, BRole, BCircle, $http) {
		var safeCb = Util.safeCb;
		var current = {};
		var resSpace = $resource('/api/spaces/:id/:controller', {
			id: '@_id'
		}, {
				userJoin: {
					method: 'Post',
					params: {
						id: 'userJoin'
					}
				},
				addType: {
					method: 'POST',
					params: {
						controller: 'addType'
					}
				},
				findUserSpaces: {
					method: 'GET',
					params: {
						id: 'user',
					},
					isArray: true
				},
				findAllJoinableSpace: {
					method: 'GET',
					params: {
						id: 'user',
						controller: 'joinable',
					},
					isArray: true
				},
				batchAddUserSpace: {
					method: 'POST',
					params: {
						id: 'user',
						controller: 'batch'
					},
					isArray: true
				}
			});


		var currentSpace = {};

		var service = {};

		service.getAllSpaces = function () {
			return $resource('/api/spaces/').query().$promise;
		}
		service.getUserSpaces = function (findData, callback) {
			//get: /api/spaces/user
			//return spaces
			return $q(function (resolve, reject) {
				var model = this;
				var spaces = [];
				if (findData == undefined) {
					findData = {
						userId: $rootScope.current.user._id
					}
				}
				if (angular.isNumber(findData)) {
					var userId = findData;
					findData = {
						userId: userId
					};
				}
				if (angular.isObject(findData)) {
					var typeName;
					var spaceId;
					for (var key in findData) {
						if (key === 'type' || key.toLowerCase() === 'typename') {
							typeName = findData[key];
							delete findData[key];
						}
						//use to find one use space
						if (key.toLowerCase() === 'spaceid' || key.toLowerCase() === 'id') {
							spaceId = findData[key];
							delete findData[key];
							findData.spaceId = spaceId;
						}
					}
					if (!findData.userId) {
						findData.userId = $rootScope.current.user._id;
					}
					return resSpace.findUserSpaces(findData).$promise.then(function (resources) {
						var spaces = [];
						resources.forEach(function (res) {
							//be default, only return none-person spaces
							if (typeName === undefined && res.type.name !== 'space.person.normal') {
								spaces.push(res);
							} else {
								if (typeName === res.type.name) {
									spaces.push(res);
								}
							}
						});
						return resolve(spaces);
						/*
						return $q(function(resolve, reject) {
							var spaces = [];
							angular.forEach(resources, function(resource) {
								model.getSpace(resource.spaceId).then(function(space) {
									spaces.push(space);
									spaces.length == resources.length && resolve(spaces);
								}, function(err) {
									reject(err);
								});
							});
						});
						*/
					}, function (err) {
						return $q.reject(err);
					});
				}
			});

			//otherwise, return []
			//return $q.reject('fail to get user spaces!');

		};

		service.getUserSpace = function (findData, callback) {
			if (typeof findData === 'number' || parseInt(findData) > 0) {
				findData = {
					spaceId: findData
				}
			}
			return this.getUserSpaces(findData, callback).then(function (spaces) {
				return spaces[0];
			})
		}

		service.getTypeSpaces = function (typeData, callback) {
			//get: /api/spaces/type
			//return spaces
			var queryData = {};
			queryData.id = 'type';
			if (isNaN(typeData) && typeData > 0) {
				queryData.typeId = typeData;
			}
			if (typeof typeData === 'object') {
				queryData = Object.assign(queryData, typeData);
			}
			return resSpace.query(queryData,
				function (data) {
					return safeCb(callback)(null, data);
				},
				function (err) {
					return safeCb(callback)(err);
				}).$promise;
		};

		service.getSpace = function (spaceId, callback) {
			//get: /api/spaces/:id
			//return spaces
			return resSpace.get({
				id: spaceId
			},
				function (data) {
					return safeCb(callback)(null, data);
				},
				function (err) {
					return safeCb(callback)(err);
				}).$promise;
		};

		/*
		service.create = function (spaceData, callback) {
			//post: /api/spaces/
			//return new space
			//console.log('space create spaceData:',JSON.stringify(spaceData));
			var model = this;
			var newSpace;
			return resSpace.save(spaceData,
				function (res) {
					safeCb(callback)(null, res);
					return res;
				},
				function (err) {
					return safeCb(callback)(err);
				})
				.$promise.then(function (res) {//add roles
					newSpace = res;
					return model.addRole({
						name: 'admin',
						spaceId: newSpace._id
					}).$promise.then(function (adminRole) {
						return model.addRole({
							name: 'member',
							spaceId: newSpace._id
						}).$promise;
					}).then(function (memberRole) {
						return model.addRole({
							name: 'customer',
							spaceId: newSpace._id
						}).$promise;
					});
				}).then(function (res) {//add app
					return model.addApp(newSpace._id, 'appEngine').then(function () {
						//console.log('newSpace:', newSpace);
						if (newSpace.type.name === 'space.person.normal') {
							return model.addApp(newSpace._id, 'userApp');
						} else {
							return model.addApp(newSpace._id, 'weMember');
						}
					});
				}).then(function (res) {//add user as admin
					return model.getRole({
						name: 'admin',
						spaceId: newSpace._id
					})
						.then(function (adminRole) {
							return BRole.addUserRole({
								userId: $rootScope.current.user._id,
								roleId: adminRole._id,
								spaceId: newSpace._id
							});
						})
						.then(function () {
							return newSpace;
						});
				});
		}*/

		service.create = function (spaceData) {
			var config, newSpace, theType;
			var that = this;
			return this.getConfig().then(function (conf) {
				config = conf;
				var types = config.types;
				theType = types[spaceData.type];
				if (theType) {
					spaceData.type = theType;
				}
				return resSpace.save(spaceData).$promise;
			}).then(function (space) {

				//add apps for space

				newSpace = space;
				var apps = ['appEngine'];

				if (newSpace.type.name === 'space.person.normal') {
					apps.push('userApp');
				} else {
					if (theType.apps) {
						theType.apps.forEach(function (appName) {
							if (appName.toLowerCase() != 'appengine') {
								apps.push(appName);
							}
						})
					}
				}

				return BApp.getConfig().then(function (appConfig) {
					var appDataCollection = [];
					apps.forEach(function (appName) {
						var appData = appConfig.apps[appName];
						appData.name = appName;
						appDataCollection.push(appData);
					})

					return BApp.bulkCreate(appDataCollection, newSpace._id);
				})

				/*

				var chain = $q.when();
				apps.forEach(function (appName) {
					chain = chain.then(that.addApp(newSpace._id, appName));
				})*/

				//return chain;

			}).then(function () {
				return that.getRole({
					name: 'admin',
					spaceId: newSpace._id
				})
					.then(function (adminRole) {
						return BRole.addUserRole({
							userId: $rootScope.current.user._id,
							roleId: adminRole._id,
							spaceId: newSpace._id
						});
					});
			}).then(function () {
				//add default circle
				if (newSpace.type.name.toLowerCase() !== 'space.person.normal') {
					return BCircle.create({
						spaceId: newSpace._id,
						name: newSpace.name + "_" + "circle",
						type: 'spacePrivateCircle',
						alias: '机构朋友圈'
					}).then(function () {
						return $q.when(newSpace);
					})
				} else {
					return $q.when(newSpace);
				}
			})
		}

		service.updateSpace = function (spaceId, updateData, callback) {
			//put: /api/spaces/:id
			//return updated space
			if (!isNaN(spaceId) && spaceId > 0) {
				updateData.id = spaceId;
			} else {
				aSpace = service.getCurrentSpace();
				updateData.id = aSpace.id;
			}

			return resSpace.update(updateData,
				function (data) {
					return safeCb(callback)(null, data);
				},
				function (err) {
					return safeCb(callback)(err);
				}).$promise;
		};

		service.addSpaceType = function (spaceId, typeData, callback) {
			//post: /api/spaces/:id/addType
			//return space with type
			var saveData = {};
			saveData.id = spaceId;
			if (!isNaN(typeData) && typeData > 0) {
				saveData.typeId = typeData;
			}
			if (typeof typeData === 'object') {
				saveData = Object.assign(saveData, typeData);
			}
			return resSpace.addType(saveData,
				function (data) {
					return safeCb(callback)(null, data);
				},
				function (err) {
					return safeCb(callback)(err);
				}).$promise;
		}

		service.setCurrent = function (spaceData) {
			var that = this;
			//return currentSpace = space;
			return this.loadConfig().then(function () {
				return that.loadSpace(spaceData);
			})
		};

		service.loadSpace = function (spaceData) {
			return this.find(spaceData).then(function (space) {
				current = space;
				return $q.when(space);
			})
		}

		service.getCurrent = function () {
			return current;
		}

		service.current = function (callback) {
			if (arguments.length === 0) {
				return currentSpace;
			}

			var value = (currentSpace.hasOwnProperty('$promise')) ?
				currentSpace.$promise : currentSpace;

			return $q.when(value)
				.then(space => {
					safeCb(callback)(space);
					return space;
				}, () => {
					safeCb(callback)({});
					return {};
				});
		};

		service.userJoin = function (spaceId, userId, status, callback) {
			//get: /api/spaces/:id/userJoin
			//return boolean
			var joinData = {
				spaceId: spaceId,
				userId: userId
			};
			if (status) {
				joinData.joinStatus = status;
			}
			return resSpace.userJoin(joinData,
				function (data) {
					return safeCb(callback)(null, data);
				},
				function (err) {
					return safeCb(callback)(err);
				}).$promise;
		};

		service.findAll = function (findData, callback) {

			if (angular.isObject(findData)) {
				return resSpace.query(findData).$promise.then(function (spaces) {
					return spaces[0];
				}).$promise;
			}

			//otherwise return error
			$q.reject('fail to find spaces!');
		};

		service.find = function (findData) {

			//console.log('in find space: ');

			if ((angular.isNumber(findData) && findData > 0) || (parseInt(findData) && parseInt(findData) > 0)) {
				return resSpace.get({
					id: findData
				}).$promise;
			}

			if (angular.isObject(findData)) {
				return resSpace.query(findData).$promise.then(function (spaces) {
					console.log('spaces:', spaces);
					return spaces[0];
				}).$promise;
			}

			//otherwise return error
			$q.reject('fail to find space!');
		}

		service.addApp = function (spaceId, appName) {
			return BApp.create(spaceId, appName);
			//return BApp.joinSpace(spaceId, appName);
		}

		service.addApps = function (listOfAppData, spaceId) {
			return BApp.bulkAdd(listOfAppData, spaceId);
		}

		service.initRoles = function (spaceId) {

			return BRole.addRoles([{
				spaceId: spaceId,
				roleName: 'admin'
			}, {
					spaceId: spaceId,
					roleName: 'member'
				}, {
					spaceId: spaceId,
					roleName: 'customer'
				},]);
		}

		service.addRole = function (roleData) {

			if (angular.isString(roleData)) {
				roleData = { name: rootData };
				roleData.spaceId = $rootScope.current.space.id;
			}

			if (angular.isObject(roleData)) {
				if (!roleData.spaceId) {
					roleData.spaceId = $rootScope.current.space.id;
				}
			}

			return BRole.addRole(roleData)
		}

		service.getRole = function (roleData) {

			var findData = {};

			if (angular.isString(roleData)) {
				findData.spaceId = $rootScope.current.space._id;
				findData.name = rootData
			}

			if (angular.isObject(roleData)) {
				if (!roleData.spaceId) {
					roleData.spaceId = $rootScope.current.space._id;
				}
				findData = roleData;
			}

			return BRole.find(findData).$promise;
		}

		service.findRole = function (roleData) {
			return this.getRole(roleData);
		}

		service.getRoles = function (roleData) {
			var findData = {};
			findData.spaceId = $rootScope.current.space._id;

			if (angular.isString(roleData)) {
				findData.name = rootData
			}

			if (angular.isObject(roleData)) {
				if (!roleData.spaceId) {
					roleData.spaceId = $rootScope.current.space._id;
				}
				findData = roleData;
			}

			return BRole.findAll(findData).$promise;
		}

		service.findRoles = function (roleData) {
			return this.getRoles(roleData);
		}

		service.getSpaceUsers = function (id) {
			var res = $resource('/api/users/sp/:spaceId');
			return res.query({ spaceId: id }).$promise;
		}

		service.getConfig = function (spaceData) {
			var model = this;
			return $http.get('/components/blyn/core/space/config.json').then(function (res) {
				return $q.when(res.data);
			});
		}

		service.findAllJoinableSpace = function (user) {
			return resSpace.findAllJoinableSpace({ userId: user._id }).$promise;
		}

		service.findAllFollowingSpace = function (user) {
			return resSpace.findUserSpaces({
				//userId: user._id,
				joinStatus: ['applying', 'following']
			}).$promise;
		}

		service.loadConfig = function (isCombined = true) {
            var that = this;
            return $http.get("components/blyn/core/space/config.json").then(function (oConfig) {
                current.config = oConfig.data;
				if (isCombined) {
					return $http.get("components/blyn/core/app/config.json").then(function (oConfig) {
						var appConfig = oConfig.data;
						var spaceConfig = current.config;
						var spaceTypes = spaceConfig.types;
						var configApps = appConfig.apps;
						var configUsers = spaceConfig.userSpaces.users;
						angular.forEach(spaceTypes, function (sType, tKey) {
							sType.name = tKey;
							var apps = sType.apps;
							var rApps = [];
							angular.forEach(configApps, function (oConfig, key) {
								apps.forEach(function (appName, index) {
									if (appName === key) {
										oConfig.name = key;
										rApps.push(oConfig);
									}
								})
							})
							sType.apps = rApps;
							//spaceConfig.type = sType;
						})

						angular.forEach(configUsers, function (userData, index) {
							var listUserData = [];
							userData.forEach(function (oUserData, index) {
								angular.forEach(spaceTypes, function (oType, key) {
									if (oUserData.spaceData && oUserData.spaceData.type === key) {
										oUserData.spaceData.type = oType;
									}
								})
								listUserData.push(oUserData);
							})
							spaceConfig['userSpaces']['users'][index] = listUserData;
						})
						current.config = spaceConfig
						return $q.when(current.config);
					})
				}

                return $q.when(current.config);

            })
        }

        service.getConfig = function (path) {
            var config = current.config;
            var list = path.splite('.');
            var o = config;
            var error = false;
            list.forEach(function (s) {
                if (o[s]) {
                    o = o[s];
                } else {
                    error = true;
                }
            })
            if (error) {
                return config;
            } else {
                return o;
            }
        }

		service.initUserSpaces = function (user) {

			var that = this;

			return this.loadConfig().then(function (config) {
				var configUserSpaces = config.userSpaces;
				var users = configUserSpaces.users;
				var uLoginId = user.loginId;

				var createList = [];
				if (configUserSpaces.users.hasOwnProperty('all')) {
					createList = createList.concat(configUserSpaces.users['all']);
				}

				if (configUserSpaces.users.hasOwnProperty(uLoginId)) {
					createList = createList.concat(configUserSpaces.users[uLoginId]);
				}

				if (createList.length > 0) {
					return that.batchAddUserSpace(createList);
				} else {
					return $q.when(null);
				}
			})
		}

		service.batchAddUserSpace = function (listSpaceData) {
			return resSpace.batchAddUserSpace({
				spaces: listSpaceData
			}).$promise;
		}

		service.batchJoinUserSpace = function (listSpaceData) {
			return resSpace.batchJoinUserSpace({
				spaces: listSpaceData
			}).$promise;
		}

		return service;
	}


	angular.module('billynApp.core')
		.factory('BSpace', SpaceService);

})();
