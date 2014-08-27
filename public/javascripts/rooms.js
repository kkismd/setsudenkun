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
        $box      = $('#box'),
        $floor    = $('#floor'),
        $shot     = $('#shot'),
        $scold    = $('#scold'),
        iconImg   = { hot: $shot, cold: $scold };

    // アイコンの初期配置
    var offset = $main.offset(),
        hotIconOrigin  = $hotIcon.position(),
        coldIconOrigin = $coldIcon.position();

    // マウスの相対座標を求める
    function getPos(pageX, pageY) {
        var x = pageX - offset.left;
        var y = pageY - offset.top;
        return {top: y, left: x};
    }

    // Socket.IO がサーバーに接続した時の初期化
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
     *  TODO: 置けないときにマウスポインタを(/)にする
     */
    // アイコンの中心に位置をずらす
    function adjustIconCenter(pos) {
        return {top: pos.top - 35, left: pos.left - 35};
    }

    // アイコンをマウスに追従させる
    $(document).on('mousemove.move', function (ev) {
        var icon;
        if (guiState == GRAB_HOT) {
            icon = $hotIcon;
        }
        else if (guiState == GRAB_COLD) {
            icon = $coldIcon;
        }
        if (icon) icon.css(adjustIconCenter(getPos(ev.pageX, ev.pageY)));
    });

    // アイコン上でボタンが押された場合の処理
    $hotIcon.on('click', iconOnClick);
    $coldIcon.on('click', iconOnClick);

    // アイコンに関するイベント処理
    function iconOnClick(ev) {
        console.log('mouse click: (pageX:'+ev.pageX+', pageY:'+ev.pageY+')');
        // 対象アイコンによる場合分け
        var grabState, putState, iconId;
        if (ev.target.id == 'hot') {
            grabState = GRAB_HOT;
            putState = PUT_HOT;
        }
        else if (ev.target.id = 'cold') {
            grabState = GRAB_COLD;
            putState = PUT_COLD;
        }
        else {
            return;
        }
        iconId = ev.target.id;

        // クリックされた場合の状態ごとの処理
        // 初期状態の場合
        if (guiState == INIT) {
            guiState = grabState;
        }
        // アイコンを持っていた場合
        else if (guiState == grabState) {
            var mousePos = getPos(ev.pageX, ev.pageY);
            // クリックした場所が間取り図の上なら
            if (isMouseOnElem($floor, mousePos.left, mousePos.top)) {
                console.log('on floor...');
                // アイコンをフロアに置くという処理
                var record = {
                    uid: uid,
                    roomId: roomId,
                    icon: iconId,
                    x: mousePos.left,
                    y: mousePos.top
                };
                console.log('set icon (x = ' + mousePos.left + ', y = ' + mousePos.top + ')');
                socket.emit('set icon', record);
                guiState = putState;
            }
            else if (isMouseOnElem($box, mousePos.left, mousePos.top)) {
                // アイコンをボックスに戻すという処理
                if (isLeftSideOnBox(mousePos.left, mousePos.top) && iconId == 'hot') {
                    $hotIcon.css(hotIconOrigin);
                }
                else if (isRightSideOnBox(mousePos.left, mousePos.top) && iconId == 'cold') {
                    $coldIcon.css(coldIconOrigin);
                }
                socket.emit('unset icon', {uid: uid, roomId: roomId});
                guiState = INIT;
            }
        }
        // アイコンを置いていた場合
        else if (guiState == putState) {
            // アイコンを拾ったことを送信
            socket.emit('remove icon', {
                uid: uid,
                roomId: roomId
            });
            guiState = grabState;
        }
    }

    // マウスの位置がエレメントにかかっているか？
    function isMouseOnElem($elem, pageX, pageY) {
        var pos = $elem.position();
        return rectangleContains(pos.top, pos.left, $elem.width(), $elem.height(), pageX, pageY);
    }

    // マウスの位置がボックスの左側か？
    function isLeftSideOnBox(pageX, pageY) {
        // ボックスにかかっていなければ偽
        if (! isMouseOnElem($box, pageX, pageY)) {
            return false
        }
        var pos = $box.position();
        return rectangleContains(pos.top, pos.left, $box.width()/2, $box.height(), pageX, pageY);
    }

    // マウスの位置がボックスの右側か？
    function isRightSideOnBox(pageX, pageY) {
        // ボックスにかかっていなければ偽
        if (! isMouseOnElem($box, pageX, pageY)) {
            return false
        }
        var pos = $box.position();
        var width = $box.width / 2,
            left = pos.left + width;
        return rectangleContains(pos.top, left, width, $box.height, pageX, pageY);
    }

    // 点(x,y)が矩形(top,left,width,height)の上にあるかどうかを判定
    function rectangleContains(top, left, width, height, x, y) {
        console.log('rectangleContains(top:'+top+', left:'+left+', width:'+width+', height:'+height+', x:'+x+', y:'+y+')');
        if (top > y || left > x ||
            top + height < y || left + width < x ) {

            console.log('.... -> false!');
            return false;
        }

        console.log('.... -> true!');
        // 内側にある
        return true
    }

    // position {top, left} 同士の引き算
    function subPosition(posA, posB) {
        return {
            top: posA.top + posB.top,
            left: posA.left + posB.left
        };
    }
});
