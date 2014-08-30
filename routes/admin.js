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

// 詳細画面
router.get('/rooms/:id', function (req, res) {

});

// 新規作成画面
router.get('/rooms/new', function (req, res) {

});

// 新規保存
router.post('/rooms/new', function (req, res) {

});

// 編集
router.get('/rooms/edit/:id', function (req, res) {

});

// 保存
router.post('/rooms/edit/:id', function (req, res) {

});

// 削除
router.post('/rooms/delete/:id', function (req, res) {

});

module.exports = router;