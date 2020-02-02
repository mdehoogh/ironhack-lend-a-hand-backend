const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const YMDSchema=new mongoose.Schema({
            year:{type:Number,min:1900,max:2020},
            month:{type:Number,min:1,max:12},
            monthday:{type:Number,min:1,max:31}
        },{_id:false});

// the schema itself is empty i.e. only the _id is present
const profileSchema=new mongoose.Schema({
            user_id:{type:mongoose.SchemaTypes.ObjectId,ref:"user"},
            email:String,
            owned_groups:[{type:mongoose.SchemaTypes.ObjectId,ref:"group"}],
            interests:[{type:mongoose.SchemaTypes.ObjectId,ref:"interest"}],
            dayofbirth:YMDSchema,
        },{
            timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
        }
    );

const Profile = mongoose.model("profile",profileSchema);
  
module.exports = Profile;