function getRandom(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rand(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = function() {
	var all = ["? Blocks", "1-Up Mushrooms", "Arrow Signs", "Bill Blasters", "Red Bill Blasters", "Bloopers", "Blooper Nannies", "Bob-ombs", "Short Fuse Bob-ombs", "Boos", "Boo Buddies", "Stretch", "Bowsers", "Bowser Jr.s",
		"Burners", "Buzzy Beetles", "Shell Helmets", "Cannons", "Red Cannons", "Chain Chomps", "Unchained Chomps", "Green Cheep Cheeps", "Red Cheep Cheeps", "Cloud Blocks", "Coins", "Conveyor Belts",
		"Donut Blocks", "Dry Bones/Fish Bones", "Fire Bars", "Fire Flowers", "Grinders", "Hammer Bros.", "Sledge Bros.", "Hidden Blocks", "Ice Blocks", "Green Koopa Troopas", "Red Koopa Troopas", "Lakitus", "Lakitu's Cloud",
		"Lava Bubbles", "Skull Rafts", "Lifts", "Magikoopas", "Munchers", "Mushroom Platforms", "Note Blocks", "One-way Walls", "P-Switches", "Pipes", "Piranha Plants", "POW Blocks", "Rocky Wrenches", "Monty Moles",
		"Semi Solid Platforms", "Spike Traps", "Red Spike Tops", "Blue Spike Tops", "Spinies", "Super Mushroms", "Super Stars", "Thwomps", "Tracks", "Trampolines", "Doors", "Wigglers", "Vines", "Koopa Clown Cars",
		"Winged Bloopers", "Winged Bob-ombs", "Winged Blocks", "Paratroopas"]
	
	var uniques = {
		"Super Mario Bros.": {
			items: ["Brick Blocks", "Goombas", "Shoe Goombas", "Costumes", "Fire Piranha Plants", "Weird Mushrooms", "Paragoombas"],
			mechanics: []
		},
		"Super Mario Bros. 3": {
			items: ["Brick Blocks", "Goombas", "Shoe Goombas", "Super Leaves", "Fire Piranha Plants", "Paragoombas"],
			mechanics: ["the POW Block Rail Glitch"]
		},
		"Super Mario World": {
			items: ["Rotating Blocks", "Galoombas", "Yoshi", "Cape Feathers", "Jumping Piranha Plants", "Paragaloombas"],
			mechanics: ["Spin jumping", "the POW Block Rail Glitch"]
		},
		"New Super Mario Bros.": {
			items: ["Brick Blocks", "Goombas", "Yoshi", "Propeller Mushrooms", "Fire Piranha Plants", "Paragoombas"],
			mechanics: ["Wall-jumping", "Ground-pounding", "Spin jumping", "the POW Block Rail Glitch"]
		}
	}
	
	var mechanics = ["Slow auto scrolling", "Medium auto scrolling", "Fast auto scrolling", "a Single Screen", "only 30 seconds", "only 10 seconds", "only 100 seconds", "the Invincibility Glitch", "the Merged Block Glitch",
		"a Maze motiff", "a Puzzle motiff", "a Traditional design", "a Kaizo/Panga design", "an Autoplay design", "a story you want to tell the player", "OMG RANDOM STUFF EVERYWHERE"];
	var environments = ["Overworld", "Underground", "Water", "Ghost House", "Airship", "Castle"];
	var times = ["30 minutes", "1 hour", "4 hours", "8 hours", "24 hours"];
	
	
	
	var keys = Object.keys(uniques);
	
	var style = rand(keys);
	var availableItems = all.concat(uniques[style].items);
	var howManyItems = getRandom(2,4);
	var arr = [];
	
	while(howManyItems) {
		var item = rand(availableItems);
		arr.push(item);
		var ind = availableItems.indexOf(item);
		availableItems[ind] = availableItems[availableItems.length - 1];
		availableItems.pop();
		howManyItems--;
	}
	
	var allMechanics = mechanics.concat(uniques[style].mechanics);
	var mechanic = rand(allMechanics);
	
	var myTime = rand(times);
	
	var environment = rand(environments);
	
	// return "You have " + myTime + " to make a " + style + " level using the " + environment + " environment, with " + mechanic + ", and the following items: " + arr.join(", ");
	return "You have " + myTime + " to make a " + style + " level using the " + environment + " environment, and the following items: " + arr.join(", ");
}