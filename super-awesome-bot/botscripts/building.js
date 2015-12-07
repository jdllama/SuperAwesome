var IRCRoom = require("./ircroom");
var SlackRoom = require("./slackroom");
var mongoose = require("./mymongoose")();
var config = require("../config");
var EventEmitter = require("eventemitter2").EventEmitter2;
var myEvents = new EventEmitter();

var messageSchema = mongoose.Schema({
	message: String,
	channel: String
});

var messageCollection = mongoose.model("superawesome_messages", messageSchema);

function Building() {
	var me = this;
	me.bot = null;
	me.slackBot = null;
	me.logger = null;
	me.sendMessage = null;
	me.globalCanPost = true;
	me.rooms = [];
	me.slackRooms = [];
	me.EventEmitter = myEvents;
	
	me.config = function(bot, slackBot) {
		me.bot = bot;
		me.slackBot = slackBot;
	}
	me.URL = config.herokuURL;
	
	me.start = null;
	
	me.createRoom = function(options) {
		var room = new IRCRoom({
			building: me,
			channel: options.channel,
			collectionName: options.collectionName,
			admins: options.admins
		});
		me.rooms.push(room);
		return room;
	}

	me.createSlackRoom = function(options) {
		var slackRoom = new SlackRoom({
			building: me,
			channel: options.channel
		});

		me.slackRooms.push(slackRoom);

		return slackRoom;
	}

	me.getStart = function() {
		return me.start;
	}

	me.start = function(start) {
		me.start = start;
		me.bot.addListener("registered", function(message) {
			me.bot.send("MODE", "SuperAwesome", "+B");
			me.rooms.forEach(function(room) {
				var channel = room.channel;
				me.bot.join(channel, function() {});
			});
		});
		me.bot.addListener("action", function(from, to, text, message) {
			me.rooms.forEach(function(room) {
				if(room.channel === to) {
					room.logAction(from, text);
				}
			});
		});

		me.bot.addListener("topic", function(channel, topic, nick) {
			me.rooms.forEach(function(room) {
				if(room.channel === channel) {
					room.logTopic(nick, topic);
				}
			});
		});

		me.bot.addListener("quit", function(nick, reason, channels, rawmessage) {
			me.rooms.forEach(function(room) {
				room.removeName(nick, reason, function() {}, true);
			});
		});

		me.bot.addListener("nick", function(oldnick, newnick, channels, message) {
			me.rooms.forEach(function(room) {
				room.removeName(oldnick, "", (function(room, oldnick, newnick) {
					return function() {
						room.addName(newnick, function() {
							room.logNickChange(oldnick, newnick);
						})
					}
				}(room, oldnick, newnick)));
			});
		});

		me.slackBot.login();
	}
	
	me.getGlobalCanPost = function() {
		return me.globalCanPost;
	}

	function remoteMessage() {
		messageCollection.find({}, function(err, messages) {
			//if(err) throw err;
			
			if(messages && messages.length > 0) {
				messages.forEach(function(message) {
					var channel = message.channel;
					if(channel.toUpperCase() === "ALLCHANNELS") {
						me.rooms.forEach(function(room) {
							room.sendMessage(message.message);
						});
					}
					else {
						me.rooms.forEach(function(room) {
							if(room.channel === channel) {
								room.sendMessage(message.message);
							}
						});
					}
					
					messageCollection.find({message: message.message}).remove(function(err, obj) {
					});
				});
			}
		});
	}

	setInterval(remoteMessage, 5000);

	me.EventEmitter.on("newPuzzle", function(URL) {
		me.rooms.forEach(function(room) {
			room.EventEmitter.emit("newPuzzle", URL);
		});

		me.slackRooms.forEach(function(room) {
			room.EventEmitter.emit("newPuzzle", URL);
		});
	});
	
	return me;
}

exports = module.exports = new Building();