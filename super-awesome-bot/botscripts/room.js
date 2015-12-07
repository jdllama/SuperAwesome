Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});

var $ = require("cheerio");
var request = require("request");
var feed = require("feed-read");

function Room() {
	var me = this;
	me.registeredFunctions = {};

	me.canPost = true;

	me.callFunction = function(str, args) {
		return me.registeredFunctions[str.toUpperCase()].func(args);
	}
	
	function registerFunction(options) {
		var vis = options.isVisible;
		if(vis == undefined) vis = true;
		var act = options.isActive;
		if(act == undefined) act = true;
		var obj = {
			name: options.name.toUpperCase(),
			isVisible: vis,
			func: options.func,
			description: options.description || "",
			isActive: act
		};
		return obj;
	}
	
	me.addFunction = function(options) {
		me.registeredFunctions[options.name.toUpperCase()] = registerFunction(options);
	};

	me.sendMessage = function(str) {
		throw "WRONG SEND MESSAGE";
	}

	me.addFunction({
		name: "help",
		description: function() {
			var arr = ["...Um...what are...what are you doing?",
				"Hi there! You seem to be trying to get some help! Would you like Clippy?",
				"Are these Arrays getting tighter in my pants, or is it just you?"];
			return arr[Math.floor(Math.random() * arr.length)];
		},
		func: function(args) {
			var str = "";
			if(args.words && args.words[0]) {
				var arg = args.words[0];
				var notFound = true;
				if(me.registeredFunctions[arg.toUpperCase()]) {
					var f = me.registeredFunctions[arg.toUpperCase()];
					if(f.isVisible) {
						notFound = false;
						if(typeof f.description == "string") {
							str = arg + ": " + f.description;
						}
						else if(typeof f.description == "function") {
							str = arg + ": " + f.description();
						}
					}
				}
				if(notFound) {
					str = "Could not find command: " + arg;
				}
			}
			else {
				var commands = Object.keys(me.registeredFunctions).sort();
				str = "Use this bot by saying \"!SA *Command*\", without quotes or the asterisks. The following commands are available. For assistance, use \"!SA help *command*\": ";
				var arr = [];
				commands.forEach(function(command) {
					if(me.registeredFunctions[command].isVisible) {
						arr.push(command);
					}
				});
				str += arr.join(", ");
			}
			me.sendMessage(str);
		}
	});

	me.addFunction({
		name: "status",
		description: "This provides the current status of the bot in this channel.",
		func: function(args) {
			me.sendMessage("Status for " + me.channel + ": canSpeak: " + (me.building.globalCanPost && me.canPost) + ". Uptime: " + ((new Date()) - me.building.getStart()) + "ms.", true);
		}
	});

	me.addFunction({
		name: "about",
		description: "",
		isVisible: false,
		func: function(args) {
			me.sendMessage("SuperAwesome was created using node.js and MongoDB by JDllama!");
		}
	});

	me.addFunction({
		name: "todo",
		description: "",
		isVisible: false,
		func: function(args){
			me.sendMessage("JDllama has a lot of things he's working on with this! You can check his progress here: https://trello.com/b/3ACWHSij/superawesome");
		}
	});

	me.functionParser = function(from, text) {
		var w = text.split(" ");
		var words = [];
		
		w.forEach(function(word) {
			if(word && word + "" !== "") {
				words.push(word);
			}
		});
	
		if(words.length > 1 && (words[0].toUpperCase() === "!SA" || words[0].toUpperCase() === "!SUPERAWESOME")) {
			words.shift();
			var command = words[0];
			if(me.registeredFunctions[command.toUpperCase()] && me.registeredFunctions[command.toUpperCase()].isActive) {
				words.shift();
				var obj = {
					from: from.toUpperCase(),
					words: []
				};
				if(words.length > 0) obj.words = words;
				me.registeredFunctions[command.toUpperCase()].func(obj);
			}
		}
	}

	me.registerRSS = function(url, message) {
		var titles = [];

		feed(url, function(err, items) {
			if(items) {
				items.forEach(function(item) {
					titles.push(item.title);
				});
			}
		});

		setInterval((function(scope) {
			return function() {
				feed(url, function(err, items) {
					try {
						if(items) {
							items.forEach(function(item) {
								if(titles.indexOf(item.title) === -1) {
									titles.push(item.title);
									scope.sendMessage(message);
								}
							});
						}
					}
					catch(ignored) {
						console.dir(ignored);
					}
				})
			}
		})(me), 1000 * 10);
	}

	me.registerPeriscope = function(url, message) {
		var ID = null;
		request(url, function(err, response, HTML) {
			if(HTML) {
				var parsedHTML = $.load(HTML);
				var tokenID = $(parsedHTML("#token-id"));

				ID = tokenID.attr("content");
				ID = ID.trim();
				if(ID !== "") {
					me.sendMessage(message + ": " + url + ID);
				}
			}
		});

		setInterval((function(scope) {
			return function() {
				request(url, function(err, response, HTML) {
					if(HTML) {
						var parsedHTML = $.load(HTML);
						var tokenID = $(parsedHTML("#token-id"));

						var tempID = tokenID.attr("content").trim();

						if(tempID !== "" && ID !== tempID) {
							ID = tempID;
							scope.sendMessage(message + ": " + url + ID);
						}
					}
				});
			}
		})(me), 1000 * 5);

	}

	me.checkRedditWiki = function() {
		var time = null;
		var url = "https://www.reddit.com/r/holidaybullshit/wiki/index";
		request(url, function(err, response, HTML) {
			if(HTML) {
				var parsedHTML = $.load(HTML);
				var d = $(parsedHTML("time")[1]);
				time = d.attr("datetime");
			}
		});

		setInterval((function(scope) {
			return function() {
				request(url, function(err, response, HTML) {
					if(HTML) {
						var parsedHTML = $.load(HTML);
						var d = $(parsedHTML("time")[1]);
						if(time != d.attr("datetime")) {
							time = d.attr("datetime");
							scope.sendMessage("The Reddit wiki has been updated at " + url);
						}
						
					}
				});
			}
		})(me), 1000 * 5);
	}
	
	me.redditSuccess = false;

	me.registerRedditJSON = function(url, message) {
		var IDs = [];

		var redditSuccess = false;

		request(url, function(err, response, body) {
			if(body) {
				me.redditSuccess = true;
				var reddit = JSON.parse(body);
				var kids = reddit.data.children;
				kids.forEach(function(kid) {
					IDs.push(kid.data.id);
				});
			}
		});

		setInterval((function(scope) {
			return function() {
				request(url, function(err, response, body) {
					try {
						if(body) {
							var reddit = JSON.parse(body);
							var kids = reddit.data.children;
							kids.forEach(function hi(kid) {
								//console.log(kid.data.id);
								
								if(IDs.indexOf(kid.data.id) === -1) {
									IDs.push(kid.data.id);
									if(scope.redditSuccess) {
										scope.sendMessage(message + " <\u0002" + kid.data.author + "\u000F> " + kid.data.title + " - " + "https://redd.it/" + kid.data.id);
									}
								}
							});
							scope.redditSuccess = true;
						}
					}
					catch(ignored) {
						console.dir(ignored);
					}
					
				});
			}
		})(me), 1000 * 10);
	};

	me.monitorSite = function(url, idORclass, message) {
		var thisHTML = "";

		request(url, function(err, response, HTML) {
			if(HTML) {
				var parsedHTML = $.load(HTML);
				var html = $(parsedHTML(idORclass));
				thisHTML = html.text();
			}
		});

		setInterval((function(scope) {
			return function() {
				request(url, function(err, response, HTML) {
					if(HTML) {
						var parsedHTML = $.load(HTML);
						var html = $(parsedHTML(idORclass));
						if(thisHTML != html.text()) {
							thisHTML = html.text();
							scope.sendMessage(message);
						}
						
					}
				});
			}
		}(me)), 1000 * 5);
	};
	
	return me;
}

module.exports = Room;