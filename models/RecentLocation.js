const mongoose=require('mongoose');
const Schema=mongoose.Schema;

// the schema itself is empty i.e. only the _id is present
const recentLocationSchema=new mongoose.Schema({
            user_id:{type:mongoose.SchemaTypes.ObjectId,ref:"user"},
            location_id:{type:mongoose.SchemaTypes.ObjectId,ref:"location"},
            group_ids:[{type:mongooseSchemaTypes.ObjectId,ref:"group"}],
        }/*,{
            timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
        }*/
    );
  
  const RecentLocation = mongoose.model("recentlocation",recentLocationSchema);
  
  module.exports = RecentLocation;