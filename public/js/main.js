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
	
	$('#sendMessage').submit(function() {
		var message = $('#messageVal').val().trim();
		if (message.length == 0) return false;
		
		$('#messageVal').val('');

		socket.emit('sendmessage', {
			'message' : message
		});

		return false;
	});
});

socket.on('playerenter', function(data) {
	var player = data.player;
	var p_w = data.p_w;
	var p_h = data.p_h;
	addPlayer(player, p_w, p_h);
});

socket.on('sendmessage', function(data) {
	$("#chatbox").append("<div><span style='color:" + data.color + "'>" + data.name + "</span>: " + data.message + "</div>");
	scrollToBot();
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
socket.on('playerbullets', function(data) {
	var mapBulletsObjs = $("#arena > div.bullet");
	
	var mapBullets = [];
	for(var i=0; i<mapBulletsObjs.length; i+=1) {
		mapBullets.push($(mapBulletsObjs[i]));
	}
	
	mapBullets.sort(function(x, y) {
		var x_ = parseInt(x.attr("data-id"), 10);
		var y_ = parseInt(y.attr("data-id"), 10);
		if (x_ < y_) {
			return -1;
		}
		if (x_ > y_) {
			return 1;
		}
		return 0;
	});
	
	var i = 0, j = 0;
	while (i < mapBullets.length && j < data.length) {
		var curMapBullet = mapBullets[i];
		var curMapBulletID = parseInt(curMapBullet.attr("data-id"), 10);
		var curDataBullet = data[j];

		if (curMapBulletID == curDataBullet.id) {
			curMapBullet.css({
				'left' : curDataBullet.x,
				'top' : curDataBullet.y
			});
			i += 1;
			j += 1;
		}
		else if (curMapBulletID < curDataBullet.id) {
			curMapBullet.remove();
			i += 1;
		} 
	}
	for(i=i; i<mapBullets.length; i+=1) {
		mapBullets[i].remove();
	}
	for(j=j; j<data.length; j+=1) {
		curDataBullet = data[j];
		
		var bullet = $("<div/>");
		bullet.addClass("bullet");
		bullet.attr("data-id", curDataBullet.id);
		bullet.css("background-color", curDataBullet.color);
		bullet.css("width", curDataBullet.b_w + "px");
		bullet.css("height", curDataBullet.b_h + "px");
		bullet.css("left", curDataBullet.x);
		bullet.css("top", curDataBullet.y);
		$("#arena").append(bullet);
	}
});

socket.on('playermoveup', function(data) {
	var id = data.id;
	var new_y = data.y;
	
	$("#arena > div.shape[data-id=" + id + "]").css({
		'top': new_y + "px"
	}, 'fast');
});
socket.on('playermovedown', function(data) {
	var id = data.id;
	var new_y = data.y;
	
	$("#arena > div.shape[data-id='" + id + "']").css({
		'top': new_y + "px"
	}, 'fast');
});
socket.on('playermoveleft', function(data) {
	var id = data.id;
	var new_x = data.x;

	$("#arena > div.shape[data-id='" + id + "']").css({
		'left': new_x + "px"
	}, 'fast');
});
socket.on('playermoveright', function(data) {
	var id = data.id;
	var new_x = data.x;

	$("#arena > div.shape[data-id='" + id + "']").css({
		'left': new_x + "px"
	});
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

function scrollToBot() {
	$("#chatbox").animate({ scrollTop: $("#chatbox").height() }, "slow");
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