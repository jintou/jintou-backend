'use strict';

angular.module('billynApp.core')
  .config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.when('/pc/space/:spaceId/app/:appId/mytrade/:nutId', '/pc/space/:spaceId/app/:appId/mytrade/:nutId/home');

    $stateProvider
      .state('pc.space.app.mytrade', {
        url: '/myfinance/:nutId',
        template: '<div ui-view=""></div>',
        controller: 'MyTradeController',
        controllerAs: 'vm',
        ncyBreadcrumb: {label:'我的交易'}
      })
      .state('pc.space.app.mytrade.home', {
        url: '/home',
        templateUrl: 'components/blyn/core/mytrade/view/home.html',
        controller: 'MyTradeHomeController',
        controllerAs: 'vm',
        ncyBreadcrumb: {skip:true},
        authenticate: true
      })
  });
