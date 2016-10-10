'use strict';

angular.module('billynApp.core')
  .config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.when('/pc/space/:spaceId/app/:appId/trade/:nutId', '/pc/space/:spaceId/app/:appId/trade/:nutId/home');

    $stateProvider
      .state('pc.space.app.trade', {
        url: '/trade/:nutId',
        template: '<div ui-view=""></div>',
        controller: 'TradeController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '机构交易' }
      })
      .state('pc.space.app.trade.admin', {
        url: '/admin',
        templateUrl: 'components/blyn/nuts/trade/view/admin.html',
        controller: 'TradeAdminController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '设置' },
        authenticate: true
      })
      .state('pc.space.app.trade.manage', {
        url: '/manage',
        template: '<div ui-view=""></div>',
        controller: 'TradeManageController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '管理' }
      })
      .state('pc.space.app.trade.manage.home', {
        url: '/home',
        templateUrl: 'components/blyn/nuts/trade/view/manage.html',
        controller: 'TradeManageController',
        controllerAs: 'vm',
        ncyBreadcrumb: { skip: true }
      })
      .state('pc.space.app.trade.manage.approve', {
        url: '/approve',
        templateUrl: 'components/blyn/nuts/trade/view/approve.html',
        controller: 'TradeManageController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '批准' },
        authenticate: true
      })
      .state('pc.space.app.trade.client', {
        url: '/client',
        template: '<div ui-view=""></div>',
        controller: 'TradeClientController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '客户' }
      })
      .state('pc.space.app.trade.client.home', {
        url: '/home',
        templateUrl: 'components/blyn/nuts/trade/view/client.html',
        controller: 'TradeClientController',
        controllerAs: 'vm',
        ncyBreadcrumb: { skip: true }
      })
      .state('pc.space.app.trade.client.list', {
        url: '/list',
        templateUrl: 'components/blyn/nuts/trade/view/list.html',
        controller: 'TradeClientController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '商品列表' },
      })
      .state('pc.space.app.trade.client.history', {
        url: '/history',
        templateUrl: 'components/blyn/nuts/trade/view/history.html',
        controller: 'TradeClientController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '交易记录' },
      })
      .state('pc.space.app.trade.item', {
        url: '/item/:itemId',
        template: '<div ui-view=""></div>',
        controller: 'TradeItemController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '交易项' },
        authenticate: true
      })
      .state('pc.space.app.trade.item.home', {
        url: '/home',
        templateUrl: 'components/blyn/nuts/trade/view/item.html',
        controller: 'TradeItemController',
        controllerAs: 'vm',
        ncyBreadcrumb: { skip: true },
        authenticate: true
      })
  });
