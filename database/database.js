
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.connect("DB_CON_STR");
var shortid = require('shortid');

// Log error if not connected
mongoose.connection.on('error', console.error.bind(console, 'Connection error.'));

// Log status if we are connected to database
mongoose.connection.once('open', function () {
	// we're connected!
	console.log("Connected to database.");
});

var db = {};

db.User = mongoose.model('RoomUsers', {
	useranme: String,
	email: String,
	status: {
		type: String,
        enum: ['online', 'offline', 'idle']
	},
	createdAt: { type: Date, default: Date.now },
	userAgent: String,
	ip: String
});

db.Room = mongoose.model('Room', {
	name: String
});

module.exports = db;

