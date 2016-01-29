(function() {
	
	var fs = require("fs");
	
	//import pure js code this way for now
	eval(fs.readFileSync('bower_components/dymo-generator/dymo-templates.js')+'');
	eval(fs.readFileSync('bower_components/dymo-generator/dymo-generator.js')+'');
	eval(fs.readFileSync('bower_components/dymo-generator/feature-loader.js')+'');
	eval(fs.readFileSync('bower_components/dymo-generator/globals.js')+'');
	eval(fs.readFileSync('bower_components/dymo-core/io/globals.js')+'');
	eval(fs.readFileSync('bower_components/dymo-core/logic/dymo.js')+'');
	eval(fs.readFileSync('bower_components/dymo-core/logic/parameter.js')+'');
	eval(fs.readFileSync('bower_components/dymo-core/logic/mapping.js')+'');
	eval(fs.readFileSync('bower_components/dymo-core/math/functioninverter.js')+'');
	eval(fs.readFileSync('bower_components/dymo-core/navigators/sequential.js')+'');
	eval(fs.readFileSync('bower_components/dymo-core/navigators/similarity.js')+'');
	
	var express = require('express');
	var bodyParser = require('body-parser');
	var request = require('request');
	var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
	
	var app = express();
	var PORT = 8090;
	
	app.use(bodyParser.json({limit: '50mb'}));
	app.use('/features', express.static(__dirname + '/features'));
	
	//a first test dymo generator
	app.get('/apitest', function(req, res) {
		var apiUri = 'http://localhost:8070/';
		var feature = 'afv:BarandBeatTracker';
		request(apiUri + 'findNearestTracks?valence=0.1&arousal=0.5&limit=3', function(error, response, body) {
			if (!error) {
				var filename = JSON.parse(body)[0].path.value;
				//obtained trackId not in features?!
				request(apiUri + "getFeaturesByFilenames?filenames=['" + filename + "']&feature=" + feature, function(error, response, body) {
					var generator = new DymoGenerator(undefined, function(){});
					generator.setCondensationMode(MEAN);
					DymoTemplates.createAnnotatedBarAndBeatDymo(generator, [JSON.parse(body)[0][feature]], function() {
						res.send(generator.dymo.toJsonHierarchy());
					});
				});
			}
		});
	});
	
	//a first test dymo generator
	app.get('/localtest', function(req, res) {
		var featureFilesDir = 'http://localhost:' + PORT + '/features/';
		var selectedSourceName = 'roll';
		var uris = [];
		uris[0] = featureFilesDir + selectedSourceName + '_barbeat.json';
		uris[1] = featureFilesDir + selectedSourceName + '_amplitude.json';
		uris[2] = featureFilesDir + selectedSourceName + '_centroid.json';
		var generator = new DymoGenerator(undefined, function(){});
		generator.setCondensationMode(MEAN);
		DymoTemplates.createAnnotatedBarAndBeatDymo(generator, uris, function() {
			console.log("dymo generated")
			res.send(generator.dymo.toJsonHierarchy());
		});
	});
	
	app.listen(PORT, function() {
		console.log('Dymo server started at http://localhost:' + PORT);
	});
	
}).call(this);
