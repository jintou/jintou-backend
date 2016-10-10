'use strict';

class MyFinanceController {
  constructor(Auth, $state) {
    this.errors = {};
    this.submitted = false;

    this.Auth = Auth;
  } 
}

angular.module('billynApp')
  .controller('MyFinanceController', MyFinanceController);
