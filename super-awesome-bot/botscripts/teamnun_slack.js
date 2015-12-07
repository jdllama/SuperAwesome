var building = require("./building");
var $ = require("cheerio");
var request = require("request");
var GoogleSpreadsheet = require("google-spreadsheet");
var config = require("../config");

module.exports = function() {
	var room = building.createSlackRoom({
		token: config.SlackAPI,
		autoConnect: true,
		autoMark: true
	});

	room.EventEmitter.on("newPuzzle", function(URL) {

	});
}