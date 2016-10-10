'use strict';

(function () {

	function BAttribute($resource, $q, Util, $rootScope, $http) {
		var safeCb = Util.safeCb;
		var current = {};
		var resAttr = $resource('/api/attributes/:id/:controller', {
			id: '@_id'
		}, {
				getAttribute: {
					method: 'GET',
					params: {
						id: 'name'
					}
				},
				getAttributes: {
					method: 'GET',
					params: {
						controller: 'addType'
					}
				},
				add: {
					method: 'GET',
					params: {
						id: 'user',
					},
					isArray: true
				}
			});


		var currentSpace = {};

		var service = {};

		service.getAttribute = function (name) {
			return resAttr.getAttribute({
				name: name
			}).$promise;
		}
		service.getAttributes = function (name) {
			return resAttr.getAttributes({
				name: name
			}).$promise;
		};

		service.add = function (name, value) {
			return resAttr.add({
				name: name,
				value: value
			}).$promise;
		}

		return service;
	}


	angular.module('billynApp.core')
		.factory('BAttribute', BAttribute);

})();
