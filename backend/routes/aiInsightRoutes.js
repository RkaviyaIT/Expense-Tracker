const express = require("express");
const router = express.Router();
const agenda = require("../config/agenda");
const User = require("../models/User");

// Middleware to check if user is authenticated (Assume you have this or adapt accordingly)
// const authMiddleware = require("../middleware/authMiddleware");

// Route to manually trigger an AI report for the logged-in user
// Usage: POST /api/v1/insights/trigger-report
// Body: { "userId": "user_id_here" } 
router.post("/trigger-report", async (req, res) => {
    try {
        const { userId } = req.body; // In a real app this might come from req.user

        if (!userId) {
            return res.status(400).json({ message: "userId is required to trigger a report." });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Queue the job to run immediately
        await agenda.now("send-monthly-ai-report", { userId });

        res.status(200).json({
            message: "AI Insight report job queued successfully! This might take a few seconds.",
            user: user.email
        });
    } catch (error) {
        console.error("Error triggering AI report:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Admin Route: Trigger reports for ALL users immediately
router.post("/trigger-all", async (req, res) => {
    try {
        await agenda.now("send-monthly-ai-report", {});
        res.status(200).json({ message: "Global AI Insight report job queued successfully!" });
    } catch (error) {
        console.error("Error triggering global AI report:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
