const mongoose=require('mongoose');
const Schema=mongoose.Schema;

// the schema itself is empty i.e. only the _id is present
const locationSchema=new mongoose.Schema({
            user_id:{type:mongoose.SchemaTypes.ObjectId,ref:"user"}, // TODO should the user_id be required????
            longitude:{type:Number,required:true},
            latitude:{type:Number,required:true},
            altitude:Number,
            accuracy:{type:Number,required:true},
            timestamp:{type:Date,required:true},
            /*visibility:{type:String,required:true,values:["none","friends","all"]},*/
        }/*,{
            timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
        }*/
    );
  
  const Location = mongoose.model("location",locationSchema);
  
  module.exports = Location;