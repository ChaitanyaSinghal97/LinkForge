const mongoose=require("mongoose");
const linkSchema=new mongoose.Schema({
    originalUrl:{
        type:String,
        required:true
    },
    shortCode:{
        type:String,
        unique:true,
        required:true
    },
    clicks:{
        type:Number,
        default:0
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
},
{
    timestamps:true
}
);
const Link=mongoose.model("Link",linkSchema);
module.exports=Link;