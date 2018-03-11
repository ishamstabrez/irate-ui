(function () {
  'use strict';

  angular
    .module('irate', [
      'ui.router'
    ])
    .run(Run)
    .config(Config);

  Run.$inject = ['$rootScope', '$state'];
  function Run($rootScope, $state) {
    $rootScope.$state = $state;
  }

  Config.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider'];
  function Config($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
    $locationProvider.hashPrefix('');
    $urlRouterProvider.otherwise('/evaluate');

    var evaluateState = {
      'name': 'evaluate',
      'url': '/evaluate',
      'templateUrl': 'app/evaluate/evaluate.tpl.html',
      'controller': 'Evaluate',
      'resolve': {
        'token': ['$state', '$timeout', function ($state, $timeout) {
          if (!window.localStorage.getItem('access_token')) {
            $timeout(function () {
              $state.go('login');
            });
          }
        }]
      }
    };

    var loginState = {
      'name': 'login',
      'url': '/login',
      'templateUrl': 'app/access/access.tpl.html',
      'controller': 'Access'
    };

    var registerState = {
      'name': 'register',
      'url': '/register',
      'templateUrl': 'app/access/access.tpl.html',
      'controller': 'Access'
    };

    $stateProvider.state(evaluateState);
    $stateProvider.state(registerState);
    $stateProvider.state(loginState);
  }

})();