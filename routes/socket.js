module.exports = function (app, io) {
    var db = require("../database/database.js");
    var user = require("./usersHelper.js");
    var users = [],
        existingContent, rooms = {};
    io.on('connection', function (socket) {


        console.log("user connected...");

        socket.on("addUser", function (data) {

            user.setUserOnline(data.id, function () {
                socket.name = data.name;
                socket.userId = data.id;
                socket.roomId = data.roomId;
                socket.join(data.roomId);
                rooms[socket.roomId] = rooms[socket.roomId] || [];
                rooms[socket.roomId].push(data);
                io.to(socket.roomId).emit('userAdded', { joined: data.name, allUsers: rooms[socket.roomId] });
            });
        });

        socket.on("addedMessage", function (data) {
            console.log("RECEICED FROM CLIENT >>> ", data);
            data.sent = false;
            socket.broadcast.to(socket.roomId).emit('onMessageRecieved', data);
        });

        socket.on("typing", function (data) {
            socket.broadcast.to(socket.roomId).emit('startedTyping', data);
        });

        socket.on("typingStopped", function (data) {
            socket.broadcast.to(socket.roomId).emit('stoppedTyping', data);
        });

        socket.on('disconnect', function () {
            if(socket.roomId && socket.userId) {
                user.setUserOffine(socket.userId, function () { // set user status as offline in database when disconnected
                    if (rooms[socket.roomId] && rooms[socket.roomId].length) {

                        for (var i = 0; i < rooms[socket.roomId].length; i++) {
                            if (rooms[socket.roomId][i].name == socket.name) {
                                rooms[socket.roomId].splice(i, 1); // remove user from room
                            }
                        }
                        // delete room when all users are left
                        if(rooms[socket.roomId].length === 0) {
                            db.Room.remove({_id:  socket.roomId}, function (err, res) {
                                delete rooms[socket.roomId];
                                io.emit("deletedRoom", {id: socket.roomId});
                            });
                        } else {
                            // broadcast when user is left
                            socket.broadcast.to(socket.roomId).emit('userLeft', { left: socket.name, allUsers: rooms[socket.roomId] });
                        }
                    }
                });
            }
        });
    });
};