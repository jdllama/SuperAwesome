var building = require("./building");
var $ = require("cheerio");
var request = require("request");
var GoogleSpreadsheet = require("google-spreadsheet");
var config = require("../config");

module.exports = function() {
	var room = building.createRoom({
		channel: "#holidaybullshit",
		collectionName: "holidaybullshit_logs",
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

	room.registerRedditJSON("https://np.reddit.com/r/HolidayBullshit/new/.json", "NEW POST: ");

	room.registerRSS("http://hanukkah.lol/rss", "It appears there is a new post on http://hanukkah.lol");

	room.registerPeriscope("https://www.periscope.tv/dupedad/", "Our favorite trapped father is either broadcasting or has a new broadcast");

	room.checkRedditWiki();

	room.monitorSite("http://hanukkah.lol/recap", ".article-content", "It appears that the Recap page has been updated.");

	room.addFunction({
		name: "wiki",
		description: "Need a link to the Wiki? Look no further!",
		func: function(args) {
			room.sendMessage("https://www.reddit.com/r/holidaybullshit/wiki/index");
		}
	});

	room.addFunction({
		name: "tools",
		description: "A page that stores common tools for solving puzzles.",
		func: function(args) {
			room.sendMessage("http://rumkin.com/tools/cipher/");
		}
	});

	room.addFunction({
		name: "recap",
		description: "CAH/Mystery League's recap of what we know.",
		func: function(args) {
			room.sendMessage("http://hanukkah.lol/recap");
		}
	});

	room.addFunction({
		name: "hug",
		isVisible: false,
		description: "",
		func: function(args) {
			function rand(arr) {
				return arr[Math.floor(Math.random() * arr.length)];
			}

			var from = args.from;

			var hugs = ["...Alright, fine. *hugs*",
						"Fair warning, JavaScript hugs are kinda painful.",
						"Ooooh, now ping me and tell me I'm a naughty bot. Make me drop my tables!",
						"*ker-hugs*",
						"*massive hugs*",
						"*ultra awesome hugs*",
						"*mega hyper hugs*",
						"Hey now, not on the first date. Get to know me at least.",
						"That god damned gif.",
						"It's a duck."];

			var hug = rand(hugs);

			room.sendMessage(from + ": " + hug);
		}
	});

	room.addFunction({
		name: "anagram",
		description: "Enter a word or phrase by using !SA anagram *word or phrase*.",
		func: function(args) {
			room.sendMessage("http://wordsmith.org/anagram/anagram.cgi?anagram=" + args.words.join("%20") + "&t=1000&a=n");
		}
	});

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

	room.EventEmitter.on("newPuzzle", function(URL) {
		room.sendMessage("New puzzle thread: " + URL);
	});
}