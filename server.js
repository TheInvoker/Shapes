var express = require('express');
var app = express();
var path = require('path'); 

var map_width = 800;
var map_height = 400;
var player_width = 50;
var player_height = 50;
var playerData = {};




app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
	var dest = 'index.html';
	res.sendFile(dest, { root: __dirname });
});




var server = app.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Shape Wars started at http://%s:%s', host, port);
});


var io = require('socket.io').listen(server);

io.on('connection', function(socket){
	console.log('a user connected');
	
	var ID = socket.id;
	playerData[ID] = {
		'id' : ID,
		'x' : map_width/2,
		'y' : map_height/2,
		'hp' : 100
	};

	socket.on('enter', function(data){
		var ID = socket.id;
		playerData[ID].name = data.name;
		playerData[ID].color = data.color;
		
		socket.emit('youenter', {
			'players' : playerData,
			'p_w' : player_width,
			'p_h' : player_height,
			'map_w' : map_width,
			'map_h' : map_height
		});
		
		socket.broadcast.emit('playerenter', {
			'player' : playerData[ID],
			'p_w' : player_width,
			'p_h' : player_height
		});
	});
	
	socket.on('moveup', function(data){
		var ID = socket.id;
		playerData[ID].y = Math.max(0, playerData[ID].y-5);
		io.emit('playermoveup', {
			'id' : ID,
			'y' : playerData[ID].y
		});
	});
	socket.on('movedown', function(data){
		var ID = socket.id;
		playerData[ID].y += 5;
		playerData[ID].y = Math.min(map_height - player_height, playerData[ID].y+5);
		io.emit('playermovedown', {
			'id' : ID,
			'y' : playerData[ID].y
		});
	});
	socket.on('moveleft', function(data){
		var ID = socket.id;
		playerData[ID].x = Math.max(0, playerData[ID].x-5);
		io.emit('playermoveleft', {
			'id' : ID,
			'x' : playerData[ID].x
		});	
	});
	socket.on('moveright', function(data){	
		var ID = socket.id;
		playerData[ID].x = Math.min(map_width - player_width, playerData[ID].x+5);
		io.emit('playermoveright', {
			'id' : ID,
			'x' : playerData[ID].x
		});
	});

	socket.on('disconnect', function() {
		console.log('a user left');
		
		var ID = socket.id;
		if (ID in playerData) {
			delete playerData[ID];
		}
		
		io.emit('playerexit', {
			'id' : ID
		});
	});
});