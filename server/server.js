require("dotenv").config();
const app=require("./app.js");
const connectDB=require("./config/db.js");
const { connectRedis } = require("./config/redis");
require("./workers/analyticsWorker");
const startServer=async()=>{
    await connectDB();
    await connectRedis();
    app.listen(5000,()=>{
    console.log("Server listening on port 5000");
});
}
startServer();
