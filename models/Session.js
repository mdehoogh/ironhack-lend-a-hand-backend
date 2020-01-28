const mongoose=require('mongoose');
const Schema=mongoose.Schema;

// the schema itself is empty i.e. only the _id is present
const sessionSchema=new mongoose.Schema({
            user_id:{type:mongoose.SchemaTypes.ObjectId,ref:"user"},
            active:{type:Boolean,default:true},
        },{
            timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
        }
    );
  
  const Session = mongoose.model("session", sessionSchema);
  
  module.exports = Session;