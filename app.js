// creating global parameters and start
// listening to 'port', we are creating an express
// server and then we are binding it with socket.io
var express 	= require('express'),
    app			= express(),
    server  	= require('http').createServer(app),
    io      	= require('socket.io').listen(server),
    jade        = require('jade'),
    moment = require('moment'),
    uuid = require('node-uuid'),
    Room = require('./room.js'),
    port = process.env.PORT || 5000,

    gravatar    = require('gravatar'),
     _ = require('underscore')._;


  /*  app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 6565);
    app.set('ipaddr', process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1");*/
    app.use(express.static(__dirname + '/public'));
    app.set('views', __dirname + '/view');
    app.set('view engine', 'jade');
    app.set("view options", { layout: false });



app.get('/', function(req, res){
    res.render('index.jade');
});

server.listen(port, function(){
    console.log('Express server listening on port'+ port);

});

// hash object to save clients data,
var people = {};
var rooms = {};
var sockets = [];
var chatHistory = {};




io.sockets.on('connection', function(socket) {

    // after connection, the client sends us the
    // nickname through the connect event
    socket.on('joinserver', function (data) {
        var exists = false;
        var ownerRoomID = inRoomID = null;
        _.find(people, function(key,value) {
            if (key.name.toLowerCase() === data.name.toLowerCase())
                return exists = true;
        });

        if (exists) {//provide unique username:
            var randomNumber=Math.floor(Math.random()*1001)
            do {
                proposedName = data.name+randomNumber;
                _.find(people, function(key,value) {
                    if (key.name.toLowerCase() === proposedName.toLowerCase())
                        return exists = true;
                });
            } while (!exists);

            console.log(proposedName);
            socket.emit("exists", {msg: "The username already exists, please pick another one.", proposedName: proposedName, status:false});

        }else{
            socket.avatar = gravatar.url(data.email, {s: '100', r: 'x', d: 'mm'});
            socket.emit('avatar',socket.avatar);
            people[socket.id] = {"name" : data.name, "owns" : ownerRoomID, "inroom": inRoomID, "device": data.device, "avatar":socket.avatar};
            socket.emit("update", "You have connected to the server.");
            io.sockets.emit("update", people[socket.id].name + " is online.");
            sizePeople = _.size(people);
            sizeRooms = _.size(rooms);
            socket.emit("exists", {status:true});
            io.sockets.emit("update-people", {people: people, count: sizePeople});
            var id = uuid.v4();
            var roomname='public_room';


            var room = new Room(roomname, id, socket.id);
            rooms[id] = room;
            //join all users to public at first
            socket.room = roomname;


            socket.join('public_room');
            sockets.push(socket);

        }
    });


    //broadcast message to users in room
    socket.on("send", function(msg,nickname) {
        io.sockets.in(socket.room).emit("chat", people[socket.id], msg , socket.avatar , moment().format('h:mm a'));

    });



    function findClientsSocket(io,roomId, namespace) {
        var res = [],
            ns = io.of(namespace ||"/");    // the default namespace is "/"

        if (ns) {
            for (var id in ns.connected) {
                if(roomId) {
                    var index = ns.connected[id].rooms.indexOf(roomId) ;
                    if(index !== -1) {
                        res.push(ns.connected[id]);
                    }
                }
                else {
                    res.push(ns.connected[id]);
                }
            }
        }
        return res;
    }







});



