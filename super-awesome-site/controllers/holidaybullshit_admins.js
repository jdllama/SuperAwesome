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

var Log = mongoose.model("holidaybullshit_admins_logs", logSchema);

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

module.exports = router