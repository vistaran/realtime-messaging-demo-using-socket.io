/**
 *  Module
 *
 * Description
 */
var app = angular.module('messaging', ['ngSanitize', 'toastr', 'ui.router', 'ngFileUpload']);

app.config(["$stateProvider", "$urlRouterProvider", '$sceProvider', function ($stateProvider, $urlRouterProvider, $sceProvider) {

    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'views/home.html',
        controller: 'homeController'
    }).state('room', {
        url: '/room/:roomId/:name',
        templateUrl: 'views/room.html',
        controller: 'roomController'
    });

    $urlRouterProvider.otherwise('/');

    $sceProvider.enabled(false);
}]);

app.controller('homeController', ['$scope', '$sce', '$timeout', 'toastr', '$http', '$state', function ($scope, $sce, $timeout, toastr, $http, $state) {
    // var socket = io.connect("http://10.10.5.149:3000");
    var socket = io.connect("http://messaging.labs.webmpires.net");
    // var socket = io.connect("http://10.10.6.123:3000");
    var audio = new Audio('sounds/alert.mp3');

    socket.on("deletedRoom", function (data) {
        $scope.$evalAsync(function (scope) {
            $scope.getRooms();
        });
    });

    $scope.createRoom = function () {
        if ($scope.roomname) {
            $http.post("/users/createRoom", { name: $scope.roomname }).then(function (res) {
                $state.go("room", { "roomId": res.data.id, "name": res.data.name });
                console.log(res.data);
            });
        }
    };

    $scope.getRooms = function () {
        $http.get("/users/rooms").then(function (res) {
            $scope.roomList = res.data;
            console.log(res.data);
        });
    };
    
    $scope.getRooms();
}]);