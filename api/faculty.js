(function () {
  'use strict';

  angular
    .module('irate')
    .factory('Faculty', faculty);

  faculty.$inject = ['$http', '$q'];
  function faculty($http, $q) {
    var service = {
      getFaculties: getAll
    };

    return service;

    function getAll() {
      var defer = $q.defer();
      $http.get('/irate-api/faculties')
        .then(function (response) {
          defer.resolve(response.data);
        });

      return defer.promise;
    }
  }

})();