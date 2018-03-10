(function () {
  'use strict';

  angular
    .module('irate')
    .factory('AccessService', access);

  access.$inject = ['$http', '$q'];
  function access($http, $q) {
    var service = {
      login: login,
      register: register
    };

    var headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    return service;

    function login(data) {
      var defer = $q.defer();
      $http({
        'method': 'POST',
        'url': '/irate-api/login',
        'headers': headers,
        'data': data
      })
        .then(function (user) {
          var token = window.btoa(user.data.USER_NAME + user.data.PASSWORD);
          window.localStorage.setItem('access_token', token);
          defer.resolve(user);
        }, function (err) {
          defer.reject(err);
        });
      return defer.promise;
    }

    function register(data) {
      var defer = $q.defer();
      $http({
        'method': 'POST',
        'url': '/irate-api/register',
        'headers': headers,
        'data': data
      })
        .then(function (user) {
          var token = window.btoa(user.data.USER_NAME + user.data.PASSWORD);
          window.localStorage.setItem('access_token', token);
          defer.resolve(user);
        }, function (err) {
          defer.reject(err);
        });
      return defer.promise;
    }
  }

})();