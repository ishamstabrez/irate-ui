(function () {
  'use strict';

  angular
    .module('irate')
    .factory('Rating', Rating);

  Rating.$inject = ['$http', '$q'];
  function Rating($http, $q) {
    var service = {
      getRatings: getAll,
      submitRatings: submit
    };

    var headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    return service;

    function getAll() {
      var defer = $q.defer();
      $http.get('/irate-api/ratings')
        .then(function (response) {
          defer.resolve(response.data);
        });

      return defer.promise;
    }

    function preparePostData (data) {
      var temp = [];
      _.each(data, function (d) {
        temp.push($http({
          method: 'POST',
          url: '/irate-api/ratings',
          headers: headers,
          data: d
        }));
      });
      return temp;
    }

    function submit (data) {
      var promises = preparePostData(data);
      var defer = $q.defer();
      $q.all(promises)
        .then(function(success){
          defer.resolve(success);
        }, function(err){
          defer.reject(err);
        });
      return defer.promise;
    }
  }

})();