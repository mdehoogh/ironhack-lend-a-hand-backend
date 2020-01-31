const mongoose=require('mongoose');
const Schema=mongoose.Schema;

// the schema itself is empty i.e. only the _id is present
const groupSchema=new mongoose.Schema({
            user_id:{type:mongoose.SchemaTypes.ObjectId,ref:"user"},
            name:{type:String,required:true,minlength:1,maxlength:32},
        },{
            timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
        }
    );
  
  const Group = mongoose.model("group",groupSchema);
  
  module.exports = Group;