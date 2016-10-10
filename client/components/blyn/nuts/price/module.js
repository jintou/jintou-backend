'use strict';

angular.module('billynApp.core')
  .config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.when('/pc/space/:spaceId/app/:appId/price/:nutId', '/pc/space/:spaceId/app/:appId/price/:nutId/home');

    $stateProvider
      .state('pc.space.app.price', {
        url: '/price/:nutId',
        template: '<div ui-view=""></div>',
        controller: 'PriceController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '产品价格' }
      })
      .state('pc.space.app.price.admin', {
        url: '/admin',
        templateUrl: 'components/blyn/nuts/price/view/admin.html',
        controller: 'PriceAdminController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '设置' },
        authenticate: true
      })
      .state('pc.space.app.price.manage', {
        url: '/manage',
        template: '<div ui-view=""></div>',
        controller: 'PriceManageController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '管理' }
      })
      .state('pc.space.app.price.manage.home', {
        url: '/home',
        templateUrl: 'components/blyn/nuts/price/view/manage.html',
        controller: 'PriceManageController',
        controllerAs: 'vm',
        ncyBreadcrumb: { skip: true }
      })
  });
