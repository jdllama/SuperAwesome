var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");

var messageSchema = mongoose.Schema({
	message: String,
	channel: String
});

var messageCollection = mongoose.model("superawesome_messages", messageSchema);

var channels = ["#mariomaker", "#holidaybullshit"];

router.get(process.env.TheseAreNotTheDroidsYouAreLookingFor, function(request, response) {
	response.render("WAHOO", {channels: channels});
});

router.post(process.env.TheseAreNotTheDroidsYouAreLookingFor, function(request, response) {
	var channel = request.body.channel.trim();
	var message = request.body.message.trim();
	if(channel.length && message.length) {
		var m = new messageCollection({channel: channel, message: message});
		m.save();
	}
	response.render("WAHOO", {channels: channels});
})

module.exports = router