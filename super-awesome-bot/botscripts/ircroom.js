Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});

var $ = require("cheerio");
var request = require("request");
var feed = require("feed-read");
var config = require("../config");
var Room = require("./room");

var mongoose = require("./mymongoose")();
var logSchema = mongoose.Schema({
	date: String,
	logs: Array
});

var c = require('irc-colors');

function IRCRoom(options) {
	var me = this;
	Room.apply(me, arguments);
	me.names = {};
	me.building = options.building;
	me.channel = options.channel;
	me.bot = me.building.bot;
	me.admins = options.admins;
	var EventEmitter = require("eventemitter2").EventEmitter2;
	var myEvents = new EventEmitter();
	me.EventEmitter = myEvents;
	me.log = mongoose.model(options.collectionName, logSchema);
	me.URL = me.building.URL + me.channel.split("#").join("") + "/";
	
	function entities(str) {
		return String(str).split("&amp;").join("&").split("&lt;").join("<").split("&gt;").join(">").split("&quot;").join("\"");
	}

	me.sendMessage = function(str, override) {
		if((me.building.getGlobalCanPost() && me.canPost) || override) {
			str = entities(str);
			me.bot.say(me.channel, str);
			me.logger("<SuperAwesome> " + str);
		}
	};
		
	me.addFunction({
		name: "logs",
		description: "Need a link to the IRC logs? Check this out! (May not be complete based on bot availability)",
		func: function(args) {
			me.sendMessage(me.URL + "logs/");
		}
	});
	
	me.addFunction({
		name: "shutup",
		description: "Wait, how can you see this?",
		isVisible: false,
		func: function(args) {
			if(me.admins.indexOf(args.from) !== -1) {
				me.canPost = false;
			}
		}
	});
	
	me.addFunction({
		name: "speak",
		description: "Wait, how can you see this?",
		isVisible: false,
		func: function(args) {
			if(me.admins.indexOf(args.from) !== -1) {
				me.canPost = true;
			}
		}
	});

	me.logger = function(str) {
		var myTime = new Date();
		console.log(me.channel + " [" + myTime.toLocaleTimeString() +  "] " + str);
		if(me.log) {
			me.log.findOne({date: myTime.toDateInputValue()}, function(err, todayLog) {
				// if(err) throw err;
				if(!todayLog) {
					todayLog = new me.log({date: myTime.toDateInputValue()});
				}
				todayLog.logs.push("[" + myTime.toLocaleTimeString() +  "] " + str);
				todayLog.save(function(err, obj) {
					// if(err) throw err;
				});
			});
		}
	};

	
	
	me.bot.addListener("message" + me.channel, function(from, text) {
		text = c.stripColorsAndStyle(text);
		text = text.split("↔").join("");
		me.logger("<" + from + "> " + text);
		me.functionParser(from, text);
	});

	me.addName = function(name, func) {
		try {
			me.names[name] = true;
			if(func) func();
		}
		catch(ignored) {
		}
	}

	me.removeName = function(name, reason, func, isQuit) {
		try {
			if(me.names[name]) {
				delete me.names[name];
				//if(reason && reason !== "") me.logQuit(name, reason);
				if(isQuit) me.logQuit(name, reason || "Connection closed.");
				if(func) func();
			}
			
		}
		catch(ignored) {
			console.log("Fail", ignored);
		}
		
	}

	me.bot.addListener("join" + me.channel, function(nick, message) {
		me.logger("** " + nick + " has joined " + me.channel);
		me.addName(nick);
	});

	me.bot.addListener("part" + me.channel, function(nick, reason) {
		me.logger("** " + nick + " has parted " + me.channel + [" (", reason, ")"].join(" "));
		me.removeName(nick);
	});

	me.bot.addListener("kick" + me.channel, function(nick, by, reason) {
		me.logger("** " + nick + " was kicked by " + by + [" (", reason, ")"].join(" "));
	});

	me.bot.addListener("names" + me.channel, function(nicks) {
		for(var name in nicks) {
			me.names[name] = nicks[name];
		}
	});

	me.logQuit = function(nick, message) {
		me.logger("** " + nick + " has left " + me.channel + " (" + message + ")");
	}

	me.logNickChange = function(oldnick, newnick) {
		me.logger("** " + oldnick + " is now known as " + newnick);
	}

	me.logAction = function(nick, message) {
		me.logger("** " + nick + " " + message);
	}

	me.logTopic = function(nick, topic) {
		me.logger("** " + nick + " changed the topic to: " + topic);
	}
		
	return me;
}

//IRCRoom.prototype = new Room();

//IRCRoom.prototype.constructor = IRCRoom;

exports = module.exports = IRCRoom;