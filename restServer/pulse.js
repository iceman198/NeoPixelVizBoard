var async = require("async");

var tinycolor = require('./tinycolor');
var logger = require('./logger.js');

var OPC = new require('./opc')
var client = new OPC('localhost', 7890);

var totalCountDog = 0;
var totalCountCat = 0
var totalCountOther = 0;

var rowCount = 0;
var rowCountDog = 0;
var rowCountCat = 0;
var rowCountOther = 0;

var divisibleBy = 5000;
// var divisibleBy5000=5000;
// Var rowReset=0;

var stripStart = 0; // you could tweak this if you only have a specific FC chip hooked up
var strips = 31; // ~~ same as above ~~

var stripDogStart = 21;
var stripDogStop = 31;
var stripCatStart = 10;
var stripCatStop = 20;
var stripOtherStart = 0;
var stripOtherStop = 9;

var ledStart = 0;
var leds = 32;

var darkAmount = 40;
var brightenAmount = 30;

var speedLow = 120;
var speedMax = 20;

var date;
var current_hour; // holds the actual hour--Eastern Time
var current_min; // holds the minutes--Eastern time

var colorBar = tinycolor({r: 60, g: 58, b: 35});

var colorPulseMyResultDog = tinycolor({r: 30, g: 144, b: 255}).brighten(brightenAmount);
var colorPulseDog = tinycolor({r: 30, g: 144, b: 255}).darken(darkAmount);
var colorBarDog = tinycolor({r: 30, g: 144, b: 255}).darken(darkAmount+8);

var colorPulseMyResultCat = tinycolor({r: 255, g: 0, b: 255}).brighten(brightenAmount);
var colorPulseCat = tinycolor({r: 255, g: 0, b: 255}).darken(darkAmount);
var colorBarCat = tinycolor({r: 255, g: 0, b: 255}).darken(darkAmount+2);

var colorPulseMyResultOther = tinycolor({r: 117, g: 245, b:117}).brighten(brightenAmount);
var colorPulseOther = tinycolor({r: 117, g: 245, b:117}).darken(darkAmount+10);
var colorBarOther = tinycolor({r: 117, g: 245, b:117}).darken(darkAmount+22);


exports.sendPulse = function (species, isMyResult, isMyResultBad) {	
	if (isMyResultBad == 'true') {
		isMyResultBad = true;
	} else {
		isMyResultBad = false;
	}
	if (isMyResult == 'true') {
		isMyResult = true;
	} else {
		isMyResult = false;
	}
	date = new Date();
	current_hour = date.getHours();
	current_min = date.getMinutes();
	
	logger.log('debug', 'pulse.js', '** current_hour: ' + current_hour + ' // current_min: ' + current_min);
	if (current_hour==23  && current_min ==0 ) {
		rowCount = 0;
		
	} else {}
	
	var colorPulse;
	var speed = speedMax;
	var stripNum;
	
	switch(species) {
		case 'dog':
			colorPulse = colorPulseDog;
			stripNum = getRandomInt(stripDogStart, stripDogStop);
			totalCountDog++;
			//Added by Rich
			// if (totalCountDog % divisibleBy5000 === 0) {
				// rowReset++;
			// }
			
			if (totalCountDog % divisibleBy === 0) {
				rowCountDog++;
			}
			//Added by Rich
			// if(rowCountDog==3){
				// rowCountDog=rowReset;
			// }
			if (isMyResult) {
				if(isMyResultBad){ speed = speedLow; }
				colorPulse = colorPulseMyResultDog;
			}
			break;
		case 'cat':
			colorPulse = colorPulseCat;
			stripNum = getRandomInt(stripCatStart, stripCatStop);
			totalCountCat++;
			//Added by Rich
			// if (totalCountCat % divisibleBy5000 === 0) {
				// rowReset++;
			// }
			if (totalCountCat % divisibleBy === 0) {
				rowCountCat++;
			}
			//Added by Rich
			// if(rowCountCat==3){
				// rowCountCat=rowReset;
			// }
			if (isMyResult) {
				if(isMyResultBad){ speed = speedLow; }
				colorPulse = colorPulseMyResultCat;
			}
			break;
		
		default:
			colorPulse = colorPulseOther;
			stripNum = getRandomInt(stripOtherStart, stripOtherStop);
			totalCountOther++;
			//Added by Rich
			// if (totalCountOther % divisibleBy5000 === 0) {
				// rowReset++;
			// }
			if (totalCountOther % divisibleBy === 0) {
				rowCountOther++;
			}
			//Added by Rich
			// if(rowCountDog==3){
				// rowCountOther=rowReset;
			// }
			if (isMyResult) {
				if(isMyResultBad){ speed = speedLow; }
				colorPulse = colorPulseMyResultOther;
			}
	}


	// comment this out to have it be bar specific
	stripNum = getRandomInt(stripStart, strips);
	
	//stripNum = 0;
	var red = 0;
	var green = 0;
	var blue = 0;
	var curLed = ledStart;
	var led = ledStart;
	async.whilst(
		function () { return led < leds; }, // function will run while this is true
		function (callback) {
			// working here
			for (strip = stripStart; strip <= strips; strip++) {
				var reverseRowCount;
				if (strip >= stripDogStart && strip <= stripDogStop) {
					colorBar = colorBarDog;
					reverseRowCount = leds - rowCountDog;
				} else if (strip >= stripCatStart && strip <= stripCatStop) {
					colorBar = colorBarCat;
					reverseRowCount = leds - rowCountCat;
				} else {
					colorBar = colorBarOther;
					reverseRowCount = leds - rowCountOther;
				}
				
				//colorBar = colorBar.darken(10); // why doesn't this work?
				
				curLed = led+(strip*leds);
				//curLed = led;
				//logger.log('debug', 'pulse.js', 'On strip: ' + strip + ' led:' + led + ' actualLED: ' + curLed + ' stripNum: ' + stripNum);
				
				if (strip == stripNum) {
					red = colorPulse.toRgb().r;
					green = colorPulse.toRgb().g;
					blue = colorPulse.toRgb().b;
					//logger.log('debug', 'pulse.js', 'setting color on strip: ' + strip + ' led:' + led + ' actualLED: ' + curLed + ' stripNum: ' + stripNum);
				}

				if (led >= reverseRowCount) {
					if (strip == stripNum && (led + 1) != leds) {
						//logger.log('debug', 'pulse.js', 'setting color on strip: ' + strip + ' led:' + led + ' actualLED: ' + (curLed + 1) + ' stripNum: ' + stripNum + ' reverseRowCount: ' + reverseRowCount);
						client.setPixel(curLed + 1, red, green, blue);
					}
					red = colorBar.toRgb().r;
					green = colorBar.toRgb().g;
					blue = colorBar.toRgb().b;
				}
				
				if (led > ledStart && led <= reverseRowCount) {
					client.setPixel(curLed - 1, 0, 0, 0);
				}
				if (led == leds-1) {
					red = colorBar.toRgb().r;
					green = colorBar.toRgb().g;
					blue = colorBar.toRgb().b;
				}
				if (led > leds) {
					red = 0;
					green = 0;
					blue = 0;
				}
				
				client.setPixel(curLed, red, green, blue);
				/*if (led < rowCount) {
					var c = tinycolor(colorPulse.toRgb());
					c = c.darken(darkAmount).toRgb();
					red = c.r;
					green = c.g;
					blue = c.b;
					client.setPixel(curLed-1, red, green, blue);
				}*/
				red = 0;
				green = 0;
				blue = 0;
			}
			led++;
			setTimeout(function () {
				callback(null, null);
			}, speed);
			//logger.log('debug', 'pulse.js', 'Finally - strip: ' + strip + ' led:' + led + ' actualLED: ' + curLed + ' stripNum: ' + stripNum);
		},
		function (err, n) {
		}
	);
	
	/*
	for (led = ledStart; led < leds; led++) {
		for (strip = stripStart; strip <= strips; strip++) {
			curLed = led+(strip*leds);
			//curLed = led;
			logger.log('debug', 'pulse.js', 'On strip: ' + strip + ' led:' + led + ' actualLED: ' + curLed);
			
			if (strip == stripNum) {
				red = colorPulse.toRgb().r;
				green = colorPulse.toRgb().g;
				blue = colorPulse.toRgb().b;
			}

			if (led < rowCount) {
				if (strip == stripNum) {
					client.setPixel(curLed + 1, red, green, blue);
				}
				red = colorBar.toRgb().r;
				green = colorBar.toRgb().g;
				blue = colorBar.toRgb().b;
			}
			
			if (led > ledStart && led > rowCount) {
				client.setPixel(curLed - 1, 0, 0, 0);
			}
			if (led == leds-1) {
				red = colorBar.toRgb().r;
				green = colorBar.toRgb().g;
				blue = colorBar.toRgb().b;
			}
			
			client.setPixel(curLed, red, green, blue);
			//if (led < rowCount) {
				//var c = tinycolor(colorPulse.toRgb());
				//c = c.darken(darkAmount).toRgb();
				//red = c.r;
				//green = c.g;
				//blue = c.b;
				//client.setPixel(curLed-1, red, green, blue);
			//}
			red = 0;
			green = 0;
			blue = 0;
		}
		//client.writePixels();
		sleep(speed);
	}
	curLed = 0;*/
}

exports.startup = function () {
	async.whilst(
		function () { return true; }, // function will run while this is true
		function (callback) {
			client.writePixels();
			//logger.log('debug', 'pulse.js', 'Wrote pixels');
			setTimeout(function () {
				callback(null, null);
			}, 10);
		},
		function (err, n) {
			// 5 seconds have passed, n = 5
			//logger.log('info', 'pulse.js', count);
		}
	);
}

exports.cleanSlate = function() {
	for (led = ledStart; led < (strips+1)*leds; led++) {
		//console.log('Cleaning led: ' + led);
		client.setPixel(led, 0, 0, 0);
	}
	//console.log('Cleaning led: ' + led);
	client.setPixel(led, 0, 0, 0);
	client.writePixels();
}

exports.updatecounts = function(countDog, countCat, countOther) {
	rowCountDog = parseInt(countDog) / divisibleBy;
	rowCountCat = parseInt(countCat) / divisibleBy;
	rowCountOther = parseInt(countOther) / divisibleBy;
}

exports.resetcounts = function() {
	rowCount = 0;
	rowCountDog = 0;
	rowCountCat = 0;
	rowCountOther = 0;
}

exports.getLeds = function() {
	return leds;
}

exports.getDivisibleBy = function() {
	return divisibleBy;
}

// Added by Richard
// exports.getDivisibleBy5000 = function() {
	// return divisibleBy5000;
// }
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sleep(milliseconds) {
	var tempTime = new Date().getTime();
	for (var i = 0; i < 1e7; i++) {
		if ((new Date().getTime() - tempTime) > milliseconds){
			break;
		}
	}
}
