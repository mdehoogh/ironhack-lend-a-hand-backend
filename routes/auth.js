var express=require('express');
var router=express.Router();

var User=require('../models/User');

// MDH: do I need the following here (or is it sufficient to put it in app.js)
//      apparently putting it in app.js suffices!!!!
/*
var bodyParser=require('body-parser');

router.use(bodyParser());
*/

// accept a signup post request returning the newly created user if any
router.post('/signup',(req,res,next)=>{
    console.log("Body: ",req.body);
    User.create({
        name:req.body.name,
        password:req.body.password,
    })
    .then((user)=>{
        delete user.password;
        // remove password first
        res.json({user:user});
    })
    .catch((err)=>{
        res.json({error:err});
    });
});

router.post('/login',(req,res,next)=>{
    User.find({
        name:req.body.name,
        password:req.body.password,
    })
    .then((user)=>{
        delete user.password;
        // remove password first
        res.json({name:user.name,_id:user._id});
    })
    .catch((err)=>{
        res.json({error:err});
    });
});

module.exports=router;