var appPort = 16558;


var express = require('express'), app = express();
var http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server)
  , dl  = require('delivery')
  , fs  = require('fs');



 var jade = require('jade');
 var pseudoArray = []; //block the admin username (you can disable it)

 
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


var usernames = {};

io.sockets.on('connection', function (socket) { // First connection

var delivery = dl.listen(socket);
  delivery.on('receive.success',function(file){

    fs.writeFile(file.name,file.buffer, function(err){
      if(err){
        console.log('File could not be saved.');
      }else{
        console.log('File saved.');

      
        io.sockets.emit('fileAttach', file);
        	
      };
    });
  });


	socket.on("typing", function(data) { 

		//console.log(data.name);
		 io.sockets.emit("isTyping", {isTyping: data.status, name :data.name});
	});
	

	socket.on('message', function (data) { // Broadcast the message to all
		if(pseudoSet(socket))
		{
			var transmit = {date : new Date().toISOString(), pseudo : returnPseudo(socket), message : data};
			socket.broadcast.emit('message', transmit);
			console.log("user "+ transmit['pseudo'] +" said \""+data+"\"");
		}
	});
	socket.on('setPseudo', function (data) { // Assign a name to the user
		if (pseudoArray.indexOf(data) == -1) // Test if the name is already taken
		{
			socket.set('pseudo', data, function(){

				//users += 1; // Add 1 to the count
				//reloadUsers(); // Send the count to all the users
				console.log(socket.id);
				socket.username = data;
				usernames[data] = data;

				
				//pseudoArray.push(data);
				socket.emit('pseudoStatus', 'ok');
				console.log("user " + data + " connected");
				io.sockets.emit('connedUser',data + '  joined conversation at');
				

				io.sockets.emit('userslist', usernames);
			});
		}
		else
		{
			socket.emit('pseudoStatus', 'error') // Send the error
		}
	});
	socket.on('disconnect', function () { // Disconnection of the client
		
		if (pseudoSet(socket))
		{
			delete usernames[socket.username];
		// update list of users in chat, client-side
		io.sockets.emit('userslist', usernames);
		// echo globally that this client has left
		socket.broadcast.emit('connedUser', socket.username + ' has disconnected');
			
			
		}
	});
});


function pseudoSet(socket) { // Test if the user has a name
	var test;
	socket.get('pseudo', function(err, name) {
		if (name == null ) test = false;
		else test = true;
	});
	return test;
}
function returnPseudo(socket) { // Return the name of the user
	var pseudo;
	socket.get('pseudo', function(err, name) {
		if (name == null ) pseudo = false;
		else pseudo = name;
	});
	return pseudo;
}