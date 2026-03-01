const Agenda = require("agenda");

const agenda = new Agenda({
    db: {
        address: process.env.MONGO_URI,
        collection: "agendaJobs",
    },
    processEvery: "1 minute" // Checks for jobs every minute
});

agenda.on("ready", () => {
    console.log("Agenda connected to MongoDB successfully!");
});

agenda.on("error", (err) => {
    console.error("Agenda connection error:", err);
});

module.exports = agenda;
