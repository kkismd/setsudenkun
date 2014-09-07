var express = require('express'),
    router = express.Router(),
    db = require('../db');

// 管理画面トップ
router.get('/', function (req, res) {
    res.send('hello world.');
});

// 間取り図一覧
router.get('/rooms', function (req, res) {
    db.rooms.find().toArray().then(function (rooms) {
        res.render('admin/rooms', {rooms: rooms});
    }, function (err) {
        console.log('db.rooms.find.toArray: failed.');
        console.log(err);
        res.send('err');
    });
});

// 編集
router.get('/rooms/edit/:id', function (req, res) {
    var roomId = parseInt(req.params.id);
    db.rooms.findOne({roomId: roomId}).then(function (room) {
        console.log(room);
        res.render('admin/edit', {room: room})
    }, function (err) {
        console.log('db.rooms.findOne(): failed.');
        console.log(err);
        res.send('err');
    });
});

// 保存
router.post('/rooms/edit/:id', function (req, res) {
    var room = {
        __id: parseInt(req.params.roomId),
        roomId: parseInt(req.params.roomId),
        name: res.params.name,
        url: res.params.url
    };
    db.rooms.save(room).then(function () {

    });
});

// 削除
router.post('/rooms/delete/:id', function (req, res) {

});

module.exports = router;