(function () {
  'use strict';

  angular
    .module('irate')
    .controller('Evaluate', evaluate);

  evaluate.$inject = ['$scope', 'Course', 'Faculty', 'Topic', 'Rating'];
  function evaluate($scope, Course, Faculty, Topic, Rating) {
    $('.active').removeClass('active');
    var allfaculties = [], allcourses = [], alltopics = [], allratings = [];
    $scope.alerts = [];

    function initialize() {
      $scope.user = JSON.parse(window.localStorage.getItem('user'));
      getFaculties();
    }

    function getFaculties() {
      Faculty.getFaculties()
        .then(function (faculties_response) {
          allfaculties = faculties_response;
          getCourses();
        });
    }

    function getCourses() {
      Course.getCourses()
        .then(function (courses_response) {
          allcourses = courses_response;
          getTopics();
        });
    }

    function getTopics() {
      Topic.getTopics()
        .then(function (topics_response) {
          _.each(topics_response, function (t) {
            t.rating = 0;
          });
          alltopics = topics_response;
          getRatings();
        });
    }

    function getRatings() {
      Rating.getRatings()
        .then(function (ratings_response) {
          allratings = ratings_response;
          prepareVars();
        });
    }

    function prepareVars() {
      $scope.faculties = [];
      $scope.faculties = allfaculties;
      $scope.faculty = $scope.faculties[0].FACULTY_ID;
      prepareCourses();
    }

    function prepareCourses() {
      $scope.courses = [];
      _.each(allcourses, function (ac) {
        var currCourse = ac.faculties.indexOf($scope.faculty);
        if (currCourse > -1) {
          $scope.courses.push(ac);
        }
      });
      $scope.course = $scope.courses.length > 0 ? $scope.courses[0].COURSE_ID : '';
      prepareTopics();
    }

    function prepareTopics() {
      $scope.topics = [];
      _.each(alltopics, function (t) {
        t.rating = 0;
        t.rated = false;
        if (t.COURSE_ID === $scope.course) {
          $scope.topics.push(t);
        }
      });
      updateRatings();
    }

    function updateRatings() {
      _.each(allratings, function (r) {
        if (r.FACULTY_ID === $scope.faculty && r.COURSE_ID === $scope.course && r.USER_ID === $scope.user.USER_ID) {
          var topicIndex = _.indexOf($scope.topics, _.findWhere($scope.topics, {
            'TOPIC_ID': r.TOPIC_ID
          }));
          if (topicIndex > -1) {
            $scope.topics[topicIndex].rating = r.RATING;
            if (r.RATING > 0) {
              $scope.topics[topicIndex].rated = true;
            } else {
              $scope.topics[topicIndex].rated = false;
            }
          }
        }
      });
    }

    $scope.changeFaculty = function () {
      prepareCourses();
    };

    $scope.changeCourse = function () {
      prepareTopics();
    };

    $scope.submit = function () {
      var faculty = _.findWhere(allfaculties, {
        FACULTY_ID: $scope.faculty
      });
      var course = _.findWhere(allcourses, {
        COURSE_ID: $scope.course
      });
      var temp = [];
      _.each($scope.topics, function (t) {
        if (!t.rated && t.rating > 0) {
          var str = 'faculty_id=' + faculty.FACULTY_ID + '&faculty_name=' + faculty.F_FIRST_NAME;
          str = str + '&course_id=' + course.COURSE_ID + '&course_name=' + course.COURSE_NAME;
          str = str + '&topic_id=' + t.TOPIC_ID + '&rating=' + t.rating + '&user_id=' + $scope.user.USER_ID;
          temp.push(str);
        }
      });
      Rating.submitRatings(temp)
        .then(function () {
          $scope.alerts.push({
            type: 'success',
            scream: 'success',
            message: 'Rating successfully submitted!'
          });
        }, function (err) {
          $scope.alerts.push({
            type: 'danger',
            scream: 'error',
            message: err.data.error.message
          });
        });
    };

    $scope.closeAlert = function (index) {
      $scope.alerts.splice(index, 1);
    };

    if (window.localStorage.getItem('access_token')) {
      initialize();
    }
  }

})();