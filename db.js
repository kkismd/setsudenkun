var pmongo = require('promised-mongo');
var db = pmongo('setsudenkun', ['rooms', 'icons']);

module.exports = db;
