const express = require('express');
const helmet = require('helmet');
var app = express();
app.use(helmet());
var server = require('http').Server(app);
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
		var safeData = escapeHtml(data);
		console.log(safeData);
		io.sockets.emit('new message', {msg: safeData, user: socket.username});
	});

	socket.on('new user', function(data, callback){
		var safeData = escapeHtml(data);
		io.sockets.emit('new message', {msg: '*' + safeData + ' has joined the chat.'});
		console.log(safeData);
		callback(true);
		socket.username = safeData;
		users.push(socket.username);
		updateUsernames();
	});
	
	function updateUsernames(){
		io.sockets.emit('get users', users);
	}

	var entityMap = {
	  '&': '&amp;',
	  '<': '&lt;',
	  '>': '&gt;',
	  '"': '&quot;',
	  "'": '&#39;',
	  '/': '&#x2F;',
	  '`': '&#x60;',
	  '=': '&#x3D;'
	};

	function escapeHtml (string) {
	  return String(string).replace(/[&<>"'`=\/]/g, function (s) {
	    return entityMap[s];
	  });
	}
});