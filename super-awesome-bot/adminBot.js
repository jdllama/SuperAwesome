module.exports = function(bot, from, text, canPost, Suggestion) {
	if(text === "Damn girl you look fine") {
		canPost = false;
		bot.say(from, "Automatic messages have been disabled.");
	}
	else if(text === "Do you poop with that butt?") {
		canPost = true;
		bot.say(from, "Automatic messages have been enabled.");
	}
	else if(text === "Gimme them suggestions") {
		Suggestion.find(function(err, list) {
			if(err) throw err;
			if(list && list.length > 0) {
				bot.say(from, "Here are the pending suggestions:");
				list.forEach(function(sug) {
					bot.say(from, "On " + sug.date + ", " + sug.from + " suggested \"" + sug.suggestion + "\"");
				});
				Suggestion.remove({}, function(err) {
					if(err) throw err;
				});
			}
			else {
				bot.say(from, "No pending suggestions.");
			}
		});
	}
	return canPost;
}