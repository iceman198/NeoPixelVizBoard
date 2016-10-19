/**
	author: Sean Dutton @seantdutton
**/

var express = require('express');
var app = express();
var logger = require('./logger');

var port = 8080;

// this lets me take an argument that is passed when the script is started
//     example: $node serverChild.js 8081 << 8081 will be the port used in this case
// uncomment if you want to utilize this
process.argv.forEach(function (val, index, array) {
  //console.log(index + ': ' + val);
  //port = val;
});

app.get('/species/:species/:isresult/:isresultbad', function(req, res) {
	var pulse = require('./pulse');
	
	//totalCount++;
	//logger.log('info', 'serverChild.js', 'Connection from IP ' + req.remoteAddress + '.');
	var species = req.params.species;
	var isresult = req.params.isresult;
	var isresultBad = req.params.isresultbad;
	//var totalCount = pulse.getTotalCount();
	var divisibleBy = pulse.getDivisibleBy();
	// var divisibleBy5000=pulse.getDivisibleBy5000();
	//var rowCount = pulse.getRowCount();
	
	logger.log('info', 'serverChild.js', 'I see an species of: ' + species + ' result is: ' + isresult + ' and resultbad is: ' + isresultBad);
	var statusStr = {
			status: "SUCCESS",
			species: species, 
			//totalcount: totalCount,
			divisibleby: divisibleBy
			//rowcount: rowCount
			// divisibleby5000: divisibleBy5000
		};
	res.send(JSON.stringify(statusStr));
	
	pulse.sendPulse(species, isresult, isresultBad);
});

app.get('/service/:cmd', function(req, res) {
	var cmd = req.params.cmd;
	if (cmd == 'resetcounts') {
		var pulse = require('./pulse');
		pulse.resetcounts();
		res.end('SUCCESS');
		logger.log('info', 'serverChild.js', 'counts reset');
	} else if (cmd.indexOf('updatecounts') != -1) {
		var pulse = require('./pulse');
		var temp = cmd.replace('updatecounts,', '');
		var arr = temp.split(',');
		
		if (arr.length == 3) {
			pulse.updatecounts(arr[0], arr[1], arr[2]);
			res.end('SUCCESS');
			logger.log('info', 'serverChild.js', 'counts updated: ' + arr);
		} else {
			res.end('ERROR: array length of ' + arr.length + ' is incorrect (' + arr + ') ' + '(' + cmd + ') ' + '(' + temp + ')');
		}
	} else if (cmd == 'reboot') {
		console.log('reboot issued');
		var exec  = require("child_process").exec ;
		exec ('reboot', function(error, stdout, stderr) {
			// nothing for now
		});
	} else if (cmd == 'shutdown') {
		console.log('shutdown issued');
		var exec  = require("child_process").exec ;
		exec ('shutdown now', function(error, stdout, stderr) {
			
		});
	} else {
		res.end('Command ' + cmd + ' not recognized');
	}
});

var server = app.listen(port, function() {
	var pulse2 = require('./pulse');
	logger.log('info', 'serverChild.js', 'listening on http://localhost:' + port);
	
	pulse2.cleanSlate();
	pulse2.cleanSlate(); // have to do it a second time for some reason so it doesn't sparkle..
	pulse2.startup();
});

function sleep(milliseconds) {
	var tempTime = new Date().getTime();
	for (var i = 0; i < 1e7; i++) {
		if ((new Date().getTime() - tempTime) > milliseconds){
			break;
		}
	}
}

