'use strict';

(function () {

    function BMyFinanceService($resource, User, $q, Util, $rootScope,$http) {
        var safeCb = Util.safeCb;
        var current = {};
        var resUser = $resource('/api/users/:id/:controller', {
            id: '@_id'
        }, {
                create: {
                    method: 'POST'
                },
                changePassword: {
                    method: 'PUT',
                    params: {
                        controller: 'password'
                    }
                },
                me: {
                    method: 'GET',
                    params: {
                        controller: 'me'
                    }
                }
            });

        var resSpace = $resource('/api/spaces/:id/:controller', {
            id: '@_id'
        }, {
                getUserSpaces: {
                    method: 'GET',
                    isArray: true,
                    params: {
                        controller: 'user'
                    }
                },
            });
        var resUserProfile = $resource('/api/user/profiles/:id/:controller', {
            id: '@_id'
        }, {
                bulkAdd: {
                    method: 'POST',
                    isArray: true,
                    params: {
                        id: 'bulk'
                    }
                }
            });

        var resUserGroup = $resource('/api/users/groups/:id/:controller', {
            id: '@_id'
        }, {
                add: {
                    method: 'POST'
                },
                findOne: {
                    method: 'GET'
                },
                findAll: {
                    method: 'GET',
                    isArray: true
                },
                findRoles: {
                    method: 'GET',
                    isArray: true,
                    params: {
                        id: 'roles'
                    }
                },
                addRole: {
                    method: 'POST',
                    params: {
                        id: 'roles'
                    }
                }
            });

        var currentUser = {};

        var service = {};

        service.setCurrent = function (user) {
            //return currentUser = user;
            var that = this;
            return this.loadConfig()
                .then(function () {
                    return that.loadMe();
                })
                .then(function () {
                    return that.loadMySpaces()
                }).then(function(){
                    return $q.when(current);
                })
        }

        //return promise
        service.loadMe = function () {
            return resUser.me().$promise.then(function (user) {
                current = user;
                $rootScope.current.user = user;
                return $q.when(user);
            });
        }

        //return promise
        service.loadMySpaces = function () {
            return resSpace.getUserSpaces().$promise.then(function (spaces) {
                current.spaces = spaces;
                var space = spaces[0];
                $rootScope.current.space = spaces[0];
                var apps = space.apps;
                apps.forEach(function (app) {
                    if (app.name.toLocaleLowerCase() === 'appengine') {
                        $rootScope.current.app = app;
                    }
                })

                return $q.when(spaces);
            })
        }

        service.getCurrent = function () {
            return current;
            /*
            if (arguments.length === 0) {
                return currentUser;
            }
            var value = (currentUser.hasOwnProperty('$promise')) ?
                currentUser.$promise : currentUser;

            return $q.when(value)
                .then(user => {
                    safeCb(callback)(user);
                    return user;
                }, () => {
                    safeCb(callback)({});
                    return {};
                })*/
        }

        service.getUserProfiles = function (findContext) {
            return resUserProfile.get(findContext).$promise;
        }

        service.bulkAddUserProfile = function (bulkData, context) {
            context = context || {};
            if (!context.hasOwnProperty('spaceId')) {
                context.spaceId = $rootScope.current.space._id;
            }
            context.data = bulkData;
            return resUserProfile.bulkAdd(context).$promise;
        }

        service.addGroup = function (data) {
            if (!data.spaceId) {
                data.spaceId = $rootScope.current.space._id;
            }
            return resUserGroup.add(data).$promise;
        }

        service.findOneUserGroup = function (data) {
            return resUserGroup.findOne(data).$promise;
        }

        service.findAllUserGroup = function (data) {
            return resUserGroup.findAll(data).$promise;
        }

        service.findUserGroupRoles = function (data) {

            if (angular.isObject(data)) {
                var userGroupId;
                for (var key in data) {
                    if (key.toLocaleLowerCase() === 'usergroupid') {
                        userGroupId = data[key];
                    }
                }
                if (userGroupId) {
                    return resUserGroup.findRoles(
                        {
                            userGroupId: userGroupId
                        }
                    ).$promise;
                } else {
                    return $q.reject('fail to find group roles');
                }
            }
        }

        service.addUserGroupRole = function (data) {
            var roleId, userGroupId;

            if (angular.isObject(data)) {
                for (var key in data) {
                    if (key.toLocaleLowerCase() === 'roleid') {
                        roleId = data[key];
                    }
                    if (key.toLocaleLowerCase() === 'usergroupid') {
                        userGroupId = data[key];
                    }
                    if (key.toLocaleLowerCase() === 'groupid') {
                        userGroupId = data[key];
                    }
                }
            }

            if (roleId && userGroupId) {
                return resUserGroup.addRole({
                    roleId: roleId,
                    userGroupId: userGroupId
                }).$promise;
            } else {
                return $q.reject('fail to add role');
            }
        }

        service.loadConfig = function () {
            var that = this;
            return $http.get("components/blyn/core/user/config.json").then(function (oConfig) {
                current.config = oConfig.data;

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

        return service;
    }

    angular.module('billynApp.core')
        .factory('BMyFinance', BMyFinanceService);

})();

