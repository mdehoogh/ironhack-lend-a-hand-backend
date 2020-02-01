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

// MDH@01FEB2020: e-mail service
/* NOT MEANT TO BE SENT FROM THE SERVER APPARENTLY
var emailjs=require('emailjs-com');

var templateParams = {
    to: 'm.p.a.j.dehoogh@tudelft.nl',
    from: 'info@lend-a-hand.nl',
    'receiver': "Marc",
    'reply-to':'info@marcdehoogh.nl',
    subject: 'Server start',
    'message-text': 'The server started up at '+(new Date()).toLocaleString()+"."
};

emailjs.send('default_service', 'lend_a_hand_nl', templateParams,process.env.EMAILJS_USER_ID)
    .then(function(response) {
       console.log('SUCCESS!', response.status, response.text);
    }, function(error) {
       console.log('FAILED...', error);
    });
*/

const sgMail=require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

(function testSendMail(){
    console.log("Sendgrid API key: '"+process.env.SENDGRID_API_KEY+"'.");
    sgMail.send({
        to:'info@marcdehoogh.nl',
        from:'m.p.a.j.dehoogh@tudelft.nl',
        subject:'Lend-a-hand.nl server report',
        text:'Hi Marc,\n\nThe Lend-a-hand.nl server has started at '+(new Date()).toLocaleString()+'.\n\nWith kind regards,\nLend-a-hand.nl Customer Support Team.',
    })
    .then((response)=>{
        console.log("Send test mail sent.",response);
    })
    .catch((err)=>{
        console.error("Send test mail response error",err);
    });
})();

// example
//var users=require('../data/users.json');

var app = express();
app.use(cors({
    origin: ["http://localhost:3000", "localhost:3000"],
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
app.use(session({secret:'cat keyboard',cookie:{secure: false}}));

/* I don't think we need these routes
app.use('/', indexRouter);

app.use('/users', usersRouter);
*/

// MDH@27JAN2020: 'unprotected' route to authentication functions like signup, login, and logout
// TODO well we might put logout elsewhere though...
app.use('/auth',authRouter);

// MDH: all subsequent routes are to be protected by protect
function protect(req,res,next){
    debugger
    console.log("Protecting!");
    if(!req.session)return next(new Error("No current session"));
    console.log("Session: ",req.session);
    // call next with an error if no current user set by a log in
    if(!req.session.currentUser)return next(new Error("No current user"));
    next();
}

// once a user is logged in they can request:
const Profile=require('./models/Profile.js');

// their profile
app.get('/profile',protect,(req,res,next)=>{
    Profile.findById(req.session.currentUser._id)
        .populate({path:'owned_groups',select:'name'})
        .populate({path:'interests',select:'name'})
        .next((profile)=>{
            res.json(profile);
        })
        .catch((err)=>{
            res.status(400).json({error:err.message});
        });
});

app.get('/groups',protect,(req,res,next)=>{

});

// their requests
app.get('/requests',protect,(req,res,next)=>{

});

const Location=require('./models/Location');
// store locations
app.post('/location',protect,(req,res,next)=>{
    debugger
    // the body should contain all we need
    // but the ids of the groups as well that are permitted to view this location
    // we might store these with the location instead of the recent location??????
    // NO location is for the end-user itself and can be used freely whereas recent locations are restrictable!!!!
    let location={
        user_id:req.session.currentUser._id,
        latitude:req.body.latitude,
        longitude:req.body.longitude,
        altitude:req.body.altitude,
        accuracy:req.body.accuracy,
        timestamp:req.body.timestamp,
        visibility:req.body.visibility,
    };
    Location.create(location)
        .then((location)=>{
            console.log("User location stored!");
            return location._id;
        })
        .then((location_id)=>{
            res.status(204).send();
        })
        .catch((err)=>{
            res.status(400).json({error:err.message});
        });
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

const Session=require('./models/Session.js');

// connect to the MongoDB database for this application (see .env for the connection string used)
mongoose.connect(process.env.MONGODB_CONNECTION_URL, {useNewUrlParser:true,useUnifiedTopology:true})
.then((response)=>{
    if(!response||response.error)
        return console.log(!response?"Unknown error connecting to the Lend-a-hand-nl database.":"Lend-a-hand-nl database connect error: "+JSON.stringify(response.error)+".");
    console.log("Connected to the MongoDB database at "+process.env.MONGODB_CONNECTION_URL+".");
    // write all currently active users
    Session.find({active:true})
        .populate('user_id')
        .then((activemembers)=>{
             if(activemembers&&activemembers.length>0){
                console.log("Active members:");
                activemembers.forEach((activemember)=>{
                    console.log("Active member: ",activemember);
                });
            }else
                console.log("No active members!");
        })
        .catch((err)=>{
            console.log("Getting the active members error",err);
        });
})
.catch((error) => {
    console.log("ERROR: Failed to connect to the MongoDB database at "+process.env.MONGODB_CONNECTION_URL+".");
    console.log("\t",error);
});

module.exports = app;
