var socketio = require('socket.io');
var count = 0;
var userIds = {};

exports.listen = function(server) {
	io = socketio.listen(server);
	io.set('log level', 1);

	setInterval(syn, 5000);
	function syn() {
		var data = {
			'userIds' : userIds
		};
		io.sockets.emit('syn', data);
		userIds = {};
	}

	function timeStamp() {
		var now = new Date();
		var HH = now.getHours();
		var mm = now.getMinutes();
		var ss = now.getSeconds();
		var time = HH + ':' + mm + ':' + ss;
		return time;
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
			data['timestamp'] = timeStamp();
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
			userIds[data.id] = true;
		}

	});
};
