'use strict';

(function () {

  class MyTradeController {
    constructor() {

    }
  }

  class MyTradeHomeController {
    constructor($stateParams, $q, BRole, BSpace) {
     
    }
  }

  angular.module('billynApp.core')
    .controller('MyTradeController', MyTradeController)
    .controller('MyTradeHomeController', MyTradeHomeController);
})();
