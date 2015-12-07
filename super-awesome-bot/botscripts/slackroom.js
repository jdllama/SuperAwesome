var $ = require("cheerio");
var request = require("request");
var feed = require("feed-read");
var config = require("../config");
var Slack = require("slack-client");
var Room = require("./room");

function SlackRoom(options) {
	var me = this;
	Room.apply(me, arguments);
	var EventEmitter = require("eventemitter2").EventEmitter2;
	var myEvents = new EventEmitter();
	me.EventEmitter = myEvents;
	me.building = options.building;
	me.bot = me.building.slackBot;
	me.channel = options.channel;

	function entities(str) {
		return String(str).split("&amp;").join("&").split("&lt;").join("<").split("&gt;").join(">").split("&quot;").join("\"");
	}

	me.sendMessage = function(str, override) {
		if((me.building.getGlobalCanPost() && me.canPost) || override) {
			str = entities(str);
			var channel = me.bot.getChannelByName(me.channel);
			channel.send(str);
		}
	};

	me.bot.on("message", function(message) {
		var channel = me.bot.getChannelGroupOrDMByID(message.channel).name;
		var user = me.bot.getUserByID(message.user);
		if(channel == me.channel) {
			var text = message.text;
			if(text && user) {
				var from = user.name;
				text = text.split("↔").join("");
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
		}
	});

	return me;
}

exports = module.exports = SlackRoom;