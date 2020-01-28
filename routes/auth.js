var express=require('express');
var router=express.Router();

var User=require('../models/User');

const bcrypt=require('bcrypt');

// MDH: do I need the following here (or is it sufficient to put it in app.js)
//      apparently putting it in app.js suffices!!!!
/*
var bodyParser=require('body-parser');

router.use(bodyParser());
*/

// accept a signup post request returning the newly created user if any
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
                User.create({name:req.body.name,password:hash})
                    .then((user)=>{
                        // register the current user in the session with name and _id
                        let userInfo={_id:user._id,name:user.name};
                        req.session.currentUser=userInfo; // remember the current user
                        res.status(201).json(userInfo); // send the current user information back
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
    if(req.session&&req.session.currentUser)res.status(400).json({error:"User session still active. Please logout first!"});
    // let's see if a user with the given name exists
    User.findOne({name:req.body.name})
        .then((user)=>{ // a user with that name found
            console.log("User",user);
            // check the password (compare compares plain text password with bcrypted user.password)!!
            bcrypt.compare(req.body.password,user.password,(err,result)=>{
                if(result){ // password match!
                    let userInfo={_id:user._id,name:user.name};
                    req.session.currentUser=userInfo; // remember the current user
                    res.json(userInfo); // send the current user information back
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
    if(!req.session||!req.session.currentUser)
        return res.status(410).json({error:"No session active to log out of."});
    if(req.body._id){
        if(req.body._id!==req.session.currentUser._id)
            return res.status(400).json({error:"Invalid member id specified!"});
    }else{ // we've got a name
        if(req.body.name.trim()!==req.session.currentUser.name)
            return res.status(400).json({error:"Invalid member name specified!"});
    }
    // destroy the associated session
    req.session.destroy((err)=>(err?res.status(500).json({error:err}):res.status(204).send()));
});

module.exports=router;