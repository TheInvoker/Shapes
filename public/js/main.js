var socket = io();


socket.on('youenter', function(data) {
	var players = data.players;
	var p_w = data.p_w;
	var p_h = data.p_h;
	var map_w = data.map_w;
	var map_h = data.map_h;
	
	$("#arena").css('width', map_w + "px");
	$("#arena").css('height', map_h + "px");
	
	for(var player in players) {
		if (players.hasOwnProperty(player)) {
			addPlayer(players[player], p_w, p_h);
		}
	}
	
	$("html").keypress(function(event){   
		var valuekey = event.charCode;
		var key = String.fromCharCode(valuekey);
		
		
		if (key == "w") {
			socket.emit('moveup', 1);
		}
		
		if (key == "s") {
			socket.emit('movedown', 1);
		}
		
		if (key == "a") {
			socket.emit('moveleft', 1);
		}
		
		if (key == "d") {
			socket.emit('moveright', 1);
		}
	});
});

socket.on('playerenter', function(data) {
	var player = data.player;
	var p_w = data.p_w;
	var p_h = data.p_h;
	addPlayer(player, p_w, p_h);
});

socket.on('playermoveup', function(data) {
	var id = data.id;
	var new_y = data.y;
	
	$("#arena > div[data-id=" + id + "]").css('top', new_y + "px");
});
socket.on('playermovedown', function(data) {
	var id = data.id;
	var new_y = data.y;
	
	$("#arena > div[data-id='" + id + "']").css('top', new_y + "px");
});
socket.on('playermoveleft', function(data) {
	var id = data.id;
	var new_x = data.x;

	$("#arena > div[data-id='" + id + "']").css('left', new_x + "px");
});
socket.on('playermoveright', function(data) {
	var id = data.id;
	var new_x = data.x;

	$("#arena > div[data-id='" + id + "']").css('left', new_x + "px");
});

socket.on('playerexit', function(data) {
	var id = data.id;
	$("#arena > div[data-id='" + id + "']").remove();
});


function addPlayer(player, p_w, p_h) {
	var id = player.id;
	var name = player.name;
	var color = player.color;
	var x = player.x;
	var y = player.y;
	var hp = player.hp;

	var shapeobj = $("<div/>");
	shapeobj.html(name);
	shapeobj.addClass('shape');
	shapeobj.css('background-color', color);
	shapeobj.attr('data-id', id);
	shapeobj.css('left', x);
	shapeobj.css('top', y);
	shapeobj.css('width', p_w + "px");
	shapeobj.css('height', p_h + "px");
	shapeobj.attr('data-hp', hp);
	$("#arena").append(shapeobj);
}





$(document).ready(function() {
	
	$(".shape-preview").click(function() {
		$("#shape_select").hide();
		$("#shape_fight").show();
		
		var name = $(this).attr("data-name");
		var color = $(this).attr("data-color");
		
		socket.emit('enter', {
			'name' : name,
			'color' : color
		});
	});
});