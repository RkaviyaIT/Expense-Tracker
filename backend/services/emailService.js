const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, htmlContent) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn("WARNING: EMAIL_USER or EMAIL_PASS not set in .env. Skipping email send.");
        return;
    }

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"Expense Tracker AI" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: htmlContent,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${to}. Message ID: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};

module.exports = {
    sendEmail,
};
