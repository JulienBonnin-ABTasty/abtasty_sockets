var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


function getSocketsInSameRoomAs(socket) {
	var roomName = socket.informations.roomName,
		clients_in_the_room = io.sockets.adapter.rooms[roomName],
		result = [];
	for (var clientId in clients_in_the_room ) {
	  var client_socket = io.sockets.connected[clientId];//Do whatever you want with this
	  result.push(client_socket.informations);
	}
	return result;
}

io.on('connection', function(socket){

	socket.informations = {};

	console.log('SOCKET CONNECTION');

	socket.on('disconnect', function(){

		console.log('SOCKET DISCONNECTED');

		io.to(socket.informations.roomName).emit('getSocketsInRoom', getSocketsInSameRoomAs(socket));
	});

	socket.on('join_room', function(datas){

		console.log('  ===> SOCKET JOIN ROOM : ', datas.roomName);
		socket.join(datas.roomName);

		socket.informations.DCInfos = datas.infos;
		socket.informations.roomName = datas.roomName; // store custom room on the socket object

		io.to(socket.informations.roomName).emit('getSocketsInRoom', getSocketsInSameRoomAs(socket));
	});

	setInterval(function() {
		io.to(socket.informations.roomName).emit('getSocketsInRoom', getSocketsInSameRoomAs(socket));
	}, 10000);


});


http.listen(3000, function(){
  console.log('listening on *:3000');
});