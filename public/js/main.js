var socket = io();
var myID;

socket.on('youenter', function(data) {
	
	$("#shape_select").hide();
	$("#shape_fight").show();
	
	var players = data.players;
	var p_w = data.p_w;
	var p_h = data.p_h;
	var map_w = data.map_w;
	var map_h = data.map_h;
	
	myID = data.id;
	
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
	

	$('#arena').click(function(e) {
		var offset = $(this).offset();
		var shootx = e.pageX - offset.left;
		var shooty = e.pageY - offset.top;

		socket.emit('shoot', {
			'x' : shootx,
			'y' : shooty
		});
	});
});

socket.on('playerenter', function(data) {
	var player = data.player;
	var p_w = data.p_w;
	var p_h = data.p_h;
	addPlayer(player, p_w, p_h);
});


socket.on('playerhit', function(data) {
	var player = $("#arena > div.shape[data-id=" + data.id + "]");
	var hp = player.attr("data-hp");
	var new_hp = hp - data.dmg;
	
	if (new_hp <= 0) {
		if (player.attr("data-id") == myID) {
			alert("You Lose!");
			location.reload(); 
		}
		player.remove();
	} else {
		player.attr("data-hp", new_hp);
		player.find("div.hpbar").css("width", new_hp + "px");
	}
});
socket.on('playerbulletremove', function(data) {
	$("#arena > div.bullet[data-id=" + data.id + "]").remove();
});
socket.on('playerbullets', function(data) {
	$("#arena > div.bullet").remove();
	for(var bulletData in data) {
		var bullet = $("<div/>");
		bullet.addClass("bullet");
		bullet.attr("data-id", data[bulletData].id);
		bullet.css("background-color", data[bulletData].color);
		bullet.css("width", data[bulletData].b_w + "px");
		bullet.css("height", data[bulletData].b_h + "px");
		bullet.css("left", data[bulletData].x);
		bullet.css("top", data[bulletData].y);
		$("#arena").append(bullet);
	}
});

socket.on('playermoveup', function(data) {
	var id = data.id;
	var new_y = data.y;
	
	$("#arena > div.shape[data-id=" + id + "]").css('top', new_y + "px");
});
socket.on('playermovedown', function(data) {
	var id = data.id;
	var new_y = data.y;
	
	$("#arena > div.shape[data-id='" + id + "']").css('top', new_y + "px");
});
socket.on('playermoveleft', function(data) {
	var id = data.id;
	var new_x = data.x;

	$("#arena > div.shape[data-id='" + id + "']").css('left', new_x + "px");
});
socket.on('playermoveright', function(data) {
	var id = data.id;
	var new_x = data.x;

	$("#arena > div.shape[data-id='" + id + "']").css('left', new_x + "px");
});

socket.on('playerexit', function(data) {
	var id = data.id;
	$("#arena > div.shape[data-id='" + id + "']").remove();
});


socket.on('invalidname', function(data) {
	alert(data.message);
});


function addPlayer(player, p_w, p_h) {
	var id = player.id;
	var name = player.name;
	var color = player.color;
	var x = player.x;
	var y = player.y;
	var hp = player.hp;

	var shapeobj = $("<div/>");
	shapeobj.html("<div class='hpbar'></div>" + name);
	shapeobj.addClass('shape');
	shapeobj.addClass('noselect');
	shapeobj.css('background-color', color);
	shapeobj.attr('data-id', id);
	shapeobj.css('left', x);
	shapeobj.css('top', y);
	shapeobj.css('width', p_w + "px");
	shapeobj.css('height', p_h + "px");
	shapeobj.css('line-height', p_h + "px");
	shapeobj.attr('data-hp', hp);
	$("#arena").append(shapeobj);
}





$(document).ready(function() {
	
	$(".shape-preview").each(function(i,x) {
		$(x).html($(x).attr("data-name")).css("background-color", $(x).attr("data-color"));
	});
	
	$(".shape-preview").click(function() {
		
		var name = $("#nameEnter").val().trim();
		
		if (name == "") {
			alert("Invalid name");
			return;
		}
		
		var color = $(this).attr("data-color");
		
		socket.emit('enter', {
			'name' : name,
			'color' : color
		});
	});
});