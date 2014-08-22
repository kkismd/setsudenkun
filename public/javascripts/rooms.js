$(function () {
    var uid, roomId;
    var socket = io();
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
    (function () {
        var $main = $('#main');
        var $shot = $('#shot');
        var $scold = $('#scold');
        var n1 = $shot.clone(true).removeClass('proto');
        $main.append(n1);
        n1.css({ top: 237, left: 222 });

        var n2 = $shot.clone(true).removeClass('proto');
        $main.append(n2);
        n2.css({ top: 371, left: 481 });

        var n3 = $shot.clone(true).removeClass('proto');
        $main.append(n3);
        n3.css({ top: 316, left: 169 });

        var n4 = $scold.clone(true).removeClass('proto');
        $main.append(n4);
        n4.css({ top: 560, left: 201 });
    })();

    // GUIの状態を表す変数
    var INIT = 0,
        GRAB = 1,
        PUT = 2;
    var guiState = INIT;

    var $hotIcon = $('#hot');
    var $main = $('#main');
    var offset = $main.offset();
    function getPos(pageX, pageY) {
        var x = pageX - offset.left - 35 + 100;
        var y = pageY - offset.top - 35;
        return {top: y, left: x};
    }

    $(document).on('mousemove.move', function (ev) {
        if (guiState == GRAB) {
            $hotIcon.css(getPos(ev.pageX, ev.pageY));
        }
    });

    $hotIcon.on('click', function (ev) {
        if (guiState == INIT) {
            guiState = GRAB;
        } else if (guiState == GRAB) {
            // アイコンを置いた
            var pos = getPos(ev.pageX, ev.pageY);
            socket.emit('set icon', {
                uid: uid,
                roomId: roomId,
                x: pos.left,
                y: pos.top
            });
            guiState = PUT;
        } else if (guiState == PUT) {
            // アイコンを拾った
            socket.emit('remove icon', {
                uid: uid,
                roomId: roomId
            });
            guiState = GRAB;
        }
    });
});