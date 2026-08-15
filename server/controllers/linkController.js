
const { generateShortCode } = require("../utils/generateShortCode");
const { redisClient } = require("../config/redis");
const analyticsQueue = require("../queues/analyticsQueue");
const { pool } = require("../config/db");
exports.createLink = async (req, res) => {
    const originalUrl = req.body.originalUrl;

    if (!originalUrl) {
        return res.status(400).send("URL is required");
    }

    try {
        let shortCode;
        let existing;

        do {
            shortCode = generateShortCode();

            const result = await pool.query(
                "SELECT id FROM links WHERE short_code = $1",
                [shortCode]
            );

            existing = result.rows[0];

        } while (existing);

        const result = await pool.query(
            `INSERT INTO links (original_url, short_code, user_id)
             VALUES ($1, $2, $3)
             RETURNING
                id AS "_id",
                original_url AS "originalUrl",
                short_code AS "shortCode",
                clicks,
                user_id AS "user",
                created_at AS "createdAt",
                updated_at AS "updatedAt"`,
            [originalUrl, shortCode, req.user.id]
        );

        const savedLink = result.rows[0];

        res.status(201).send(savedLink);
    }
    catch (error) {
        console.log(error);
        return res.status(500).send("Internal server error");
    }
};
exports.getAllLinks = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                id AS "_id",
                original_url AS "originalUrl",
                short_code AS "shortCode",
                clicks,
                user_id AS "user",
                created_at AS "createdAt",
                updated_at AS "updatedAt"
             FROM links
             WHERE user_id = $1`,
            [req.user.id]
        );

        res.status(200).send(result.rows);
    }
    catch (error) {
        console.log(error);
        return res.status(500).send("Internal server error");
    }
};
exports.redirectLink=async(req,res)=>{
    const {shortCode}=req.params;
    try{
        const cachedUrl = await redisClient.get(shortCode);
        if(cachedUrl){
            console.log("cache hit");
            await analyticsQueue.add("click", {
                shortCode,
                timestamp: new Date(),
                ip: req.ip,
                userAgent: req.get("user-agent"),
                referrer: req.get("referer")
            });
            return res.redirect(cachedUrl);
        }
        console.log("Cache Miss");
        const result = await pool.query(
            `SELECT original_url
             FROM links
             WHERE short_code = $1`,
            [shortCode]
        );
        if (result.rows.length === 0) {
            return res.status(404).send("ShortCode doesnt exist");
        }
        const originalUrl = result.rows[0].original_url;
        await redisClient.set(shortCode, originalUrl, {EX: 3600,});
        console.log("Stored in Redis");
        await analyticsQueue.add("click", {
            shortCode,
            timestamp: new Date(),
            ip: req.ip,
            userAgent: req.get("user-agent"),
            referrer: req.get("referer")
        }); 
        res.redirect(originalUrl);
    }
    catch(error){
        console.log(error);
        return res.status(500).send("Internal server error");
    }
    
}
exports.getLink=async(req,res)=>{
    const id=req.params.id;
    try{
        const result = await pool.query(
            `SELECT
                id AS "_id",
                original_url AS "originalUrl",
                short_code AS "shortCode",
                clicks,
                user_id AS "user",
                created_at AS "createdAt",
                updated_at AS "updatedAt"
             FROM links
             WHERE id = $1
             AND user_id = $2`,
            [id, req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).send("Link not found");
        }
        const link=result.rows[0];
        res.status(200).send(link);
    }
    catch(error){
        console.log(error);
        return res.status(500).send("Internal server error");
    }
}
exports.updateLink=async(req,res)=>{
    const id = req.params.id;

    try {
        const { originalUrl } = req.body;

        if (!originalUrl) {
            return res.status(400).send("URL is required");
        }

        const result = await pool.query(
            `UPDATE links
             SET original_url = $1,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             AND user_id = $3
             RETURNING
                id AS "_id",
                original_url AS "originalUrl",
                short_code AS "shortCode",
                clicks,
                user_id AS "user",
                created_at AS "createdAt",
                updated_at AS "updatedAt"`,
            [originalUrl, id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send("Link not found");
        }

        const updatedLink = result.rows[0];

        // Invalidate old cached URL
        await redisClient.del(updatedLink.shortCode);

        console.log(`Cache Invalidated: ${updatedLink.shortCode}`);

        res.status(200).send(updatedLink);
    }
     catch(error){
        console.log(error);
        return res.status(500).send("Internal server error");
    }

}
exports.deleteLink=async(req,res)=>{
    const id=req.params.id;
    try {
        const result = await pool.query(
            `DELETE FROM links
             WHERE id = $1
             AND user_id = $2
             RETURNING short_code`,
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send("Link not found");
        }

        const shortCode = result.rows[0].short_code;

        // Remove from Redis
        await redisClient.del(shortCode);

        console.log(`Cache Invalidated: ${shortCode}`);

        res.status(200).send("link deleted successfully");
    }
    catch(error){
        console.log(error);
        return res.status(500).send("Internal server error");
    }
}