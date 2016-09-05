var fs = require('fs');
var path = require('path');
var env = process.env.NODE_ENV || 'development';
var config = require(path.join(__dirname, '..', 'config', 'config.json'))[env];
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var db = {};

mongoose.connect(config.mongoose);
db.connection = mongoose.connection;
db.connection.on('error', console.error.bind(console, 'connection error:'));
db.connection.once('open', function () {
  console.log('connected to database');
});

fs.readdirSync(__dirname).filter(function (file) {
  return (file.indexOf('.') !== 0) && (file !== 'index.js');
}).forEach(function (file) {
  var schema = require('./' + file);
  var name = file.replace(/\.js$/, '');
  db[name] = db.connection.model(name, schema);
});

module.exports = db;
