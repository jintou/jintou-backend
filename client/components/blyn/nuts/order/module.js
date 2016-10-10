'use strict';

angular.module('billynApp.core')
  .config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.when('/pc/space/:spaceId/app/:appId/order/:nutId', '/pc/space/:spaceId/app/:appId/order/:nutId/home');

    $stateProvider
      .state('pc.space.app.order', {
        url: '/order/:nutId',
        template: '<div ui-view=""></div>',
        controller: 'OrderController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '机构订单' }
      })
      .state('pc.space.app.order.admin', {
        url: '/admin',
        templateUrl: 'components/blyn/nuts/order/view/admin.html',
        controller: 'OrderAdminController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '设置' },
        authenticate: true
      })
      .state('pc.space.app.order.manage', {
        url: '/manage',
        template: '<div ui-view=""></div>',
        controller: 'OrderManageController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '管理' }
      })
      .state('pc.space.app.order.manage.home', {
        url: '/home',
        templateUrl: 'components/blyn/nuts/order/view/manage.html',
        controller: 'OrderManageController',
        controllerAs: 'vm',
        ncyBreadcrumb: { skip: true }
      })
      .state('pc.space.app.order.manage.approve', {
        url: '/approve',
        templateUrl: 'components/blyn/nuts/order/view/approve.html',
        controller: 'OrderManageController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '批准' },
        authenticate: true
      })
      .state('pc.space.app.order.client', {
        url: '/client',
        template: '<div ui-view=""></div>',
        controller: 'OrderClientController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '客户' }
      })
      .state('pc.space.app.order.client.home', {
        url: '/home',
        templateUrl: 'components/blyn/nuts/order/view/client.html',
        controller: 'OrderClientController',
        controllerAs: 'vm',
        ncyBreadcrumb: { skip: true }
      })
      .state('pc.space.app.order.client.list', {
        url: '/list',
        templateUrl: 'components/blyn/nuts/order/view/list.html',
        controller: 'OrderClientController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '订单列表' },
      })
      .state('pc.space.app.order.client.history', {
        url: '/history',
        templateUrl: 'components/blyn/nuts/order/view/history.html',
        controller: 'OrderClientController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '订单记录' },
      })
      .state('pc.space.app.order.item', {
        url: '/item/:itemId',
        template: '<div ui-view=""></div>',
        controller: 'OrderItemController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '订单项' },
        authenticate: true
      })
      .state('pc.space.app.order.item.home', {
        url: '/home',
        templateUrl: 'components/blyn/nuts/order/view/item.html',
        controller: 'OrderItemController',
        controllerAs: 'vm',
        ncyBreadcrumb: { skip: true },
        authenticate: true
      })
  });
