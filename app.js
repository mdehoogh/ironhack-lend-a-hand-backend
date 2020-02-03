// MDH@02FEB2020: this is the Chat app app.js that we need to merge somehow with app_original.js

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var indexRouter = require("./routes/index");
var chatRoomRouter = require("./routes/chatRoom");
var app = express();
const cors = require("cors");
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use("/", indexRouter);
app.use("/chatroom", chatRoomRouter);

// MDH@02FEB2020: here we insert the non-chatroom specific backend stuff from app_original.js
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

// MDH@27JAN2020: we'll be needing the body parser!
// app.use(bodyParser());
var mongoose = require('mongoose');

var authRouter = require('./routes/auth.js');

// MDH@27JAN2020: for maintaining user sessions
var session=require('express-session');

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
const Profile=require('./dbmodels/Profile');

// their profile
app.get('/profile',protect,(req,res,next)=>{
    Profile.findById(req.session.currentUser._id)
        .populate({path:'membergroup_ids',select:'name'})
        .populate({path:'activitygroup_ids',select:'name'})
        .then((profile)=>{
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

const Location=require('./dbmodels/Location');
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
    };
    Location.create(location)
        .then((location)=>{
            console.log("User location stored!");
            // perhaps we should now get the ids of the member groups this user owns or activity groups this person is in??????
            return RecentLocation.create({location_id:location._id,user_id:location.user_id});
        })
        .then((recentLocation)=>{
            res.status(204).json({_id:recentLocation.location_id});
        })
        .catch((err)=>{
            res.status(400).json({error:err.message});
        });
});

//  recent locations
const RecentLocation=require('./dbmodels/RecentLocation');
// store
app.post('/recentlocation',protect,(req,res,next)=>{
    if(!req.body.hasOwnProperty('location_id'))return next(new Error("Missing location id."));
    let recentlocation={
        user_id:req.session.currentUser._id,
        location_id:req.body.location_id,
    }
    if(req.body.hasOwnProperty("member_ids"))recentlocation.member_ids=req.body.member_ids;
    if(req.body.hasOwnProperty("membergroup_ids"))recentlocation.membergroup_ids=req.body.membergroup_ids;
    if(req.body.hasOwnProperty("activitygroup_ids"))recentlocation.activitygroup_ids=req.body.activitygroup_ids;
    RecentLocation.create(recentlocation)
        .then((location_id)=>{
            res.status(204).send();
        })
        .catch((err)=>{
            res.status(400).json({error:err.message});
        });
});
// retrieve
app.get('/recentlocation',protect,(req,res,next)=>{
    // user wants to retrieve all recent known locations
    // get all records of other users
    RecentLocation.find({'user_id':{$ne:req.session.currentUser._id}},{'created_at':1})
        .populate('location_id')
        .then((recentLocations)=>{
            console.log("Processing "+recentlocations.length+" recent locations.");
            let distinctUserRecentLocations={};
            recentlocations.forEach((recentLocation)=>{
                distinctUserRecentLocations={longitude:recentLocation.location_id.longitude,latitude:recentLocation.location_id.lattitude};
                if(recentLocation.location_id.altitude)distinctUserRecentLocation.altitude=recentLocation.location_id.altitude;
                recentlocationdata[recentLocation.user_id]=distinctUserRecentLocations;
            });
            res.json(recentlocationdata);
        })
        .catch(err=>res.status(400).json({error:err.message}));
});
// MDH@02FEB2020: END of specific backend stuff

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
// render the error page
  res.status(err.status || 500);
  res.render("error");
});

// MDH@02FEB2020: stuff from app_original.js that we use to connect to the backend database
const Session=require('./dbmodels/Session');

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
// MDH@02FEB2020: END of stuff from app_original.js that we use to connect to the backend database

module.exports = app;