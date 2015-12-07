var building = require("./building");
module.exports = function() {
	var room = building.createSlackRoom({
		channel: "commons"
	});

	room.URL = room.building.URL + "holidaybullshit" + "/";

	var puzzleBox = require("../models/puzzleBox");

	room.addFunction({
		name: "hug",
		isVisible: false,
		description: "",
		func: function(args) {
			function rand(arr) {
				return arr[Math.floor(Math.random() * arr.length)];
			}

			var from = "@" + args.from;

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

	room.EventEmitter.on("newPuzzle", function(URL) {
		room.sendMessage("New puzzle thread: " + URL);
	});

	room.registerPeriscope("https://www.periscope.tv/dupedad/", "Our favorite trapped father is either broadcasting or has a new broadcast");

	room.checkRedditWiki();

	room.monitorSite("http://hanukkah.lol/recap", ".article-content", "It appears that the Recap page has been updated.");

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
}