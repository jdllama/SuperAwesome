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

var Log = mongoose.model("mariomaker_logs", logSchema);

var marioTagSchema = mongoose.Schema({
	text: String
});

var TagBox = mongoose.model("mariomaker_tags", marioTagSchema);

var marioLevelSchema = mongoose.Schema({
	ID: String,
	tags: [marioTagSchema],
	wins: Number
});

var marioIDBoxSchema = mongoose.Schema({
	user: String,
	IDs: [marioLevelSchema]
});

marioIDBoxSchema.plugin(random, {path: "r"});

var IDBox = mongoose.model("mariomaker_levelids", marioIDBoxSchema);

var marioMiiverseCacheSchema = mongoose.Schema({
	miiverseName: String,
	lastUpdate: Date,
	codes: [{}]
});

var marioMiiverseBox = mongoose.model("mariomaker_miiversecaches", marioMiiverseCacheSchema);

router.get("/level", function(request, response) {
	return response.redirect("./levels");
});

router.get("/level/:_id", function(request, response) {
	var ID = request.params._id;

	IDBox.findOne({"IDs._id": ID}, function(err, level) {
		TagBox.find({}, function(err, tags) {
			var model = {
				username: "",
				levelname: "Level not found",
				wins: "",
				tags: []
			};
			if(level) {
				var level2 = null;
				level.IDs.forEach(function(level) {
					if(level._id == ID) level2 = level;
				});
				if(level2 !== null) {
					model.username = level.user;
					model.levelname = level2.ID;
					model.wins = level2.wins;
					model.tags = level2.tags;
				}
			}
			var realTags = [];

			tags.forEach(function(tag) {
				var obj = {
					selected: false,
					text: tag.text
				}
				if(model.tags.indexOf(tag.text) !== -1) {
					obj.selected = true;
				}
				realTags.push(obj);
			});
			response.render("mariomaker/individuallevel", {model: model, tags: realTags, ID: ID});
		});
	});
});

router.post("/level/:_id", function(request, response) {
	var data = request.body.data;
	var ID = request.params._id;
	IDBox.findOne({"IDs._id": ID}, function(err, level) {
		TagBox.find({}, function(err, tags) {
			var model = {
				username: "",
				levelname: "Level not found",
				wins: "",
				tags: []
			};
			if(level) {
			}
			var realTags = [];

			tags.forEach(function(tag) {
				var obj = {
					selected: false,
					text: tag.text
				}
				if(model.tags.indexOf(tag.text) !== -1) {
					obj.selected = true;
				}
				realTags.push(obj);
			});
			return response.redirect("../level/" + ID);
		});
	});
});

router.get("/levels/", function(request, response) {
	response.render("mariomaker/users");
});

router.get("/miiverse", function(request, response) {
	response.render("mariomaker/miiverselevels", {miiverseName: "N/A", levels: [], lastUpdate: null});
});

router.get("/miiverse/:miiverseName", function(request, response) {
	var miiverseName = request.params.miiverseName.toUpperCase();
	marioMiiverseBox.findOne({"miiverseName": miiverseName}, function(err, miiverse) {
		var runIt = false;
		if(err) throw err;
		if(!miiverse) {
			miiverse = new marioMiiverseBox({
				miiverseName: miiverseName,
				lastUpdate: new Date(),
				codes: []
			});
			miiverse.save();
			runIt = true;
		}
		var now = new Date();
		var then = new Date(miiverse.lastUpdate);
		var diff = Math.abs(now - then);
		var minutes = Math.floor((diff/1000)/60);
		if(minutes > 30) {
			runIt = true;
		}
		if(runIt == false) {
			response.render("mariomaker/miiverselevels", {miiverseName: miiverseName, levels: miiverse.codes, lastUpdate: then});
		}
		else {
			var url = 'https://miiverse.nintendo.net/users/{0}/posts?page_param={"order":"desc","per_page":"2500000000"}'.split("{0}").join(miiverseName);
			r(url, {timeout: 1000 * 80}, function(err, res, HTML) {
				if(err) throw err;
				var parsedHTML = $.load(HTML);
				var links = parsedHTML("[href='/titles/6437256808751874777/6437256808751874782/in_game']");
				var codes = [];
				links.map(function(index, link) {
					var goodParent = $(link.parent.parent);
					var text = goodParent.find(".post-content-text");
					var goodLink = "https://miiverse.nintendo.net" + goodParent.find(".timestamp").attr("href");
					codes.push({
						code: text.text(),
						link: goodLink
					})
				});

				var a = new Date();
				miiverse.lastUpdate = a;
				miiverse.codes = codes;

				if(!miiverse.codes.length) {
					miiverse.remove(function(err, obj) {
						if(err) throw err;
						response.render("mariomaker/miiverselevels", {miiverseName: miiverseName, levels: [], lastUpdate: null});
					});
				}
				else {
					miiverse.save(function(err, obj) {
						if(err) throw err;
						response.render("mariomaker/miiverselevels", {miiverseName: miiverseName, levels: miiverse.codes, lastUpdate: a});
					});
				}
			});
		}
	});
});

router.get("/userData", function(request, response) {
	IDBox.find({}, function(err, objs) {
		var arr = [];
		var userSchema = function(user, id, count) {
			var me = this;
			me.user = user;
			me.count = count;
			me.id = id;
			return me;
		}
		objs.forEach(function(obj) {
			arr.push(new userSchema(obj.user, obj._id, obj.IDs.length));
		});

		arr.sort(function(a, b){
			if(a.user < b.user) return -1;
			if(a.user > b.user) return 1;
			return 0;
		})
		
		response.json(arr);
	});
});

router.post("/levelData", function(request, response) {
	var ID = request.body.ID.trim();
	
	IDBox.findOne({_id: ID}, function(err, user) {
		if(err) throw err;
		var model = {
			username: "User not found",
			levels: []
		};
		if(user) {
				
			model.username = user.user;
	
			var levelSchema = function(ID, _id) {
				var me = this;
				me.ID = ID;
				me._id = _id;
				return me;
			}
	
			user.IDs.forEach(function(level) {
				model.levels.push(new levelSchema(level.ID, level._id));
			});
	
			
		}
		var results = {
			model: model,
			view: fs.readFileSync(path.join(process.cwd(), "./views/mariomaker/userdata.html"), "utf8")
		}

		response.json(results);
	});
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

router.get("/addtags", function(request, response) {
	TagBox.find({}, function(err, tags) {
		if(err) throw err;
		response.render("mariomaker/addtags", {tags: tags, message: null});
	});
});

router.get("/addtags/:message", function(request, response) {
	TagBox.find({}, function(err, tags) {
		if(err) throw err;
		response.render("mariomaker/addtags", {tags: tags, message: request.params.message});
	});
});

router.post("/addtags", function(request, response) {
	var tag = request.body.text.trim();
	if(tag) {
		var tagger = new TagBox({text: tag});
		tagger.save(function(err, obj) {
			if(err) throw err;
			return response.redirect("../addtags/" + tag + " has been added");
		});
	}
});

/*
router.get("/JDaddcodeBootyButtYeah", function(request, response) {
	IDBox.find({}, function(err, objs) {
		if(err) throw err;
		response.render("addcodes", {objs: objs});
	});
});

router.post("/JDaddcodeBootyButtYeah", function(request, response) {
	var username = request.body.username;
	var code = request.body.ID;
	var from = username.trim().toUpperCase();
	IDBox.findOne({user: from}, function(err, user) {
		if(err) throw err;
		if(!user) {
			user = new IDBox({user: from});
		}
		var isIn = false;
		user.IDs.forEach(function(ID) {
			if(ID.ID.toUpperCase() === code.toUpperCase()) isIn = true; 
		});
		
		if(isIn) {
			return response.redirect("./JDaddcodeBootyButtYeah/");
		}
		user.IDs.push({
			ID: code
		});
		user.save(function(err, obj) {
			if(err) throw err;
			return response.redirect("./JDaddcodeBootyButtYeah");
		});
	});
});*/

module.exports = router