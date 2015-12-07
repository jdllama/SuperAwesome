var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
var random = require('mongoose-random');
var fs = require("fs");
var path = require("path");
var r = require("request");
var $ = require("cheerio");

var logSchema = mongoose.Schema({
	date: String,
	logs: Array
});

var Log = mongoose.model("holidaybullshit_logs", logSchema);

var puzzleSchema = mongoose.Schema({
	channel: String,
	isActive: Boolean,
	sheet: String,
	description: String,
	createdDate: Date,
	createdBy: String
});

var puzzleBox = mongoose.model("holidaybullshit_puzzles", puzzleSchema);

router.all("/", function(request, response) {
	return response.redirect("/holidaybullshit/puzzles/");
});

router.get("/logs", function(request, response) {
	Log.find(function(err, logs) {
		if(err) throw err;
		var dates = [];
		logs.forEach(function(log) {
			dates.push(log.date);
		});
		dates.sort();
		response.render("alllogs", {logs: dates});
	});
});

router.get("/logs/:date", function(request, response) {
	var date = request.params.date;
	Log.findOne({date: date}, function(err, todayLog) {
		if(err) throw err;
		var lines = [];
		if(todayLog) {
			lines = todayLog.logs;
		}
		response.render("individuallog", {lines: lines});
	});
});

function rand(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

router.get("/puzzles", function(request, response) {
	var messages = ["Buttsex", "It's a duck", "No, Drackodelmal, you aren't getting a hug", "Offer void in the state of Neptune"];
	var message = rand(messages);
	response.render("holidaybullshit/allpuzzles", {message: message});
});

router.get("/puzzles/:puzzle", function(request, response) {
	var a = request.params.puzzle + "";
	var puzzle = request.params.puzzle + "";
	puzzle = puzzle.trim().toUpperCase();

	puzzle = "#" + puzzle;

	puzzleBox.find({}, function(err, allPuzzles) {
		allPuzzles.sort(function(a, b){
			if(a.channel < b.channel) return -1;
			if(a.channel > b.channel) return 1;
			return 0;
		})
		puzzleBox.findOne({channel: puzzle}, function(err, puzzleRes) {
			if(!puzzleRes) {
				//return response.status(404).send("Puzzle not found.");
				puzzleBox.findOne({channel: a}, function(err, puzzleRes) {
					if(!puzzleRes) {
						return response.status(404).send("Puzzle not found.");
					}
					else {
						response.render("holidaybullshit/puzzle", {puzzle: puzzleRes, allPuzzles: allPuzzles});
					}
				});
			}
			else {
				response.render("holidaybullshit/puzzle", {puzzle: puzzleRes, allPuzzles: allPuzzles});
			}
		});
	});
});

router.get("/allpuzzles", function(request, response) {
	puzzleBox.find({}, function(err, puzzles) {
		var arr = [];
		var puzzleSchema = function(channel, description, isActive) {
			var me = this;
			me.channel = channel;
			me.description = description;
			me.isActive = isActive;
			return me;
		}
		puzzles.forEach(function(obj) {
			arr.push(new puzzleSchema(obj.channel, obj.description, obj.isActive));
		});

		arr.sort(function(a, b){
			if(a.channel < b.channel) return -1;
			if(a.channel > b.channel) return 1;
			return 0;
		})
		
		response.json(arr);
	});
});

/*
router.get("/wordfind", function(request, response) {
	var images = [
		"http://imgur.com/Ixmhvzf.png",
		"http://imgur.com/diIhKFA.png",
		"http://imgur.com/HuVuvO2.png",
		"http://imgur.com/ZZmQjxF.png",
		"http://imgur.com/8jaNKfR.png",
		"http://imgur.com/iEJp9oQ.png",
		"http://imgur.com/UxQXjtP.png",
		"http://imgur.com/R6iWD07.png",
		"http://imgur.com/7HwqbN6.png"
	]
	response.render("codebreakers_wordfind", {images: images});
});

router.get("/wordfind2", function(request, response) {
	var images = [
		"http://imgur.com/CupYz1D.png",
		"http://imgur.com/QtrD3kr.png",
		"http://imgur.com/cpAtij8.png",
		"http://imgur.com/S2I2SyQ.png",
		"http://imgur.com/tn6Go0N.png",
		"http://imgur.com/fyZPhvn.png",
		"http://imgur.com/QrSSy2x.png",
		"http://imgur.com/J5ouU9V.png",
		"http://imgur.com/XiexyHy.png"
	]
	response.render("codebreakers_wordfind", {images: images});
});*/

module.exports = router