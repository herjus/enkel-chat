var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
users = [];
connections = [];

server.listen(process.env.PORT || 3000);
console.log('Server ruinning ...');

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
	connections.push(socket);
	console.log('Connected: %s sockets connected', connections.length);

	socket.on('disconnect', function(data){
		if(socket.username){
			io.sockets.emit('new message', {msg: '*' + socket.username + ' has left the chat.'});
			users.splice(users.indexOf(socket.username, 1))
			updateUsernames();
		}
		connections.splice(connections.indexOf(socket), 1);
		console.log('Disconnected: %s sockets connected', connections.length);
	});

	socket.on('send message', function(data){
		console.log(data);
		io.sockets.emit('new message', {msg: data, user: socket.username});
	});

	socket.on('new user', function(data, callback){
		io.sockets.emit('new message', {msg: '*' + data + ' has joined the chat.'});
		console.log(data);
		callback(false);
		socket.username = data;
		users.push(socket.username);
		updateUsernames();
	});
	
	function updateUsernames(){
		io.sockets.emit('get users', users);
	}
});