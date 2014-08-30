var express = require('express'),
    router = express.Router(),
    db = require('../db'),
    idPattern = /^[1-9][0-9]*$/;

// フロアリスト
router.get('/', function(req, res) {
    db.rooms.find().toArray().then(function (rooms) {
        res.render('room_list', {rooms: rooms});
    }, function (err) {
        console.log('db.rooms.find.toArray: failed.');
        console.log(err);
    });
});

// フロア画面
router.get('/:id', function(req, res) {
    // パラメータは数字のみ
    if (!idPattern.test(req.params.id)) {
        notFound(res);
        return;
    }
    var id = parseInt(req.params.id);

    if (req.session) {
        req.session.roomId = id;
    }
    console.log('rooms access 2');
    db.rooms.findOne({roomId: id}).then(function(room){
        // 内容がおかしければ表示しない
        if (!(room && room.roomId && room.name && room.url)) { return notFound(res); }
        console.log("found!: room = " + room);
        res.render('rooms', room);
    }, function (err) {
        console.log('find() error...');
        console.log(err);
        notFound(res);
    });
});

function notFound(res) {
    res.status(404).send('部屋が見つかりません。');
}

module.exports = router;
