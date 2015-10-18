var express = require('express');
var app = express();
var path = require('path'); 

var map_width = 800;
var map_height = 400;
var player_width = 50;
var player_height = 50;
var bullet_width = 5;
var bullet_height = 5;
var messageData = [];
var playerData = {};
var bulletData = {};
var bulletID = 1;



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




var returnEmptyBulletsFlag = true;
setInterval(function() {
	if (Object.keys(bulletData).length == 0) {
		if (returnEmptyBulletsFlag) {
			returnEmptyBulletsFlag = false;
		} else {
			return;
		}
	}
	
	var data = [];
	for(var bullet in bulletData) {
		data.push(bulletData[bullet]);
	}
	data.sort(function(x, y) {
		if (x.id < y.id) {
			return -1;
		}
		if (x.id > y.id) {
			return 1;
		}
		return 0;
	});
	io.emit('playerbullets', data);
}, 100);




io.on('connection', function(socket){
	console.log('a user connected');

	socket.on('enter', function(data){
		var ID = socket.id;
		
		for(var player in playerData) {
			if (playerData.hasOwnProperty(player)) {
				if (playerData[player].name == data.name) {
					socket.emit('invalidname', {
						'message' : 'Name is already taken'
					});	
					return;
				}
			}
		}
		
		playerData[ID] = {
			'id' : ID,
			'x' : map_width/2,
			'y' : map_height/2,
			'hp' : player_width,
			'name' : data.name,
			'color' : data.color
		};
		
		socket.emit('youenter', {
			'id' : ID,
			'players' : playerData,
			'p_w' : player_width,
			'p_h' : player_height,
			'map_w' : map_width,
			'map_h' : map_height,
			'messages' : messageData
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

	socket.on('sendmessage', function(data) {
		var ID = socket.id;
		var message = {
			'message' : data.message,
			'name' : playerData[ID].name,
			'color' : playerData[ID].color
		};
		
		messageData.push(message);
		io.emit('sendmessage', message);
	});
	
	socket.on('shoot', function(data){	
		var ID = socket.id;
		
		var sx = playerData[ID].x + player_width/2;
		var sy = playerData[ID].y + player_height/2;
		
		var angle = angleBetweenTwoPointsRad({
			'x' : sx,
			'y' : sy
		}, {
			'x' : data.x,
			'y' : data.y
		});
		
		var bullet = {
			'id' : bulletID,
			'pid' : ID,
			'color' : playerData[ID].color,
			'x' : sx,
			'y' : sy,
			'b_w' : bullet_width,
			'b_h' : bullet_height
		};
		
		bulletData[bulletID] = bullet;
		bulletID += 1;
		
		var interval = setInterval(function() {
			if (!inArena(bullet.x, bullet.y)) {
				clearInterval(interval);
				io.emit('playerbulletremove', {
					'id' : bullet.id
				});
				deleteBullet(bullet.id);
			} else {
				for(var player in playerData) {
					if (playerData.hasOwnProperty(player) && playerData[player].id != bullet.pid) {
						if (inPlayer(bullet.x, bullet.y, playerData[player])) {
							clearInterval(interval);
							io.emit('playerhit', {
								'id' : playerData[player].id,
								'dmg' : 5
							});
							deleteBullet(bullet.id);
							return;
						}
					}
				}
				bullet.x += 10 * Math.cos(angle);
				bullet.y += 10 * Math.sin(angle);
			}
		}, 100);
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


function deleteBullet(id) {
	delete bulletData[id];
	if (Object.keys(bulletData).length == 0) {
		returnEmptyBulletsFlag = true;
	}
}
function inPlayer(x, y, player) {
	return x >= player.x && x <= player.x + player_width && y >= player.y && y <= player.y + player_height;
}
function inArena(x, y) {
	return x >= 0 && x <= map_width && y >= 0 && y <= map_height;
}
function angleBetweenTwoPointsDeg(p1, p2) {
	var angleDeg = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
	return angleDeg;
}
function angleBetweenTwoPointsRad(p1, p2) {
	var angleRad = Math.atan2(p2.y - p1.y, p2.x - p1.x);
	return angleRad;
}