var socketio = require('socket.io');
var count = 0;
var userIds = {};
var ackUserIds = {};

exports.listen = function(server) {
	io = socketio.listen(server);
	io.set('log level', 1);
	
	setInterval(syn, 5000);
	function syn() {
		console.log('syn');
		io.sockets.emit('syn', {
			'userIds' : userIds
		});
	}


	io.sockets.on('connection', function(socket) {

		var uid = 'Wealth' + (++count);
		userIds[uid] = true;
		socket.emit('id', {
			'id' : uid
		});

		socket.on('msg', onMsg);
		socket.on('changeId', onChangeId);
		socket.on('ack', onAck);

		function onMsg(data) {
			io.sockets.emit('pushMsg', data);
		}

		function onChangeId(data) {
			console.log('changeId request: ' + data.newId);
			if (userIds[data.newId]) {
				console.log('change id failed for id: ' + data.newId);
				socket.emit('changeIdResult', {
					'success' : false
				});
				return;
			}
			userIds[data.newId] = true;
			userIds[data.oldId] = false;
			var emitData = {
				'success' : true,
				'oldId' : data.oldId,
				'newId' : data.newId
			};
			socket.emit('changeIdResult', emitData);
			io.sockets.emit('idChanged', emitData);
			console.log('change id from: ' + data.oldId + ' --> to: ' + data.newId);
		}

		function onAck(data) {
			console.log('ack : ' + data.id);
			ackUserIds[data.id];
		}

	});
};
