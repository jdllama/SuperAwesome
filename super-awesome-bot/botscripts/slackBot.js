var config = require("../config");
exports = module.exports = function() {
	var Slack = require("slack-client");
	var bot = new Slack(config.SlackAPI, true, true);
	bot.on("open", function() {
		var ch = [];
		for(var obj in bot.channels) {
			if(bot.channels[obj].is_member == true) {
				ch.push(bot.channels[obj].name)
			}
			
		}
		console.log("Connected to " + bot.team.name + " as " + bot.self.name + " to channels " + ch.join(", "));
	})
	return bot;
}