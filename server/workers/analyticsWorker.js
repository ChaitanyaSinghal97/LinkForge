const { Worker } = require("bullmq");
const { connection } = require("../config/bullmq");
const { pool } = require("../config/db");

const analyticsWorker = new Worker(
    "analytics",

    async (job) => {
        try {
            const {
                shortCode,
                timestamp,
                ip,
                userAgent,
                referrer
            } = job.data;
            const linkResult = await pool.query(
                `SELECT id
                 FROM links
                 WHERE short_code = $1`,
                [shortCode]
            );

            if (linkResult.rows.length === 0) {
                console.log(`Link not found: ${shortCode}`);
                return;
            }
            // Find the link
            const linkId = linkResult.rows[0].id;

            // Increment total clicks
            await pool.query(
                `UPDATE links
                 SET clicks = clicks + 1
                 WHERE id = $1`,
                [linkId]
            );

            // Store detailed click information
            await pool.query(
                `INSERT INTO clicks
                    (link_id, timestamp, ip, user_agent, referrer)
                 VALUES
                    ($1, $2, $3, $4, $5)`,
                [
                    linkId,
                    timestamp,
                    ip,
                    userAgent,
                    referrer
                ]
            );

            console.log(`Processed click for ${shortCode}`);
        }

        catch (error) {
            console.error("Worker Error:", error);
            throw error;
        }
    },

    { connection }
);