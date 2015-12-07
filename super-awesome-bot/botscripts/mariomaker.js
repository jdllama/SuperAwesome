var building = require("./building");
var $ = require("cheerio");
var request = require("request");

module.exports = function() {
	var room = building.createRoom({
		channel: "#mariomaker",
		collectionName: "mariomaker_logs",
		admins: ["JDLLAMA", "AURIDA", "CONFUZET", "AUXARCH", "BABYBELUGA"]
	});
	
	var mongoose = require("./mymongoose")();
	var random = require('mongoose-random');
	
	var marioTagSchema = mongoose.Schema({
		text: String
	});

	var TagBox = mongoose.model("mariomaker_tags", marioTagSchema);

	var marioLevelSchema = mongoose.Schema({
		ID: String,
		tags: [marioTagSchema],
		wins: Number
	});

	var marioIDBoxSchema = mongoose.Schema({
		user: String,
		IDs: [marioLevelSchema]
	});
	
	marioIDBoxSchema.plugin(random, {path: "r"});
	
	var IDBox = mongoose.model("mariomaker_levelids", marioIDBoxSchema);
	
	room.registerRedditJSON("https://np.reddit.com/r/MarioMaker/new/.json", "NEW POST: ");

	room.addFunction({
		name: "wiki",
		description: "Need a link to the Wiki? Look no further!",
		func: function(args) {
			room.sendMessage("https://www.reddit.com/r/MarioMaker/wiki/index");
		}
	});

	room.addFunction({
		name: "mariowiki",
		description: "We love Mario Wiki around here! Have a shortcut! You can also search the mario wiki with this by using, for example, !SA mariowiki goomba",
		func: function(args) {
			if(args.words.length) {
				room.sendMessage("http://www.mariowiki.com/index.php?search=" + args.words.join("%20"));
			}
			else {
				room.sendMessage("http://www.mariowiki.com/");
			}
		}
	});

	room.addFunction({
		name: "mw",
		isVisible: false,
		description: "(shortcut for mariowiki) We love Mario Wiki around here! Have a shortcut! You can also search the mario wiki with this by using, for example, !SA mw goomba",
		func: function(args) {
			return room.callFunction("mariowiki", args);
		}
	});
	
	room.addFunction({
		name: "codes",
		isVisible: false,
		description: "List all codes of yours (or include a username to get that specific user's codes).",
		func: function(args) {
			var from;
				
			if(args.words && args.words[0]) {
				from = args.words[0].toUpperCase();
			}
			else {
				from = args.from;
			}

			room.sendMessage(room.URL + "levels#" + from);
			/*
			if(from.toUpperCase() === "RANDOM") {
				return room.callFunction("randomcode", {});
			}
			
			IDBox.findOne({user: from}, function(err, user) {
				// if(err) throw err;
				if(!user) {
					return room.sendMessage("No codes found for " + from);
				}
				var str = "Codes for " + from + ": ";
				var arr = [];
				user.IDs.forEach(function(ID) {
					arr.push(ID.ID);
				});
				if(!arr.length) arr = ["No codes found."];
				str += arr.join(", ");
				
				room.sendMessage(str);
			});
*/
		}
	});

	room.addFunction({
		name: "code",
		description: "List all codes of yours (or include a username to get that specific user's codes).",
		func: function(args) {
			return room.callFunction("codes", args);
		}
	});

	room.addFunction({
		name: "search",
		description: "Search all stored codes with this function! Wildcards not supported.",
		func: function(args) {
			var search = args.words.join(" ");
			if(!search.length) {
				return room.sendMessage("Missing search parameter.");
			}
			IDBox.find({"IDs.ID": {"$regex": search, "$options": "i"}}, function(err, results) {
				// if(err) throw err;
				if(!results || !results.length) {
					return room.sendMessage("No levels found.");
				}
				var str = "Codes found: ";
				var arr = [];
				results.forEach(function(result) {
					var IDs = result.IDs;
					IDs.forEach(function(ID) {
						if(ID.ID.toUpperCase().split(search.toUpperCase()).length > 1 && arr.length < 10) arr.push(ID.ID);
					});
				});

				str += arr.join(", ");

				return room.sendMessage(str);
			});
		}
	});
	
	room.addFunction({
		name: "addcode",
		description: "This will add one code to the database for you. For example: !SA addcode xxxx-xxxx-xxxx-xxxx MY LEVEL ROCKS",
		func: function(args) {
			var from = args.from;
			var code = args.words.join(" ");
			var codeChecker = new RegExp('[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}');
			if(!code.length) {
				return room.sendMessage("Please do not forget the actual code to add.");
			}
			var test = code.split(codeChecker);
			if(test.length == 1) {
				return room.sendMessage("Please do not forget the actual code to add.");
			}
			else if(test.length > 2) {
				return room.sendMessage("Could not save code; please enter one code at a time.");
			}
			IDBox.findOne({user: from}, function(err, user) {
				// if(err) throw err;
				if(!user) {
					user = new IDBox({user: from});
				}
				var isIn = false;
				user.IDs.forEach(function(ID) {
					if(ID.ID.toUpperCase() === code.toUpperCase()) isIn = true; 
				});
				
				if(isIn) {
					return room.sendMessage("Code already exists for " + from + ": " + code);
				}
				user.IDs.push({
					ID: code
				});
				user.save(function(err, obj) {
					if(err) {
						return room.sendMessage("Network connectivity issues. Could not save code. Please try again.");
					}
					return room.sendMessage("Code saved.");
				});
			});
		}
	});

	room.addFunction({
		name: "addlevel",
		isVisible: false,
		description: "This will add one code to the database for you. For example: !SA addlevel xxxx-xxxx-xxxx-xxxx MY LEVEL ROCKS",
		func: function(args) {
			return room.callFunction("addcode", args);
		}
	});


room.addFunction({
	name: "onetime",
	description: "",
	isVisible: false,
	isActive: false,
	func: function(args) {
		var spekio = 'Infiltrate Koopa enemy "factory": A4AD-0000-008D-0228 | King of my Koopa Castle v2: 9575-0000-007F-F355 | The sky is the limit: 8E89-0000-008D-88CC | White men can\'t jump? 1D84-0000-0019-F37A | Bowser Jr.\'s Haunted Mansion: 2BA4-0000-0043-D9AA | Great Giana Sisters lvl 24: FFE8-0000-005D-CC9A | Buzzy Beetle Escort Service v1.3: F098-0000-0058-3810'.split("|");
		function runOneTime(index, from){
			var code = spekio[index];
			if(!code) return room.sendMessage("Bulk codes saved for " + from);

			code = code.trim();

			var codeChecker = new RegExp('[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}');
			if(!code.length) {
				return room.sendMessage("Please do not forget the actual code to add.");
			}
			var test = code.split(codeChecker);
			if(test.length == 1) {
				return room.sendMessage("Please do not forget the actual code to add.");
			}
			else if(test.length > 2) {
				return room.sendMessage("Could not save code; please enter one code at a time.");
			}
			IDBox.findOne({user: from}, function(err, user) {
				// if(err) throw err;
				if(!user) {
					user = new IDBox({user: from});
				}
				var isIn = false;
				user.IDs.forEach(function(ID) {
					if(ID.ID.toUpperCase() === code.toUpperCase()) isIn = true; 
				});
				
				if(isIn) {
					return room.sendMessage("Code already exists for " + from + ": " + code);
				}
				user.IDs.push({
					ID: code
				});
				user.save(function(err, obj) {
					runOneTime(++index, from);
				});
			});

		}
		runOneTime(0, "TERRANIGMA");
	}
});
	
	room.addFunction({
		name: "removecode",
		description: "This removes the listing for the code you provide to the bot. for example, !SA removecode 0000-0000-0000-0000",
		func: function(args) {
			var from = args.from;
			var code = args.words.join(" ");
			if(!code.length) {
				return room.sendMessage("Please do not forget the actual code to remove.");
			}
			var codeChecker = /[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}/g;
			var realcodes = code.match(codeChecker);
			
			if(!realcodes || !realcodes.length) {
				return room.sendMessage("Please do not forget the actual code to remove.");
			}
			realcodes = realcodes.map(function(val) {
				return val.toUpperCase();
			});
			IDBox.findOne({user: from}, function(err, user) {
				// if(err) throw err;
				if(!user) {
					return room.sendMessage("No codes found for " + from);
				}
				var foundone = false;
				user.IDs = user.IDs.filter(function(ID) {
					var keeper = true;
					var text = ID.ID.toUpperCase();

					realcodes.forEach(function(code) {
						if(text.indexOf(code) !== -1) {
							console.log(text, code);
							keeper = false;
							foundone = true;
						}
					})
					return keeper;
				});
				if(!foundone) {
					return room.sendMessage("Could not find code(s) " 
						+ realcodes.join(", ")
						+ " for " + from);
				}

				if(!user.IDs.length) {
					IDBox.find({user: from}).remove(function(err, obj) {
						// if(err) throw err;
						return room.sendMessage("Code(s) deleted.");
					});
				}
				else {
					user.save(function(err, obj) {
						// if(err) throw err;
						return room.sendMessage("Code(s) deleted.");
					});
				}
			});
		}
	});

	room.addFunction({
		name: "remove",
		isVisible: false,
		description: "This removes the listing for the code you provide to the bot. for example, !SA remove 0000-0000-0000-0000",
		func: function(args) {
			return room.callFunction("removecode", args);
		}
	});
	
	room.addFunction({
		name: "randomcode",
		description: "This provides a random code; if a username is provided, it will provide a random code for that person if one is available.",
		func: function(args) {
			var from = null;
				
			if(args.words && args.words[0]) {
				from = args.words[0].toUpperCase();
			}
			
			if(from !== null) {
				IDBox.findOne({user: from}, function(err, user) {
					// if(err) throw err;
					if(!user || !user.IDs.length) {
						return room.sendMessage("No codes found for " + from);
					}
					var rand = user.IDs[Math.floor(Math.random() * user.IDs.length)];
					return room.sendMessage("Random code for " + from + ": " + rand.ID);
				});
			}
			else {
				IDBox.findRandom().limit(1).exec(function(err, item) {
					// if(err) throw err;
					
					if(!item || !item.length ||!item[0].IDs.length) {
						return room.sendMessage("Unable to retrieve random codes.");
					}
					var rand = item[0].IDs[Math.floor(Math.random() * item[0].IDs.length)];
					from = item[0].user;
					return room.sendMessage("Random code for " + from + ": " + rand.ID);
				})
			}
		}
	});
	
	room.addFunction({
		name: "challenge",
		description: "Bored? Writer's Block? Want some random ideas? Let me make some for you!",
		func: function(args) {
			var from = args.from;
			return room.sendMessage(from + ": " + require("./mariomakerchallenge")());
		}
	});

	room.addFunction({
		name: "miiverse",
		isVisible: false,
		description: "Want to get the codes from your MiiVerse page? Use !SA miiverse *your miiverse username*. Make sure the privacy settings allow your in game posts to be public.",
		func: function(args) {
			if(!args.words || !args.words.length) {
				return room.sendMessage("No Miiverse username provided.");
			}
			var userName = args.words[0];
			room.sendMessage("Loading Miiverse for " + userName);
			var start = new Date();
			var url = "http://superawesomeirc.herokuapp.com/mariomaker/miiverse/" + userName;
			request(url, function(err, response, HTML) {
				// if(err) throw err;
				room.sendMessage("Loaded: " + url);
			});
		}
	});

	room.addFunction({
		name: "mii",
		description: "Want to get the codes from your MiiVerse page? Use !SA mii *your miiverse username*. Make sure the privacy settings allow your in game posts to be public.",
		func: function(args) {
			return room.callFunction("miiverse", args);
		}
	});

	room.addFunction({
		name: "newest",
		description: "This will give the five most recent levels uploaded worldwide to Super Mario Maker.",
		func: function(args) {
			var url = "https://miiverse.nintendo.net/titles/6437256808751874777/6437256808751874782/in_game";
			request(url, function(err, response, HTML) {
				// if(err) throw err;
				var parsedHTML = $.load(HTML);
				var links = parsedHTML(".js-post-list").children("div");
				var codes = [];
				for(var i = 0;i<5;i++) {
					var link = links[i];
					if(link) {
						link = $(link);
						var username = link.children(".user-name").children("a").attr("href");
						username = username.split("/users/").join('');

						var text = link.find(".post-content-text");
						text = text.text();

						codes.push(text + " - by " + username);
					}
				}
				room.sendMessage("Five latest levels uploaded: " + codes.join(", "));
			});
		}
	});

	/*
	room.addFunction({
		name: "miiverse",
		description: "Want to get the codes from your MiiVerse page? Use !SA miiverse *your miiverse username*. Make sure the privacy settings allow your in game posts to be public.",
		isVisible: false,
		isActive: false,
		func: function(args) {
			if(!args.words || !args.words.length) {
				return room.sendMessage("No Miiverse username provided.");
			}
			var start = new Date();
			var userName = args.words[0];
			var url = 'https://miiverse.nintendo.net/users/{0}/posts?page_param={"order":"desc","per_page":"2500000000"}'.split("{0}").join(userName);
			request(url, function(err, response, HTML) {
				if(err) throw err;
				var parsedHTML = $.load(HTML);
				var links = parsedHTML("[href='/titles/6437256808751874777/6437256808751874782/in_game']");
				var codes = [];
				links.map(function(index, link) {
					//console.log($(link.parent.parent));
					var goodParent = $(link.parent.parent);
					var text = goodParent.find(".post-content-text");
					var goodLink = goodParent.find(".timestamp").attr("href");
					console.log(goodLink);
					//console.log(text.text());
					codes.push(text.text());
				});
				var end = new Date();
				room.sendMessage(codes.length + " codes found in " + (end - start) + "ms for " + userName + ": " + codes.join(", "));
			});
		}
	});
*/
}