(function () {
  'use strict';

  angular
    .module('irate')
    .factory('Course', course);

  course.$inject = ['$http', '$q'];
  function course($http, $q) {
    var service = {
      getCourses: getAll
    };

    return service;

    function getAll() {
      var defer = $q.defer();
      $http.get('/irate-api/courses')
        .then(function (response) {
          defer.resolve(response.data);
        });
      
      return defer.promise;
    }
  }

})();