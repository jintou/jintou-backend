'use strict';

angular.module('billynApp.core', [
  'billynApp.auth',
  'billynApp.util',
  'ngCookies',
  'ui.router',
  'ngAnimate',
  'ui.bootstrap',
  'ncy-angular-breadcrumb'
])
  .provider('BConfigProvider', BConfigProvider)
  .run(function ($rootScope) {
    $rootScope.breadcrumb = {};	// To save the breadcrumbs.
  });

function BConfigProvider() {
  // Default configuration
  var bConfiguration = {
    'disableCustomScrollbars': false,
    'disableMdInkRippleOnMobile': true,
    'disableCustomScrollbarsOnMobile': true
  };

  // Methods
  this.config = config;
  this.loadRuntimeConfig = loadRuntimeConfig;

  //////////

  /**
   * Extend default configuration with the given one
   *
   * @param configuration
   */
  function config(configuration) {
    bConfiguration = angular.extend({}, bConfiguration, configuration);
  }

  function loadRuntimeConfig(){
    BAttribute.getAttributes('blyn.config').then(function(attributes){
      angular.forEach(attributes, function(attr){
        bConfiguration[attr.name] = attr.value;
      })
    })
  }

  /**
   * Service
   */
  this.$get = function () {
    var service = {
      getConfig: getConfig,
      setConfig: setConfig
    };

    return service;

    //////////

    /**
     * Returns a config value
     */
    function getConfig(configName) {
      if (angular.isUndefined(bConfiguration[configName])) {
        return false;
      }

      return bConfiguration[configName];
    }

    /**
     * Creates or updates config object
     *
     * @param configName
     * @param configValue
     */
    function setConfig(configName, configValue) {
      bConfiguration[configName] = configValue;
    }
  };
}

