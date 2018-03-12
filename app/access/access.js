(function () {
  'use strict';

  angular
    .module('irate')
    .controller('Access', access);

  access.$inject = ['$scope', '$state', '$window', 'AccessService'];
  function access($scope, $state, $window, AccessService) {
    window.localStorage.clear();

    $scope.user = {};
    $scope.alerts = [];
    var loginProperties = ['username', 'password'];
    var registerProperties = ['firstName', 'lastName', 'email', 'mobile', 'username', 'password'];

    $scope.accessGranted = function (current) {
      if (current === 'login') {
        login();
      }
      if (current === 'register') {
        register();
      }
    };

    function login() {
      var result = validate($scope.user);
      if (result.length > 0) {
        return;
      }
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
      var result = validate($scope.user);
      if (result.length > 0) {
        return;
      }
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

    function validate (data) {
      var isdataEmpty = !Object.keys(data).length;
      $scope.alerts = [];
      var errors = [];
      if (!isdataEmpty) {
        var state = $state.current.name;
        switch(state) {
          case 'login':
            _.each(loginProperties, function (l) {
              if (typeof data[l] === 'undefined' || data[l] === '') {
                errors.push(l);
              }
            });
            break;
          case 'register':
          var wrongPhone = false, wrongEmail = false;
            _.each(registerProperties, function (r) {
              if (typeof data[r] === 'undefined' || data[r] === '') {
                errors.push(r);
              } else {
                if (r === 'email') {
                  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

                  if (!re.test(data[r])) {
                    wrongEmail = true;
                  }
                }
                if (r === 'mobile') {
                  var phoneno = /^\d{10}$/;
                  if (!phoneno.test(data[r])) {
                    wrongPhone = true;
                  }
                }
              }
            });
            break;
        }
      } else {
        $scope.alerts.push({
          type: 'danger',
          scream: 'error',
          message: 'Required fields cannot be blank'
        });
      }
      if (errors.length > 0) {
        var msg = '';
        _.each(errors, function (e, index) {
          console.log(e, index);
          if (index === errors.length-1) {
            msg = msg + '' + e;
          } else {
            msg = msg + '' + e + ', ';
          }
        });
        $scope.alerts.push({
          type: 'danger',
          scream: 'error',
          message: msg + ' cannot be blank'
        });
      }
      if (wrongEmail) {
        $scope.alerts.push({
          type: 'danger',
          scream: 'error',
          message: 'Please enter valid email'
        });
      }
      if (wrongPhone) {
        $scope.alerts.push({
          type: 'danger',
          scream: 'error',
          message: 'Please enter valid mobile number'
        });
      }
      return $scope.alerts;
    }

    $scope.closeAlert = function (index) {
      $scope.alerts.splice(index, 1);
    };
  }

})();