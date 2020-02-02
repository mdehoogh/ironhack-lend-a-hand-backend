const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const userSchema=new mongoose.Schema({
            name:{type:String,required:true,minLength:1},
            password:{type:String,required:true,minLength:1},
            email:String,
        },{
            timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
        }
    );
  
  const User = mongoose.model("user", userSchema);
  
  module.exports = User;