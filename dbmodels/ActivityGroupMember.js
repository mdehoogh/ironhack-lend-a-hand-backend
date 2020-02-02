const mongoose=require('mongoose');
const Schema=mongoose.Schema;

// the schema itself is empty i.e. only the _id is present
const activityGroupMemberSchema=new mongoose.Schema({
            activity_id:{type:mongoose.SchemaTypes.ObjectId,ref:'activity'},
            user_id:{type:mongoose.SchemaTypes.ObjectId,ref:'user'},
        },{
            timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
        }
    );
  
const ActivityGroupMember = mongoose.model("activitygroupmember",activityGroupMemberSchema);
  
module.exports = ActivityGroupMember;