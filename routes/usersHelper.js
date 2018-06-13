var db = require("../database/database.js");

var user = {};

user.setUserOnline = function (id, callback) {
	db.User.update({_id: id}, {status: "online"}, {}, function (err, res) {
		callback(res);
	});
};

user.setUserIdle = function (id) {
	db.User.update({_id: id}, {status: "offline"}, {});
};

user.setUserOffine = function (id, callback) {
	if(id) {
		db.User.update({_id: id}, {status: "offline"}, {}, function (err, res) {
			callback();
		});
	}
};

module.exports = user;
