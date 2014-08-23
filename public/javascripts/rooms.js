$(function () {
    // GUIの状態を表す変数
    var INIT = 0,
        GRAB_HOT  = 1, // (暑)アイコンを持っている
        GRAB_COLD = 2, // (寒)アイコンを持っている
        PUT_HOT   = 3, // (暑)アイコンを置いている
        PUT_COLD  = 4; // (寒)アイコンを置いている
    var guiState  = INIT;

    // 画面上のエレメント
    var $hotIcon  = $('#hot'),
        $coldIcon = $('#cold'),
        $main     = $('#main'),
        $shot     = $('#shot'),
        $scold    = $('#scold'),
        iconImg   = { hot: $shot, cold: $scold };

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
                var pos = {top: i.y, left: i.x};
                // 自分だった場合自分のアイコンを置く
                if (i.uid == uid) {
                    var myIcon, state;
                    if (i.icon == 'hot') {
                        myIcon = $hotIcon;
                        state = PUT_HOT;
                    } else {
                        myIcon = $coldIcon;
                        state = PUT_COLD;
                    }
                    myIcon.css(adjustIconCenter(pos));
                    guiState = state;
                } else {
                    var img = iconImg[i.icon].clone(true).removeClass('proto').attr('id', i.uid);
                    $main.append(img);
                    img.css(adjustSmallIconCenter(pos));
                }
            }
        });
    });
    // アイコンの中央に位置をずらす
    var sicon_width = $shot.width();
    var sicon_height = $shot.height();
    function adjustSmallIconCenter(pos) {
        return {top: pos.top - sicon_height / 2, left: pos.left - sicon_width / 2};
    }

    /**
     *  画面上のイベント処理
     *  TODO: ボックスに戻したときの処理を実装する
     *  TODO: ColdIconの処理を追加する
     *  TODO: 関係ない場所に置けないようにする
     */
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
        if (guiState == GRAB_HOT) {
            $hotIcon.css(adjustIconCenter(getPos(ev.pageX, ev.pageY)));
        }
    });

    $hotIcon.on('click', function (ev) {
        if (guiState == INIT) {
            guiState = GRAB_HOT;
        } else if (guiState == GRAB_HOT) {
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
            guiState = PUT_HOT;
        } else if (guiState == PUT_HOT) {
            // アイコンを拾った
            socket.emit('remove icon', {
                uid: uid,
                roomId: roomId
            });
            guiState = GRAB_HOT;
        }
    });
});
