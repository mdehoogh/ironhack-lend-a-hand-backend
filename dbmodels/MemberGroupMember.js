const mongoose=require('mongoose');
const Schema=mongoose.Schema;

// the schema itself is empty i.e. only the _id is present
const membergroupMemberSchema=new mongoose.Schema({
            membergroup_id:{type:mongoose.SchemaTypes.ObjectId,ref:"membergroup"},
            user_id:{type:mongoose.SchemaTypes.ObjectId,ref:"user"},
            created_at:{type:Date,default:Date.now},
            accepted_at:{type:Date},
            rejected_at:{type:Date},
            status:{type:String,default:"candidate",values:["candidate","accepted","rejected"]},
        },{
            timestamps: { createdAt: "created_at"}
        }
    );
const MemberGroupMember = mongoose.model("membergroupmember",membergroupMemberSchema);
  
module.exports = MemberGroupMember;