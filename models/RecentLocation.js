const mongoose=require('mongoose');
const Schema=mongoose.Schema;

// the schema itself is empty i.e. only the _id is present
const recentLocationSchema=new mongoose.Schema({
            location_id:{type:mongoose.SchemaTypes.ObjectId,ref:"location"},
            user_id:{type:mongoose.SchemaTypes.ObjectId,ref:"user"},
            membergroup_ids:[{type:mongoose.SchemaTypes.ObjectId,ref:"membergroup"}],
            activitygroup_ids:[{type:mongoose.SchemaTypes.ObjectId,ref:"activitygroup"}],
        }/*,{
            timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
        }*/
    );

const RecentLocation = mongoose.model("recentlocation",recentLocationSchema);

module.exports = RecentLocation;