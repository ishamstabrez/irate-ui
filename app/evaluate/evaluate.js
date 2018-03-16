(function () {
  'use strict';

  angular
    .module('irate')
    .controller('Evaluate', evaluate);

  evaluate.$inject = ['$scope', 'Course', 'Faculty', 'Topic', 'Rating', '$rootScope'];
  function evaluate($scope, Course, Faculty, Topic, Rating, $rootScope) {
    $('.active').removeClass('active');
    var allfaculties = [], allcourses = [], alltopics = [], allratings = [];
    $scope.alerts = [];

    function initialize() {
      $rootScope.currentUser = JSON.parse(window.localStorage.getItem('user'));
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
            t.checked=false;
          });
          alltopics = topics_response;
          getRatings('initialize');
        });
    }

    function getRatings(param) {
      Rating.getRatings()
        .then(function (ratings_response) {
          allratings = ratings_response;
          switch (param) {
            case 'initialize':
              prepareVars();
              break;
            case 'submit':
              updateRatings();
              break;
            default:
              prepareVars();
          }
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
        t.hoverRating = 0;
        t.rated = false;
        t.checked = false;
        if (t.COURSE_ID === $scope.course) {
          $scope.topics.push(t);
        }
      });
      if($scope.topics.length > 0) {
        updateRatings();
      }
    }

    function updateRatings() {
      _.each(allratings, function (r) {
        if (r.FACULTY_ID === $scope.faculty && r.COURSE_ID === $scope.course && r.USER_ID === $rootScope.currentUser.USER_ID) {
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

      $scope.selectedTopic = $scope.topics[0];
      $scope.selectedTopic.checked=true;
    }

    $scope.getClassNames = function (topic, star) {
      var classes = [];
      if (topic.hoverRating >= star || topic.rating >= star) {
        classes.push('glyphicon-star');
      }

      if (topic.hoverRating < star && topic.rating < star) {
        classes.push('glyphicon-star-empty');
      }

      if (!topic.checked || topic.rated) {
        classes.push('star-disable');
      }

      return classes;
    };

    $scope.changeFaculty = function () {
      prepareCourses();
    };

    $scope.changeCourse = function () {
      prepareTopics();
    };

    $scope.changeTopic = function (topic) {
      $scope.selectedTopic = topic;
      _.each($scope.topics, function (t) {
        if (t.TOPIC_ID === topic.TOPIC_ID) {
          t.checked = true;
        } else {
          t.checked = false;
          if (!t.rated) {
            t.rating = 0;
            t.hoverRating = 0;
          }
        }
      });
    };

    $scope.submit = function () {
      var faculty = _.findWhere(allfaculties, {
        FACULTY_ID: $scope.faculty
      });
      var course = _.findWhere(allcourses, {
        COURSE_ID: $scope.course
      });
      var str, t = $scope.selectedTopic;
      if (!t.rated && t.rating > 0 && t.checked) {
        str = 'faculty_id=' + faculty.FACULTY_ID + '&faculty_name=' + faculty.F_FIRST_NAME;
        str = str + '&course_id=' + course.COURSE_ID + '&course_name=' + course.COURSE_NAME;
        str = str + '&topic_id=' + t.TOPIC_ID + '&rating=' + t.rating + '&user_id=' + $rootScope.currentUser.USER_ID;
      } else {
        var msg;
        if (t.checked && t.rated) {
          msg = 'You have already rated the selected topic';
        }
        if (t.checked && t.rating === 0) {
          msg = 'Rating should be atleast 1 star';
        }
        $scope.alerts.push({
          type: 'danger',
          scream: 'error',
          message: msg
        });
        return;
      }
      Rating.submitRatings(str)
        .then(function () {
          $scope.alerts.push({
            type: 'success',
            scream: 'success',
            message: 'Rating successfully submitted!'
          });
          getRatings('submit');
          window.setTimeout(function(){
            $scope.$apply();
          }, 100);
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