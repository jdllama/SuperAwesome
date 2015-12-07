var building = require("./building");
var $ = require("cheerio");
var request = require("request");
var GoogleSpreadsheet = require("google-spreadsheet");
var config = require("../config");

module.exports = function() {
	var room = building.createRoom({
		channel: "#holidaybullshit_admins",
		collectionName: "holidaybullshit_admins_logs",
		admins: ["JDLLAMA", "SCHUBYDOO"]
	});

	var mongoose = require("./mymongoose")();

	/*var puzzleSchema = mongoose.Schema({
		channel: String,
		isActive: Boolean,
		sheet: String,
		description: String,
		createdDate: Date,
		createdBy: String
	});

	var puzzleBox = mongoose.model("holidaybullshit_puzzles", puzzleSchema);
	*/

	var puzzleBox = require("../models/puzzleBox");


	room.registerRSS("http://hanukkah.lol/rss", "It appears there is a new post on http://hanukkah.lol");

	room.registerPeriscope("https://www.periscope.tv/dupedad/", "Our favorite trapped father is either broadcasting or has a new broadcast");
	
	room.addFunction({
		name: "puzzles",
		description: "A list of all active threads in the puzzle! Get details on a puzzle by including the channel name like !SA puzzles #channelname",
		func: function(args) {
			if(args.words.length) {
				var channel = args.words[0];
				if(channel.split("#").length !== 2 || channel.split("#")[0] !== "") {
					return room.sendMessage("Channel name improperly formatted.");
				}

				puzzleBox.findOne({"channel": channel}, function(err, puzzle) {
					if(!puzzle) {
						return room.sendMessage("Could not find puzzle for channel " + channel);
					}
					return room.sendMessage([puzzle.channel, puzzle.description, puzzle.sheet].join(" - "))
				});
			}
			else {
				puzzleBox.find({"isActive": true}, function(err, puzzles) {
					room.sendMessage("Active puzzle threads: " + puzzles.map(function(puzzle) { return room.URL + "puzzles/" + puzzle.channel.split("#").join("").split(" ").join("%20"); }).join(" , "));
				});
			}
		}
	});
	room.addFunction({
		name: "deactivate",
		description: "SuperAwesome admins can deactivate new puzzles with me. The usage is !SA deactivate #channelname",
		func: function(args) {
			if(room.admins.indexOf(args.from) !== -1) {
				if(args.words.length !== 1) {
					return room.sendMessage("The usage is !SA deactivate #channelname");
				}
				var channel = args.words[0];
				if(channel.split("#").length !== 2 || channel.split("#")[0] !== "") {
					return room.sendMessage("Channel name improperly formatted.");
				}
				channel = channel.toUpperCase();
				puzzleBox.findOne({"channel": channel}, function(err, puzzle) {
					if(!puzzle.isActive) {
						return room.sendMessage(channel + " is already deactivated.");
					}
					puzzle.isActive = false;
					puzzle.save(function() {
						room.sendMessage(channel + " has been deactivated.");
					});
				});
			}
		}
	});

	room.addFunction({
		name: "register",
		description: "SuperAwesome admins can register new puzzles with me. The usage is !SA register #channelname googlesheet description",
		func: function(args) {
			if(args.words.length < 3) {
				return room.sendMessage("The usage is !SA register #channelname googlesheetURL description");
			}
			var from = args.from;
			var channel = args.words[0];
			channel = channel.toUpperCase();
			var a = args.words;
			a.shift();
			var sheet = a[0];
			if(sheet.split("docs.google.com/spreadsheets/").length != 2) {
				return room.sendMessage("Invalid spreadsheet provided. Please provide a Google Sheet, and verify its permissions are correct.");
			}
			a.shift();
			var description = a.join(" ");
			if(channel.split("#").length !== 2 || channel.split("#")[0] !== "") {
				return room.sendMessage("Channel name improperly formatted.");
			}
			puzzleBox.findOne({"channel": channel}, function(err, puzzle) {
				if(puzzle) {
					return room.sendMessage(channel + " is already a registered puzzle room.");
				}
				var obj = {
					channel: channel,
					isActive: true,
					sheet: sheet,
					description: description,
					createdDate: new Date(),
					createdBy: from
				}
				puzzle = new puzzleBox(obj);
				puzzle.save(function(err, obj) {
					room.sendMessage("http://superawesomeirc.herokuapp.com/holidaybullshit/puzzles/" + channel.split("#").join(""));
					building.EventEmitter.emit("newPuzzle", "http://superawesomeirc.herokuapp.com/holidaybullshit/puzzles/" + channel.split("#").join(""));
				});
			})
		}
	});
}