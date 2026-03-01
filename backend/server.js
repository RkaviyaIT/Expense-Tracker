require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const aiInsightRoutes = require("./routes/aiInsightRoutes");
const agenda = require("./config/agenda");
require("./jobs/monthlyReportJob")(); // Load jobs

const app = express();
// Middleware to handle CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/income", incomeRoutes);
app.use("/api/v1/expense", expenseRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/insights", aiInsightRoutes);

connectDB();

// Start Agenda
(async function () {
  await agenda.start();
  console.log("Agenda background scheduler started.");

  // Actually schedule the recurring job (Run on the 1st of every month at 9:00 AM)
  agenda.every('0 9 1 * *', 'send-monthly-ai-report');
})();

// Serve static files from the "uploads" directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));