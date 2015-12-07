var mongoose = require("../botscripts/mymongoose")();

var puzzleSchema = mongoose.Schema({
	channel: String,
	isActive: Boolean,
	sheet: String,
	description: String,
	createdDate: Date,
	createdBy: String
});

module.exports = mongoose.model("holidaybullshit_puzzles", puzzleSchema);