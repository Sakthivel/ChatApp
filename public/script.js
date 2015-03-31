$(function() {
    // create global app parameters...
    var NICK_MAX_LENGTH = 15,
        ROOM_MAX_LENGTH = 10,
        socket = null,
        clientId = null,
        nickname = null,
        email = null,
        currentRoom = null;




    //dom events
    function bindDOMEvents(){
        $('.discussion').slimScroll({
            height: '370px'
        });


        $('#loginEnterBtn').on('click', function(){
            handleLogin();
        });

        //message sent button event
        $('#sendMsgBtn').on('click',function(){
            var msg = $("#inputMessageTxt").val();
            if (msg !== "") {
                socket.emit("send", msg , nickname);
                $("#inputMessageTxt").val("");
            }
        });
    }






    function connect(){
        // show connecting message
        $('#connectingIndicator').html('Connecting...');

        // creating the connection and saving the socket
        socket = io.connect();

        // now that we have the socket we can bind events to it
        bindSocketEvents();
    }

    function handleLogin(){
        nickname=$('#username').val();
        email=$('#useremail').val();
        var device = "desktop";
        if (navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i)) {
            device = "mobile";
        }
        connect();
        socket.emit('joinserver', { name: nickname, email:email ,device:device });

    }



    //socket events
    function bindSocketEvents(){
        // when the connection is made, the server emiting
        // the 'connect' event
        socket.on('connect', function(){
            // firing back the connect event to the server
            // and sending the nickname for the connected client
            $('#connectingIndicator').html('');

            $('.discussion').append('<li class="messages-date">'+moment().format("LLLL")+'</li>');
        });


        socket.on("update", function(msg) {
            $("#msgs").append("<li>" + msg + "</li>");
        });

        socket.on("avatar",function(avatar){
           $('#profilePic').attr('src',avatar);
        });

        socket.on("update-people", function(data) {
            $(".chat-list-side").empty();
            $('#peopleCount').text(data.count);
            $.each(data.people, function(a, obj) {
                $(".chat-list-side").append('<li><a><span class="thumb-small"><img src='+obj.avatar+' class="circle" /><i class="online dot"></i></span><div class="inline"><span class="name">'+obj.name+'</span><small class="text-muted">'+obj.device+'</small></div></a></li> ')

            });

        });

        socket.on("chat", function(person, msg , avatar , time) {
           console.log(person.name+'-----'+msg);
            if(nickname == person.name ){
                var per ="self";
            }else{
                var per ="other";
            }
            $('.discussion').append('<li class='+per+'><div class="message"><div class="message-name">'+person.name+'<span class="time">'+time+'</span></div><div class="message-text">'+msg+'</div><div class="message-avatar"><img src='+avatar+' /></div> </div> </li>');
        });



        socket.on("exists", function(data) {

            if(data.status==false) {
                   $('#errorMsg').removeClass('hide');
                   $('#errorMsg').text(data.msg)
            }else{
                $('.loginContainer').hide();
                $('.chatContainer').show();
            }

        });

    }


    // on document ready, bind the DOM elements to events
    $(function(){
        bindDOMEvents();
    });

});