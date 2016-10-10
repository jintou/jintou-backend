'use strict';

class MyTradeController {
  constructor(Auth, $state) {
    this.errors = {};
    this.submitted = false;

    this.Auth = Auth;
  } 
}

angular.module('billynApp')
  .controller('MyTradeController', MyTradeController);
