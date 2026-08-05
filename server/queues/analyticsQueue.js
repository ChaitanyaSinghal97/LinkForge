const { Queue } = require("bullmq");
const { connection } = require("../config/bullmq");
const analyticsQueue = new Queue("analytics", {connection});
module.exports = analyticsQueue;