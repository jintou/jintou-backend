'use strict';

angular.module('billynApp')
  .config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.when('/pc/settings', '/pc/settings/profile');

    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'app/account/login/login.html',
        controller: 'LoginController',
        controllerAs: 'vm'
      })
      .state('logout', {
        url: '/logout?referrer',
        referrer: 'login',
        template: '',
        controller: function($state, Auth) {
          var referrer = $state.params.referrer ||
                          $state.current.referrer ||
                          'login';
          Auth.logout();
          $state.go(referrer);
        }
      })
      .state('signup', {
        url: '/signup',
        templateUrl: 'app/account/signup/signup.html',
        controller: 'SignupController',
        controllerAs: 'vm'
      })
      .state('pc.account', {
        url: '/account',
        template: '<div ui-view=""></div>',
        //controller: 'AccountController',
        //controllerAs: 'vm',
        ncyBreadcrumb: {skip:true},
        authenticate: true
      })
      .state('pc.account.profile', {
        url: '/profile',
        templateUrl: 'app/account/settings/profile.html',
        controller: 'ProfileController',
        controllerAs: 'vm',
        ncyBreadcrumb: {label:'设置账号'},
        authenticate: true
      })
      .state('pc.account.finance', {
        url: '/finance',
        templateUrl: 'app/account/finance/views/home.html',
        controller: 'MyFinanceController',
        controllerAs: 'vm',
        ncyBreadcrumb: {label:'金融账户'},
        authenticate: true
      })
      .state('pc.account.trade', {
        url: '/trade',
        templateUrl: 'app/account/trade/views/home.html',
        controller: 'MyTradeController',
        controllerAs: 'vm',
        ncyBreadcrumb: {label:'我的交易'},
        authenticate: true
      })
      .state('pc.account.changePassword', {
        url: '/changepassword',
        templateUrl: 'app/account/settings/changePassword.html',
        ncyBreadcrumb: {label:'修改密码'},
        authenticate: true
      })
      .state('mobile.profile', {
        url: '/profile',
        templateUrl: 'app/account/settings/profile.mobile.html',
        controller: 'ProfileController',
        controllerAs: 'vm',
        authenticate: true
      });
  })
  .run(function($rootScope) {
    $rootScope.$on('$stateChangeStart', function(event, next, nextParams, current) {
      if (next.name === 'logout' && current && current.name && !current.authenticate) {
        next.referrer = current.name;
      }
    });
  });
