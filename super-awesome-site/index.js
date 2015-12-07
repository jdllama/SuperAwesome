var mongoose = require("mongoose");
mongoose.connect("mongodb://" + process.env.MONGO_USER + ":" + process.env.MONGO_PASSWORD + "@" + process.env.MONGO_SERVER);

var port = process.env.PORT || 3000;

var express = require("express");
var app = express();
var favicon = require("serve-favicon");
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(favicon(__dirname + "/public/favicon.png"));
app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(function(req, res, next) {
    if (req.path.substr(-1) == '/' && req.path.length > 1) {
        var query = req.url.slice(req.path.length);
        res.redirect(301, req.path.slice(0, -1) + query);
    } else {
        next();
    }
});

app.use(require("./controllers.js"));

app.listen(port, function() {
  console.log('Node app is running on port', port);
});