const { Worker } = require("bullmq");
const { connection } = require("../config/bullmq");
const Link=require("../model/Link");
const analyticsWorker = new Worker(
    "analytics",
    async (job) => {
        try{
        const { shortCode } = job.data;
        await Link.findOneAndUpdate(
           { shortCode },
           { $inc: { clicks: 1 } }
        );
        console.log(`Processed click for ${shortCode}`);
        }
        catch(error){
            console.error("Worker Error:", error);
            throw error;
        }
    },
    { connection }
);