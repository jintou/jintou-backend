'use strict';

angular.module('billynApp.core')
  .config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.when('/pc/space/:spaceId/app/:appId/myfinance/:nutId', '/pc/space/:spaceId/app/:appId/myfinance/:nutId/home');

    $stateProvider
      .state('pc.space.app.myfinance', {
        url: '/myfinance/:nutId',
        template: '<div ui-view=""></div>',
        controller: 'MyFinanceController',
        controllerAs: 'vm',
        ncyBreadcrumb: {label:'我的金融'}
      })
      .state('pc.space.app.myfinance.home', {
        url: '/home',
        templateUrl: 'components/blyn/core/myfinance/view/home.html',
        controller: 'MyFinanceHomeController',
        controllerAs: 'vm',
        ncyBreadcrumb: {skip:true},
        authenticate: true
      })
  });
