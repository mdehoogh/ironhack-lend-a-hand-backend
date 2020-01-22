var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var cors=require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// example
//var users=require('../data/users.json');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors()); // enable all CORS requests!!!!

app.use('/', indexRouter);

app.use('/users', usersRouter);

module.exports = app;
