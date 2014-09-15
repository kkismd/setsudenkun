var util = require('util'),
    q = require('q');
var express = require('express'),
    router = express.Router(),
    db = require('../db');

// 管理画面トップ
router.get('/', function (req, res) {
    res.send('hello world.');
});

var endWithSlash = new RegExp('/$');

// 間取り図一覧
router.get('/rooms', function (req, res) {
    // パスが / で終わってたら戻す
    if (endWithSlash.test(req.path)) {
        res.redirect('../rooms');
    }
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
    console.log(req.body.room);
    var roomId = parseInt(req.body.room.roomId);
    db.rooms.findOne({roomId: roomId}).then(function (room) {
        room.name = req.body.room.name;
        room.url  = req.body.room.url;
        return db.rooms.save(room);
    }).then(function (room) {
        console.log("room data is saved.");
        res.redirect("..");
    }, function (err) {
        console.log("process failed.");
        console.log(err);
        res.send(err);
    });
});

// 新規
router.get('/rooms/new', function (req, res) {
    var room = { roomId: '', name: '', url: '' };
    res.render('admin/edit', {room: room});
});

router.post('/rooms/new', function (req, res) {
    console.log(req.body.room);
    getNextSequence('rooms').then(function (result) {
        console.log('return from getNextSequence.');
        console.log('result = ');
        console.log(result);
        if (! result[0] ) {
            // error case
            var deferred = q.defer();
            deferred.reject('getNextSequence: failed.');
            return deferred.promise;
        }
        var roomId = result[0].seq;
        var room = {
                roomId: roomId,
                name: req.body.room.name,
                url: req.body.room.url
            };
        return db.rooms.save(room);
    }).then(function (result) {
        console.log('room data is saved.');
        console.log('result = ');
        console.log(result);
        res.redirect('../rooms');
    }, function (err) {
        console.log('failed.');
        console.log(err);
        res.send(err);
    });
});

// 削除
router.post('/rooms/del', function (req, res) {
    var roomId = parseInt(req.body.roomId);
    console.log('roomId = ' + roomId);
    db.rooms.remove({roomId: roomId}, {justOne: true}).then(function (result) {
        console.log('remove() result =');
        console.log(result);
        console.log('room removed: roomId = %d', roomId);
        res.redirect('../rooms');
    }, function (err) {
        console.log('remove() failed.');
        console.log(err);
        res.send(err);
    });
});

// 連番の取得
function getNextSequence(name) {
    return db.counters.findAndModify({
        query: {_id: name},
        update: { $inc: {seq: 1}},
        new: true
    });
}


module.exports = router;