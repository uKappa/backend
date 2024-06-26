// Set up mongoose connection
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
//const mongoDB = "mongodb+srv://PSI8:KRUnOpEfrS68g5Sa@cluster0.m1vhung.mongodb.net/local_library?retryWrites=true&w=majority&appName=Cluster0";
const mongoDB = "mongodb://psi008:psi008@localhost:27017/psi008?retryWrites=true&authSource=psi008";


main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}


var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const catalogRouter = require("./routes/catalog");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use("/catalog", catalogRouter);

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
