var config = require("../config");
exports = module.exports = function() {
	var irc = require("irc");
	var bot = new irc.Client(config.IRCserver, config.botName, {
		channels: [],
		sasl: true,
		userName: config.botName,
		realName: config.botRealName,
		nick: config.botName,
		password: config.IRCpassword
	});
	
	bot.addListener('error', function(message) {
		console.error('error: ', message);
	});

	return bot;
}