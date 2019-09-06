require('@tensorflow/tfjs-node');

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require('body-parser');

var indexRouter = require('./routes/index');

var app = express();
app.set('views', './views') // specify the views directory
app.set('view engine', 'ejs') // register the template engine

app.use(logger('dev'));
app.use(bodyParser({ limit: '50mb' }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

module.exports = app;
