var express=require('express');
var router=express.Router();

var User=require('../models/User');

// accept a signup post request returning the newly created user if any
router.post('/signup',(req,res,next)=>{
    User.create({
        username:req.body.username,
        ...
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

module.exports=router;