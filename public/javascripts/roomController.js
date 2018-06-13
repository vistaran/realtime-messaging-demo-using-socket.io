app.controller('roomController', ['$scope', '$sce', '$timeout', 'toastr', '$stateParams', 'Factory', 'Upload', function($scope, $sce, $timeout, toastr, $stateParams, Factory, Upload) {

    var roomId = $stateParams.roomId;
    $scope.roomName = $stateParams.name;

    $scope.socket = io.connect("http://messaging.labs.webmpires.net"); // init socket
    var audio = new Audio('sounds/alert.mp3');

    $scope.messages = [];
    $scope.data = [];
    $scope.formData = {};
    $scope.flags = {};
    $scope.typingTimerLength = 5000;
    $scope.rc = {usersTyping: []};

    console.log(moment());

    /** Operations performed when message is received */
    $scope.socket.on("onMessageRecieved", function(data) {
        audio.play();
        $scope.messages.push(data);
    });

    /** Operations performed when new user is added into room */
    $scope.socket.on("userAdded", function(data) {
        if (data.joined !== $scope.formData.userName) {
            toastr.success(data.joined + " has joined.");
        }
        $scope.allUsers = data.allUsers;
    });

    /** Operations to perform when someone starts typing */
    $scope.socket.on("startedTyping", function (data) {
        $scope.rc.usersTyping.push(data.name);
        $scope.rc.whoIsTyping = $scope.rc.usersTyping.join(', ');
    });

    /** Operations to perform when someone stops typing */
    $scope.socket.on("stoppedTyping", function (data) {
        var idx = $scope.rc.usersTyping.indexOf(data.name);
        $scope.rc.usersTyping.splice(idx, 1);
        $scope.rc.whoIsTyping = $scope.rc.usersTyping.join(', ');
    });

    /** Operations to perform when a user is left from room */
    $scope.socket.on("userLeft", function(data) {
        if (data.left) {
            toastr.warning(data.left + " has left.");
        }
        $timeout(function() {
            $scope.allUsers = data.allUsers;
        }, 1000);
    });

    /** Broadcast typing / stopped typing when user starts/stops typing */
    $scope.onKeyUp = function() {
        if (!$scope.flags.typing) {
            $scope.flags.typing = true;
            $scope.socket.emit('typing', {
                name: $scope.formData.userName
            });
        }
        
        $scope.flags.lastTypingTime = (new Date()).getTime();

        $timeout(function() {
            var typingTimer = (new Date()).getTime();
            var timeDiff = typingTimer - $scope.flags.lastTypingTime;
            if (timeDiff >= $scope.typingTimerLength && $scope.flags.typing) {
                $scope.socket.emit('typingStopped', {
                    name: $scope.formData.userName
                });
                $scope.flags.typing = false;
            }
        }, $scope.typingTimerLength);
    };

    /** Add user to the room */
    $scope.addMe = function() {
        if (!$scope.formData.userName || !$scope.formData.email) {
            return;
        }

        Factory.addUser($scope.formData).then(function(response) {
            $scope.formData.userId = response.data.id;
            $scope.socket.emit("addUser", {
                name: $scope.formData.userName,
                id: response.data.id,
                roomId: roomId
            });
            $scope.isUserAdded = true;
        }, function() {
            alert("Error when adding user.");
        });

    };

    /** Upload file */
    $scope.upload = function(file, type) {
        if (file) {
            Upload.upload({
                url: '/users/media',
                data: { file: file }
            }).then(function(resp) {
                console.log(resp);
                $scope.messages.push({ text: resp.data.url, sent: true, user: $scope.formData.userName, type: type, uuid: new moment.now(), date: moment().toDate() });
                $socket.emit("addedMessage", {
                    type: type,
                    text: resp.data.url,
                    user: $scope.formData.userName
                });
            }, function(resp) {
                alert("Error when uploading image.");
            });
        }
    };

    /** Send message */
    $scope.send = function(text) {
        $scope.messages.push({ text: $scope.data.message, sent: true, user: $scope.formData.userName, type: "text", uuid: new moment.now(), date: moment().toDate() });
        $scope.socket.emit("addedMessage", {
            type: "text",
            text: $scope.data.message,
            user: $scope.formData.userName
        });
        $scope.data.message = '';
        $("#messageBox").focus();
    };

    /** load previous messgae */

    $scope.loadPrevious = function(){
            console.log("loading previous");
    };

}]);
