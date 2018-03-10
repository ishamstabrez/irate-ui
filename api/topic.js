(function () {
  'use strict';

  angular
    .module('irate')
    .factory('Topic', topic);

  topic.$inject = ['$http', '$q'];
  function topic($http, $q) {
    var service = {
      getTopics: getAll
    };

    return service;

    function getAll() {
      var defer = $q.defer();
      $http.get('/irate-api/topics')
        .then(function (response) {
          defer.resolve(response.data);
        });

      return defer.promise;
    }
  }

})();