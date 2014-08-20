var express = require('express');
var router = express.Router();

router.get('/:id', function(req, res) {
    var c = req.session.counter = (req.session.counter || 0) + 1;
    var id = req.params.id;
    req.session.roomId = id;
    console.log( req.session);
    res.render('rooms', { id: id, counter: c });
});

module.exports = router;
