var express=require('express');
var router=express.Router();

var User=require('../dbmodels/User');
var Session=require('../dbmodels/Session');
var Profile=require('../dbmodels/Profile');

const bcrypt=require('bcrypt');

// MDH: do I need the following here (or is it sufficient to put it in app.js)
//      apparently putting it in app.js suffices!!!!
/*
var bodyParser=require('body-parser');

router.use(bodyParser());
*/
// we want to keep track of the start and end of member sessions
function registerMemberSession(member){
    Session.create({user_id:member._id})
        .then((session)=>{
            console.log("Member session of '"+member.name+"' registered!");
            member.session_id=session._id; // register member session id
            console.log("Member",member);
        })
        .catch((err)=>{
            console.log("ERROR: Failed to register the member session of "+member.name+".");
        });
}
function unregisterMemberSession(member){
    // when a member session ends the session counter should be incremented!
    if(!member.session_id)return console.log("ERROR: No member session to unregister!");
    Session.findOneAndUpdate({_id:member.session_id},{active:false})
        .then((session)=>{
            console.log("Member session of '"+member.name+"' unregistered!");
            delete member.session_id;
            console.log("Member",member);
        })
        .catch((err)=>{
            console.log("ERROR: Failed to unregister member session of "+member.name+".");
        });
}

// accept a signup post request returning the newly created user if any
// anybody that signs up should also get a profile as well immediately
router.post('/signup',(req,res,next)=>{
    // MDH@28JAN2020: I got this code from ~/ironhack/week4/lab-express-basic-auth-1
    // the name and password are in req.body
    if(req.body.name.trim().length==0)return res.status(400).json({error:"No user name specified!",body:req.body});
    if(req.body.password.trim().length==0)return res.status(400).json({error:"No password specified!",body:req.body});
    if(req.session&&req.session.currentUser)res.status(400).json({error:"User session still active. Please logout first!"});
    // can I do the hash asynchronously???? I suppose so
    bcrypt.hash(req.body.password,10,(err,hash)=>{
        if(err)return res.status(500).json({error:err});
        // OOPS shouldn't create a user that does already exist again!!!!!
        //      let's be forthcoming and tell the user that he is already registered as such when (s)he already exists
        //      NO because 
        User.findOne({name:req.body.name})
            .then((user)=>{ // user found
                res.status(412).json({error:"We already have a member called '"+user.name+"'."});
                /* IF we would be forthcoming we'd do the following
                bcrypt.compare(req.body.password,user.password,(err,result)=>{
                    if(result) // password match, remember current user and send back
                        res.status(202).json(req.session.currentUser={_id:user._id,name:user.name,info:"Already registered!"}); // send the current user information back
                    else
                        res.status(401).json({error:(err?err:"A member with that name is already registered.")
                });
                */
            })
            .catch((err)=>{ // user not found
                // we can try to create the user, which will fail if a user with that name already exists
                // immediately creating a profile as well
                User.create({name:req.body.name,password:hash})
                    .then((user)=>Profile.create({user_id:user._id}))
                    .then((profile)=>{
                        // register the current user in the session with name and _id
                        let userInfo={_id:profile.user_id,name:req.body.name};
                        req.session.currentUser=userInfo; // remember the current user
                        console.log("Current user signed up: ",req.session);
                        res.status(201).json(userInfo); // send the current user information back
                        registerMemberSession(req.session.currentUser);
                    })
                    .catch((err)=>{
                        console.log("Sign up of "+req.body.name+" (password: "+req.body.password+") failed",err);
                        res.status(500).json({error:"Failed to sign you up."});
                    });
            });
    });
});

router.post('/login',(req,res,next)=>{
    // name and password required
    if(req.body.name.trim().length==0)return res.status(400).json({error:"No user name specified!"});
    if(req.body.password.trim().length==0)return res.status(400).json({error:"No password specified!"});
    // PROBLEM this could be another user logging in??????????
    // if(req.session&&req.session.currentUser)res.status(400).json({error:"User session still active. Please logout first!"});
    // let's see if a user with the given name exists
    console.log("Looking for user '"+req.body.name+"'.");
    User.findOne({name:req.body.name})
        .then((user)=>{ // a user with that name found
            console.log("User",user);
            // check the password (compare compares plain text password with bcrypted user.password)!!
            bcrypt.compare(req.body.password,user.password,(err,result)=>{
                if(result){ // password match!
                    debugger
                    let userInfo={_id:user._id,name:user.name};
                    req.session.currentUser=userInfo; // remember the current user
                    console.log("Current user logged in: ",req.session);
                    res.json(userInfo); // send the current user information back
                    registerMemberSession(req.session.currentUser);
                }else
                    res.status(401).json({error:(err?err:"Incorrect password.")});
            });
        })
        .catch((err)=>{
            res.status(401).json({error:"Invalid credentials."})
        });
});

router.post('/logout',(req,res,next)=>{
    // let's demand either a name or an id?????
    if(!req.body._id&&(!req.body.name||req.body.name.trim().length===0))
        return res.status(400).json({error:"No member id or name specified!",body:req.body});
    // accept if no user session is active anymore
    if(!req.session||!req.session.currentUser)
        return res.status(202).json({info:"You must have logged out before."});
    if(req.body._id){
        if(req.body._id!==req.session.currentUser._id)
            return res.status(400).json({error:"Invalid member id specified!"});
    }else{ // we've got a name
        if(req.body.name.trim()!==req.session.currentUser.name)
            return res.status(400).json({error:"Invalid member name specified!"});
    }
    // unregister the member session associated with the current user
    unregisterMemberSession(req.session.currentUser);
    // destroy the associated session
    req.session.destroy((err)=>(err?res.status(500).json({error:err}):res.status(204).send()));
});

module.exports=router;