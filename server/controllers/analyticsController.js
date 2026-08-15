const { pool } = require("../config/db");
exports.getAnalytics = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the link
        const linkResult = await pool.query(
            `SELECT id, clicks
             FROM links
             WHERE id = $1 AND user_id = $2`,
            [id, req.user.id]
        );


        if (linkResult.rows.length === 0) {
            return res.status(404).json({
                message: "Link not found"
            });
        }
        const link = linkResult.rows[0];
        // Total clicks
        const totalClicks = link.clicks;
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const todayResult = await pool.query(
            `SELECT COUNT(*) AS count
             FROM clicks
             WHERE link_id = $1
             AND timestamp >= $2`,
            [link.id, startOfToday]
        );

        const clicksToday = Number(todayResult.rows[0].count);
        const startOfLast7Days = new Date();
        startOfLast7Days.setDate(startOfLast7Days.getDate() - 6);
        startOfLast7Days.setHours(0, 0, 0, 0);

        const last7DaysResult = await pool.query(
            `SELECT COUNT(*) AS count
             FROM clicks
             WHERE link_id = $1
             AND timestamp >= $2`,
            [link.id, startOfLast7Days]
        );
        const clicksLast7Days = Number(last7DaysResult.rows[0].count);

        return res.status(200).json({
            totalClicks,
            clicksToday,
            clicksLast7Days
        });
    }

    catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};