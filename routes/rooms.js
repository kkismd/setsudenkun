var express = require('express');
var router = express.Router();

router.get('/:id', function(req, res) {
    var id = req.params.id;
    console.log(req.session);
    if (req.session) {
        req.session.roomId = id;
        console.log( req.session);
    }
    res.render('rooms', { id: id, url: "/images/floor1.png" });
});

module.exports = router;
