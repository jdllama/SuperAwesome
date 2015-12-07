module.exports = function(app, sendMessage) {
	app.all("/JDllama_remote/:message", function(req, res) {
		sendMessage(req.params.message);
		res.redirect("../refresher");
	});
}