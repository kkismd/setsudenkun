$(function () {
    var socket, uid, roomId;
    $('#btn').on('click', function (ev) {
        socket.emit('set icon',
            {uid: uid,
                roomId: roomId,
                x: ev.clientX,
                y: ev.clientY
            });
    });

    socket.on('hello', function (data) {
        uid = data.uid;
        roomId = data.roomId;
        console.log("uid: " + uid + ", roomId: " + roomId);
    });

    socket.on('members', function (data) {
        uid = data.uid;
        roomId = data.roomId;
        console.log('uid: ' + data.uid);
        console.log('members: ' + data.gTmembers);
    });
});