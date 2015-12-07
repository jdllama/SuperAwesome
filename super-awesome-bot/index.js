var start = new Date();
var bot = require("./botscripts/bot")();
var slackBot = require("./botscripts/slackBot")();

var building = require("./botscripts/building");
building.config(bot, slackBot);

require("./botscripts/mariomaker")();
require("./botscripts/holidaybullshit")();
require("./botscripts/common_slack")();

require("./botscripts/secrets")();

building.start(start);