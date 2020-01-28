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
// MDH@28JAN2020: not certain why I would need cookie though
app.use(session({'secret':'cat keyboard',cookie:{}}));

/* I don't think we need these routes
app.use('/', indexRouter);

app.use('/users', usersRouter);
*/

// MDH@27JAN2020: 'unprotected' route to authentication functions like signup, login, and logout
// TODO well we might put logout elsewhere though...
app.use('/auth',authRouter);

// MDH: all subsequent routes are to be protected by protect
function protect(req,res,next){
    console.log("Protecting!");
    // call next with an error if no current user set by a log in
    if(!req.session.currentUser)next(new Error("Log in first!"));else next();
}

// once a user is logged in they can request:
// their profile
app.get('/profile',protect,(req,res,next)=>{

});
// their requests
app.get('/requests',protect,(req,res,next)=>{

});
// requests they offered to honor
// unhonoured requests


// fall-through routes and error handling in express (see expressjs.com)
// fall-through
app.use((req,res,next)=>{
    res.status(404).json({error:"Invalid route",path:req.path});
});

// error handling
app.use((err,req,res,next)=>{
    console.error(err.stack);
    res.status(500).send({error:err,path:req.path});
});

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
