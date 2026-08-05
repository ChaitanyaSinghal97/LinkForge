const {redisClient} = require("../config/redis");
const rateLimiter = async (req, res, next) => {
    const LIMIT=5;
    const WINDOW=60;
    const ip=req.ip;
    const key=`rate:${ip}`;
    try{
    const count = await redisClient.incr(key);
    if (count === 1) {
        await redisClient.expire(key, WINDOW);
    }
    
    if(count>LIMIT){
        return res.status(429).json({
            message: "Too many requests. Please try again later."
        });
    }
    next();
    }
    catch(error){
        console.log("rate limiter error:",error);
        next();
    }
 
};
module.exports = rateLimiter;