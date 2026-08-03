require("dotenv").config();
const app=require("./app.js");
const connectDB=require("./config/db.js");
const startServer=async()=>{
    await connectDB();
    app.listen(5000,()=>{
    console.log("Server listening on port 5000");
});
}
startServer();
