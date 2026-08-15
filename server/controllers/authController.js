
const bcrypt=require("bcrypt");
const {pool}=require("../config/db");
const jwt = require("jsonwebtoken");
exports.signup=async(req,res)=>{
    const {username,email,password}=req.body;
    if(!username ||!email || !password){
        return res.status(400).send("Username and email and password required");
    }
    try{
    const existingUser= await pool.query("SELECT * FROM users WHERE email = $1",[email]);
    if(existingUser.rows.length>0){
        return res.status(409).send("Email already exist");
    }
    const storedPassword= await bcrypt.hash(password,10);
    const result=await pool.query(`INSERT INTO users(username,email,password)
        VALUES ($1,$2,$3)
        RETURNING id,username,email`,[username,email,storedPassword]);
    const newUser=result.rows[0];
    return res.status(201).send({
        message:"User created successfully",
        user:{
            id:newUser.id,
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
        const result=await pool.query("SELECT * FROM users WHERE email = $1",[email]);
        const existingUser=result.rows[0];
        if(!existingUser){
            return res.status(401).send("Invalid email or password");
        }
        const isMatch=await bcrypt.compare(password,existingUser.password);
        if(isMatch){
            const token = jwt.sign(
        {id: existingUser.id},
        process.env.JWT_SECRET,
        {expiresIn: "1d"}  
        );
            return res.status(200).send({
                message:"Login successful",
                token,
                user: {
                        id: existingUser.id,
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