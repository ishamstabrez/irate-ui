(function () {
  'use strict';

  angular
    .module('irate')
    .controller('Access', access);

  access.$inject = ['$scope', '$state', '$window', 'AccessService'];
  function access($scope, $state, $window, AccessService) {

    $scope.user = {};
    $scope.alerts = [];

    $scope.accessGranted = function (current) {
      if (current === 'login') {
        login();
      }
      if (current === 'register') {
        register();
      }
    };

    function login() {
      var dataString = 'username=' + $scope.user.username + '&password=' + $scope.user.password;
      AccessService.login(dataString)
        .then(function (res) {
          window.localStorage.setItem('user', JSON.stringify(res.data));
          $state.go('evaluate');
        }, function (err) {
          $scope.alerts.push({
            type: 'danger',
            scream: 'error',
            message: err.data.error.message
          });
        });
    }

    function register() {
      var dataString = 'user_name=' + $scope.user.username +
        '&password=' + $scope.user.password +
        '&first_name=' + $scope.user.firstName +
        '&last_name=' + $scope.user.lastName +
        '&email=' + $scope.user.email +
        '&mobile=' + $scope.user.mobile;

      AccessService.register(dataString)
        .then(function (res) {
          window.localStorage.setItem('user', JSON.stringify(res.data));
          $state.go('evaluate');
        }, function (err) {
          $scope.alerts.push({
            type: 'danger',
            scream: 'error',
            message: err.data.error.message
          });
        });
    }

    $scope.closeAlert = function (index) {
      $scope.alerts.splice(index, 1);
    };

    $scope.logout = function () {
      window.localStorage.clear();
      $state.go('access');
    }
  }

})();