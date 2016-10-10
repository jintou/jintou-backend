'use strict';

(function () {

  class MyFinanceController {
    constructor() {

    }
  }

  class MyFinanceHomeController {
    constructor($stateParams, $q, BRole, BSpace) {
     
    }
  }

  angular.module('billynApp.core')
    .controller('MyFinanceController', MyFinanceController)
    .controller('MyFinanceHomeController', MyFinanceHomeController);
})();
