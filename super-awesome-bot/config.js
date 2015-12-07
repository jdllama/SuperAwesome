module.exports = {
	IRCserver: "irc.snoonet.org",
	botName: "SuperAwesome",
	botRealName: "Super Awesome by JDllama",
	IRCpassword: process.env.IRCPASSWORD,
	MONGO_SERVER: "mongodb://" + process.env.MONGO_USER + ":" + process.env.MONGO_PASSWORD + "@" + process.env.MONGO_SERVER,
	herokuURL: "http://superawesomeirc.herokuapp.com/",
	SlackAPI: process.env.SLACK_API_KEY,
	holidayBullshit: {
		sheet: {
			HolidayBullshit2015SheetID: process.env.HolidayBullshit2015SheetID,
			private_key_id: process.env.private_google_key_id,
			private_key: process.env.private_google_key,
			client_email: process.env.google_email,
		  	client_id: process.env.google_id,
		  	type: "service_account"
		}
	}
}