var pmongo = require('promised-mongo');
var db = pmongo('setsudenkun', ['rooms', 'icons', 'counters']);

module.exports = db;
