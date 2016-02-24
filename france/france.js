'use strict';

angular.module('myApp.france', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/france', {
    templateUrl: 'france/france.html',
    controller: 'ViewFrance'
  });
}])
.controller('ViewFrance', [function() {

}]);