var appPort = 16558;


var express = require('express'), app = express();
var http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server)
  , dl  = require('delivery')
  , fs  = require('fs')
  , _ = require('underscore')._;



 var jade = require('jade');


 
	app.set('views', __dirname + '/view');
	app.set('view engine', 'jade');
	app.set("view options", { layout: false });


	app.use(express.static(__dirname + '/public'));


	app.get('/', function(req, res){
	  res.render('home.jade');
	});




  	server.listen(appPort);
	// app.listen(appPort);
	console.log("Server listening on port 16558");

	var people = {};
	var rooms = {};
	var sockets = [];









	io.sockets.on('connection', function (socket) { // First connection

			//capture user from client and set user details to socket 
			socket.on('joinserver', function (username,device) {

				var exists = false;
				var ownerRoomID = inRoomID = null;

				_.find(people, function(key,value) {
					if (key.name.toLowerCase() === username.toLowerCase())
						return exists = true;
				});
				if (exists) {

						var randomNumber=Math.floor(Math.random()*1001)
						do {
							proposedName = username+randomNumber;
							_.find(people, function(key,value) {
								if (key.name.toLowerCase() === proposedName.toLowerCase())
									return exists = true;
							});
						} while (!exists);
						socket.emit("exists", {status:'exists',msg: "The username already exists, please pick another one.", proposedName: proposedName});


				}else{
					people[socket.id] = {"name" : username, "owns" : ownerRoomID, "inroom": inRoomID, "device": device};
					socket.emit("update", "You have connected to the server.");
					socket.emit("exists", {status:'no'});
					io.sockets.emit("update", people[socket.id].name + " is online.");
					sizePeople = _.size(people);
					sizeRooms = _.size(rooms);
					io.sockets.emit("update-people", {people: people, count: sizePeople});

				}

			});

			//find weather usr is typing or not
			socket.on("typing", function(data) {
				if (typeof people[socket.id] !== "undefined")
						io.sockets.in(socket.room).emit("isTyping", {isTyping: data, person: people[socket.id].name});
				});

			//process a message from user to users
			socket.on("send", function(msg) {
				socket.in(socket.room).broadcast.emit("chat", people[socket.id], msg);
			});


	});


