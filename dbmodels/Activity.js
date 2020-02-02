const mongoose=require('mongoose');
const Schema=mongoose.Schema;

// the schema itself is empty i.e. only the _id is present
const activitySchema=new mongoose.Schema({
            name:{type:String,required:true,minlength:1,maxlength:32},
        },/*{
            timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
        }*/
    );
    
const Activity = mongoose.model("activities",activitySchema);

module.exports = Activity;