const express=require("express");
const cors=require("cors");
const app=express();
app.use(cors());
const linkRoutes=require("./routes/linkRoutes");
const authRoutes=require("./routes/authRoutes");
const linkController = require("./controllers/linkController");
app.use(express.json());
app.get("/",(req,res)=>{
    res.send("WELCOME TO LINKFORGE");
});
app.get("/about",(req,res)=>{
    res.send("THIS IS LINKFORGE");
});
app.use("/links",linkRoutes);
app.get("/:shortCode",linkController.redirectLink);
app.use("/auth",authRoutes);
module.exports=app;