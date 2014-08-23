$(function () {
    var $main = $('#main');
    var $shot = $('#shot');
    var $scold = $('#scold');
    var iconImg = { hot: $shot, cold: $scold };
    var uid, roomId, members;
    var socket = io();
    socket.on('hello', function (data) {
        uid = data.uid;
        roomId = data.roomId;
        members = data.members;
        console.log("uid: " + uid + ", roomId: " + roomId + ", members: " + members);
        // 他ユーザーのアイコンを配置
        members.forEach(function (i) {
            console.log('x: ' + i.x + ' y:' + i.y);
            if (i.uid && i.x && i.y && i.icon) {
                var img = iconImg[i.icon].clone(true).removeClass('proto').attr('id', i.uid);
                $main.append(img);
                var pos = {top: i.y, left: i.x}
                img.css(adjustSmallIconCenter(pos));
            }
        });
    });
    // アイコンの中央に位置をずらす
    var sicon_width = $shot.width();
    var sicon_height = $shot.height();
    function adjustSmallIconCenter(pos) {
        return {top: pos.top - sicon_height / 2, left: pos.left - sicon_width / 2};
    }

    // GUIの状態を表す変数
    var INIT = 0,
        GRAB = 1,
        PUT = 2;
    var guiState = INIT;

    var $hotIcon = $('#hot');
    var offset = $main.offset();

    // マウスの座標を求める
    function getPos(pageX, pageY) {
        var x = pageX - offset.left;
        var y = pageY - offset.top;
        return {top: y, left: x};
    }
    // アイコンの中心に位置をずらす
    function adjustIconCenter(pos) {
        return {top: pos.top - 35, left: pos.left - 35};
    }

    // アイコンをマウスに追従させる
    $(document).on('mousemove.move', function (ev) {
        if (guiState == GRAB) {
            $hotIcon.css(adjustIconCenter(getPos(ev.pageX, ev.pageY)));
        }
    });

    $hotIcon.on('click', function (ev) {
        if (guiState == INIT) {
            guiState = GRAB;
        } else if (guiState == GRAB) {
            // アイコンを置いた
            var pos = getPos(ev.pageX, ev.pageY);
            var record = {
                uid: uid,
                roomId: roomId,
                icon: 'hot',
                x: pos.left,
                y: pos.top
            };
            console.log('set icon (x = ' + pos.left + ', y = ' + pos.top + ')');
            socket.emit('set icon', record);
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