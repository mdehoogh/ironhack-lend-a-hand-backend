const mongoose=require('mongoose');
const Schema=mongoose.Schema;

// the schema itself is empty i.e. only the _id is present
const topicSchema=new mongoose.Schema({
            name:{type:String,required:true,minlength:1,maxlength:32},
        }/*,{
            timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
        }*/
    );
  
const Topic = mongoose.model("topic",topicSchema);
  
module.exports = Topic;