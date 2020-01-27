require('dotenv').config();

var path = require('path');

var express = require('express');

var mongoose = require('mongoose');

var cookieParser = require('cookie-parser');

var bodyParser = require('body-parser');

var logger = require('morgan');

var cors=require('cors'); // get in cors


var indexRouter = require('./routes/index.js');
var usersRouter = require('./routes/users.js');

var authRouter = require('./routes/auth.js');

// MDH@27JAN2020: for maintaining user sessions
var session=require('express-session');

// example
//var users=require('../data/users.json');

var app = express();
app.use(cors({
    origin: "http://localhost:5000",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE"
})); // enable all CORS requests!!!!

app.use(logger('dev'));
app.use(express.json());

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname,'public')));


// MDH@27JAN2020: we'll be needing the body parser!
// app.use(bodyParser());

// install session middleware
app.use(session({
    'secret':'cat whatever'
}));

app.use('/', indexRouter);

app.use('/users', usersRouter);

// MDH@27JAN2020: cutting off /users before auth (otherwise a little overkill???)
app.use('/auth',authRouter);

// connect to the MongoDB database for this application (see .env for the connection string used)
mongoose.connect(process.env.MONGODB_CONNECTION_URL, {useNewUrlParser: true})
.then(()=>{
    console.log("Connected to the MongoDB database at "+process.env.MONGODB_CONNECTION_URL+".");
})
.catch((error) => {
    console.log("ERROR: Failed to connect to the MongoDB database at "+process.env.MONGODB_CONNECTION_URL+".");
    console.log("\t",error);
});

module.exports = app;
