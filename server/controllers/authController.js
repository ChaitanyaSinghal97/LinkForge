const User=require("../model/User");
const bcrypt=require("bcrypt");
const jwt = require("jsonwebtoken");
exports.signup=async(req,res)=>{
    const {username,email,password}=req.body;
    if(!username ||!email || !password){
        return res.status(400).send("Username and email and password required");
    }
    try{
    const existingUser= await User.findOne({email});
    if(existingUser){
        return res.status(409).send("Email already exist");
    }
    const storedPassword= await bcrypt.hash(password,10);
    const newUser=new User({
        username,
        email,
        password:storedPassword
    });
    await newUser.save();
    return res.status(201).send({
        message:"User created successfully",
        user:{
            id:newUser._id,
            username:newUser.username,
            email:newUser.email
        }
    });
    }
    catch(error){
        console.log(error);
        return res.status(500).send("Internal Server Error");
    }
};
exports.login=async(req,res)=>{
    const{email,password}=req.body;
    if(!email || !password){
        return res.status(400).send("email and password required");
    }
    try{
        const existingUser= await User.findOne({email});
        if(!existingUser){
            return res.status(401).send("Invalid email or password");
        }
        const isMatch=await bcrypt.compare(password,existingUser.password);
        if(isMatch){
            const token = jwt.sign(
        {id: existingUser._id},
        process.env.JWT_SECRET,
        {expiresIn: "1d"}  
        );
            return res.status(200).send({
                message:"Login successful",
                token,
                user: {
                        id: existingUser._id,
                        username: existingUser.username,
                        email: existingUser.email
                    }
            });
        }
        else{
            return res.status(401).send("Invalid email or password");
        }
        
    }
    catch(error){
        console.log(error);
        return res.status(500).send("Internal Server Error");
    }
}