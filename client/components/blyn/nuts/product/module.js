'use strict';

angular.module('billynApp.core')
  .config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.when('/pc/space/:spaceId/app/:appId/product/:nutId', '/pc/space/:spaceId/app/:appId/product/:nutId/home');

    $stateProvider
      .state('pc.space.app.product', {
        url: '/product/:nutId',
        template: '<div ui-view=""></div>',
        controller: 'ProductController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '机构产品' }
      })
      .state('pc.space.app.product.admin', {
        url: '/admin',
        templateUrl: 'components/blyn/nuts/product/view/admin.html',
        controller: 'ProductAdminController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '设置' },
        authenticate: true
      })
      .state('pc.space.app.product.manage', {
        url: '/manage',
        template: '<div ui-view=""></div>',
        controller: 'ProductManageController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '管理' }
      })
      .state('pc.space.app.product.manage.home', {
        url: '/home',
        templateUrl: 'components/blyn/nuts/product/view/manage.html',
        controller: 'ProductManageController',
        controllerAs: 'vm',
        ncyBreadcrumb: { skip: true }
      })
      .state('pc.space.app.product.manage.addProduct', {
        url: '/approve',
        templateUrl: 'components/blyn/nuts/product/view/addProduct.html',
        controller: 'ProductManageController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '添加修改' },
        authenticate: true
      })
      .state('pc.space.app.product.client', {
        url: '/client',
        template: '<div ui-view=""></div>',
        controller: 'ProductClientController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '客户' },
        authenticate: true
      })
      .state('pc.space.app.product.client.home', {
        url: '/home',
        templateUrl: 'components/blyn/nuts/product/view/client.html',
        controller: 'ProductClientController',
        controllerAs: 'vm',
        ncyBreadcrumb: { skip: true },
        authenticate: true
      })
      .state('pc.space.app.product.item', {
        url: '/account/:itemId',
        template: '<div ui-view=""></div>',
        controller: 'ProductItemController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '产品' },
        authenticate: true
      })
      .state('pc.space.app.product.item.home', {
        url: '/home',
        templateUrl: 'components/blyn/nuts/product/view/item.html',
        controller: 'ProductItemController',
        controllerAs: 'vm',
        ncyBreadcrumb: { skip: true },
        authenticate: true
      })
  });
