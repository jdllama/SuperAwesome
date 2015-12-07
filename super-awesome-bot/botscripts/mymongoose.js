
var mongoose = require("mongoose");
var config = require("../config");

mongoose.connect(config.MONGO_SERVER);

module.exports = function() {
	return mongoose;
}