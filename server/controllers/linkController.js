
const Link=require("../model/Link");
const { generateShortCode } = require("../utils/generateShortCode");
exports.createLink=async(req,res)=>{
    // console.log(req.body);
    const originalUrl=req.body.originalUrl;
    if(!originalUrl){
        return res.status(400).send("URL is required");
    }
    try{
    let shortCode;
    let existing;
    do{
        shortCode= generateShortCode();
        existing=await Link.findOne({shortCode});
    }while(existing)
    
        const savedLink=await Link.create({
        originalUrl,
        shortCode,
        user:req.user.id
    });
    res.status(201).send(savedLink);
    }
    catch(error){
        console.log(error);
        return res.status(500).send("Internal server error");
    }
};
exports.getAllLinks=async(req,res)=>{
    try{
        const links=await Link.find({
            user:req.user.id
        });
        res.status(200).send(links);
    }
    catch(error){
        console.log(error);
        return res.status(500).send("Internal server error");
    }
    
}
exports.redirectLink=async(req,res)=>{
    const {shortCode}=req.params;
    try{
        const link=await Link.findOne({shortCode});
        if(!link){
            return res.status(404).send("ShortCode doesnt exist");
        }
        await Link.findOneAndUpdate(
    { shortCode },
    { $inc: { clicks: 1 } }
);
        res.redirect(link.originalUrl);
    }
    catch(error){
        console.log(error);
        return res.status(500).send("Internal server error");
    }
    
}
exports.getLink=async(req,res)=>{
    const id=req.params.id;
    try{
        const link= await Link.findOne({
            _id:id,
            user:req.user.id
        });
        if(!link){
            return res.status(404).send("Link not found");
        }
        res.status(200).send(link);
    }
    catch(error){
        console.log(error);
        return res.status(500).send("Internal server error");
    }
}
exports.updateLink=async(req,res)=>{
    const id=req.params.id;
    try{
    const link= await Link.findOne({
            _id:id,
            user:req.user.id
        });
    if(!link){
        return res.status(404).send("Link not found");
    }
    const {originalUrl}=req.body;
    if(!originalUrl ){
        return res.status(400).send("URL is required");
    }
    link.originalUrl=originalUrl;
    await link.save();
    res.status(200).send(link);
    }
     catch(error){
        console.log(error);
        return res.status(500).send("Internal server error");
    }

}
exports.deleteLink=async(req,res)=>{
    const id=req.params.id;
    try{
    const link= await Link.findOneAndDelete({
            _id:id,
            user:req.user.id
        });
    if(!link){
        return res.status(404).send("Link not found");
    }
    res.status(200).send("link deleted successfully");
    }
    catch(error){
        console.log(error);
        return res.status(500).send("Internal server error");
    }
}