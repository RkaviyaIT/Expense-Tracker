const agenda = require("../config/agenda");
const User = require("../models/User");
const Expense = require("../models/Expense");
const Income = require("../models/Income");
const { generateInsightsHTML } = require("../services/aiService");
const { sendEmail } = require("../services/emailService");

agenda.define("send-monthly-ai-report", async (job) => {
    console.log("Starting send-monthly-ai-report job...");
    const { userId } = job.attrs.data;

    try {
        let users = [];
        if (userId) {
            // If a specific user is passed (e.g. from manual trigger)
            const user = await User.findById(userId);
            if (user) users.push(user);
        } else {
            // Otherwise, run for all users
            users = await User.find();
        }

        if (users.length === 0) {
            console.log("No users found to send reports to.");
            return;
        }

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        for (const user of users) {
            console.log(`Generating report for user: ${user.fullName}`);

            // Fetch data for the last 30 days
            const expenses = await Expense.find({
                userId: user._id,
                date: { $gte: thirtyDaysAgo }
            });

            const income = await Income.find({
                userId: user._id,
                date: { $gte: thirtyDaysAgo }
            });

            if (expenses.length === 0 && income.length === 0) {
                console.log(`Skipping ${user.fullName} - no data in last 30 days.`);
                continue; // Skip if no activity
            }

            try {
                // 1. Generate HTML via Gemini
                const htmlBody = await generateInsightsHTML(user, expenses, income);

                // 2. Send via Email
                await sendEmail(
                    user.email,
                    "Your Monthly Financial Insights & Savings Tips 📊",
                    htmlBody
                );
            } catch (innerError) {
                console.error(`Failed to process user ${user._id}:`, innerError);
            }
        }

        console.log("Finished send-monthly-ai-report job successfully.");
    } catch (error) {
        console.error("Error executing send-monthly-ai-report job:", error);
        throw error; // This lets Agenda know the job failed
    }
});

module.exports = function () {
    // This function can be called to ensure jobs are registered
};
