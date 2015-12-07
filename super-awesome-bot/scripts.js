module.exports = function(arr, from, sendMessage, sendPM, suggest) {
	var command = (arr[0] + "").toUpperCase();
	
	//from http://www.nayuki.io/res/caesar-cipher-javascript.js
	function crypt(input, key) {
		var output = "";
		for (var i = 0; i < input.length; i++) {
			var c = input.charCodeAt(i);
			if      (c >= 65 && c <=  90) output += String.fromCharCode((c - 65 + key) % 26 + 65);  // Uppercase
			else if (c >= 97 && c <= 122) output += String.fromCharCode((c - 97 + key) % 26 + 97);  // Lowercase
			else                          output += input.charAt(i);  // Copy
		}
		return output;
	}
	var myCommands = {
		"WIKI": function() {
			var URL = "http://www.reddit.com/r/holidaybullshit/wiki/index";
			var text = from + ": " + URL;
			sendMessage(text);
			
		},
		"DAY1": function() {
			var URL = "http://www.reddit.com/r/holidaybullshit/wiki/day_1";
			var text = from + ": " + URL;
			sendMessage(text);
			
		},
		"DAY2": function() {
			var URL = "http://www.reddit.com/r/holidaybullshit/wiki/day_2";
			var text = from + ": " + URL;
			sendMessage(text);
			
		},
		"DAY3": function() {
			var URL = "http://www.reddit.com/r/holidaybullshit/wiki/day_3";
			var text = from + ": " + URL;
			sendMessage(text);
			
		},
		"DAY4": function() {
			var URL = "http://www.reddit.com/r/holidaybullshit/wiki/day_4";
			var text = from + ": " + URL;
			sendMessage(text);
			
		},
		"DAY5": function() {
			var URL = "http://www.reddit.com/r/holidaybullshit/wiki/day_5";
			var text = from + ": " + URL;
			sendMessage(text);
			
		},
		"DAY6": function() {
			var URL = "http://www.reddit.com/r/holidaybullshit/wiki/day_6";
			var text = from + ": " + URL;
			sendMessage(text);
			
		},
		"DAY7": function() {
			var URL = "http://www.reddit.com/r/holidaybullshit/wiki/day_7";
			var text = from + ": " + URL;
			sendMessage(text);
			
		},
		"DAY8": function() {
			var URL = "http://www.reddit.com/r/holidaybullshit/wiki/day_8";
			var text = from + ": " + URL;
			sendMessage(text);
			
		},
		"DAY9": function() {
			var URL = "http://www.reddit.com/r/holidaybullshit/wiki/day_9";
			var text = from + ": " + URL;
			sendMessage(text);
			
		},
		"DAY10": function() {
			var URL = "http://www.reddit.com/r/holidaybullshit/wiki/day_10";
			var text = from + ": " + URL;
			//var text = from + ": The Day 10 wiki doesn't exist yet.";
			sendMessage(text);
			
		},
		"LIST": function() {
			var avail = ["ABOUT", "LOGS", "SUGGESTWIKI <phrase>", "CAESAR <phrase>", "WIKI", "DAY[1-10]", "COLORS", "LIST", "ENVELOPES", "MAP", "BINARY <binary numbers>", "FEEDS"];
			var text = from + ": Available commands: " + avail.sort().join(", ");
			sendMessage(text);
		},
		"LOGS": function() {
			var text = from + ": http://seasons-feces.herokuapp.com/logs/";
			sendMessage(text);
		},
		"ENVELOPES": function() {
			var text = from + ": I got two links for ya. http://seasons-feces.herokuapp.com/envelopes_2013 and http://seasons-feces.herokuapp.com/envelopes_2014";
			sendMessage(text);
		},
		"SUGGESTWIKI": function() {
			if(arr.length > 1) {
				var temp = arr;
				temp.shift();
				temp = temp.join(" ");
				var text = from + ": \"" + temp + "\" will be suggested to the mods.";
				sendMessage(text);
				suggest(from, temp)
			}
		},
		"CAESAR": function() {
			if(arr.length > 1) {
				var temp = arr;
				temp.shift();
				temp = temp.join(" ");
				var text = "You submitted: " + temp;
				text += "  Here are the shifts. ";
				var newTemp = [];
				for(var i = 0;i<26;i++) {
					newTemp.push(i + 1 + ": " + crypt(temp, i + 1));
				}
				text += newTemp.join("  ");
				var what = text.match(/.{1,300}/g);
				what.forEach(function(t) {
					sendPM(from, t);
				});
				//sendPM(from, text);
			}
		},
		"BINARY": function() {
			if(arr.length > 1) {
				var temp = arr;
				temp.shift();
				var text = from + ": You submitted " + temp.join(" ") + ". This converts to base 10 numbers of: ";
				var myArr = [];
				temp.forEach(function(num) {
					var what = parseInt(num, 2);
					if(!isNaN(what)) {
						myArr.push(what);
					}
					else myArr.push("Invalid number");
				})
				text += "[" + myArr.join(", ") + "]";
				sendMessage(text);
			}
		},
		"COLORS": function() {
			var colorCodes = {
				"black": 1,
				"red": 4,
				"grey": 14,
				"blue": 2
			}
			var colors = [
				["3_black", "4_red", "3_black"],
				["2_black", "6_red", "2_black"],
				["1_black", "1_red", "2_grey", "2_red", "2_grey", "1_red", "1_black"],
				["1_black", "2_blue", "1_grey", "2_red", "2_blue", "1_grey", "1_red"],
				["1_red", "2_blue", "1_grey", "2_red", "2_blue", "1_grey", "1_red"],
				["2_red", "1_grey", "4_red", "1_grey", "2_red"],
				["10_red"],
				["10_red"],
				["1_red", "1_black", "2_red", "2_black", "2_red", "1_black", "1_red"],
				["1_red", "2_black", "1_red", "2_black", "1_red", "2_black", "1_red"]
			];
			var texts = [];
			texts.push("Here is what the colors on the envelope are making so far:");
			colors.forEach(function(color) {
				var txt = "";
				color.forEach(function(c) {
					var a = c.split("_");
					var count = parseInt(a[0], 10);
					console.log("my count: " + count);
					var myCode = a[1];
					var realCode = colorCodes[myCode];
					txt += "\x03" + realCode + "," + realCode;
					for(var i = 0;i<count;i++) {
						console.log(i);
						txt += "_";
					}
				});
				texts.push(txt);
			});
			texts.forEach(function(text) {
				sendPM(from, text);
			});
		},
		"MAP": function() {
			var text = from + ": https://mapsengine.google.com/map/u/0/edit?mid=zW2SsR-ZLjG8.kZrdQNKeNFlM";
			sendMessage(text);
		},
		"ANAGRAM": function() {
			/*var text = from + ": Eat a dick!";
			sendMessage(text);
			return;
			*/
			if(arr.length > 1) {
				var temp = arr;
				temp.shift();
				temp = temp.join("%20");
				var text = from + ": http://wordsmith.org/anagram/anagram.cgi?anagram=" + temp + "&t=1000&a=n";
				sendMessage(text);
			}
		},
		"DUCK": function() {
			var phrases = [
				"Long shall we know naught but the pain and agony brought about by The Duck.",
				"I have grown numb to the gnashing of teeth and the howling of the wind, as that is all one hears when He Quacks.",
				"HARK! HARK! A night has come where man must seek his duckly death! HARK, a blighted, woeful man says it's a duck.",
				"just starting, been on vaca, any good ducks? ty",
				"Ph'nglui mglw'nafh a duck R'lyeh wgah'nagl fhtagn",
				"In the beginning, there was a duck. Just thought you should know.",
				"Her smell was indistinguishable: perfume and cigarettes. Her eyes pierced mine, pleading with me to acknowledge the truth. It's a duck.",
				"There is no Dana only duck.",
				"Hakuna Matata! It means \"It's a duck!\"",
				"http://www.reddit.com/r/holidaybullshit/comments/2p2vn2/its_a_duck/"
			];
			var text = phrases[Math.floor(Math.random() * phrases.length)];
			sendMessage(text);
		},
		"HUG": function() {
			var text = from + ": Nope. No hug. Not happening.";
			if(Math.floor(Math.random() * 100) < 15) text = from + ": Alright, fine. *hugs*";
			if(from.toUpperCase().match("SAD")) text = from + ": You definitely need one. Here you go. *hugs*";
			if(from.toUpperCase().match("DRACK")) text = from + ": OK, here you go! *poop*";
			sendMessage(text);
		},
		"ABOUT": function() {
			var text = "This bot was made by JDllama. Process uptime " + process.uptime() + " seconds.";
			sendMessage(text);
		},
		"FEEDS": function() {
			var text = "I currently check for updates from Daily Yumble, One Ring To Rule The Mall, and the Cryptex Podcast.";
			sendMessage(text);
		},
		"MARRIAGE": function() {
			var phrases = [
				"Yes, yes, Pewwer42's getting married.",
				"STOP IT YES HE'S GETTING MARRIED.",
				"I now pronounce you man and duck!"
			];
			var text = phrases[Math.floor(Math.random() * phrases.length)];
			sendMessage(text);
		},
		"SWORD": function() {
			var text = "AND MY AXE.";
			sendMessage(text);
		},
		"DONOHARM": function() {
			var text = "The greatest rule we have in this chat room is simple: Do no harm. Neither through inaction do we allow harm to happen.";
			sendMessage(text);
		},
		"PEWWER": function() {
			var text = "The greatest rule we have in this chat room is simple: Do no harm. Neither through inaction do we allow harm to happen.";
			sendMessage(text);
		},
		"DRAMA": function() {
			var num = Math.floor(Math.random()*11);
			var text = "";
			if(num <= 4) text = "Don't touch the poop!";
			else if(num <= 8) text = "Don't touch me!";
			else text = "You can touch me.";
			sendMessage(text);
		}
	}
	
	//if(commands.hasOwnProperty(command)) commands[command]();
	if(command in myCommands) {
		myCommands[command]();
	}
	/*
	else if(command in hiddenCommands) {
		hiddenCommands[command]();
	}
	*/
}