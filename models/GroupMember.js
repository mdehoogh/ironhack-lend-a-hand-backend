const mongoose=require('mongoose');
const Schema=mongoose.Schema;

// the schema itself is empty i.e. only the _id is present
const groupMemberSchema=new mongoose.Schema({
            group_id:{type:mongoose.SchemaTypes.ObjectId,ref:"group"},
            user_id:{type:mongoose.SchemaTypes.ObjectId,ref:"user"},
            created_at:{type:Date,default:Date.now},
            accepted_at:{type:Date},
            rejected_at:{type:Date},
            status:{type:String,default:"candidate",values:["candidate","accepted","rejected"]},
        },{
            timestamps: { createdAt: "created_at"}
        }
    );
const GroupMember = mongoose.model("groupmember",groupMemberSchema);
  
module.exports = GroupMember;