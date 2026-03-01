const { GoogleGenAI } = require("@google/genai");

const generateInsightsHTML = async (user, expenses, income) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("Missing GEMINI_API_KEY environment variable. Cannot generate insights.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);

    const prompt = `
    You are an expert, encouraging financial advisor. Analyze the following spending data for the past 30 days for ${user.fullName}:
    
    Total Income: $${totalIncome}
    Total Expenses: $${totalExpenses}
    Expense Data: ${JSON.stringify(expenses)}
    Income Data: ${JSON.stringify(income)}
    
    Tasks:
    1. Write a brief, encouraging introduction personalized to the user.
    2. Highlight the major spending categories and income sources, noting any interesting patterns.
    3. Calculate their net savings for the month.
    4. Provide 2-3 actionable, highly specific tips on how they can optimize this specific spending to reach financial goals. Don't be generic.
    5. Format the ENTIRE response in clean, modern HTML so it can be sent directly as an email body. 
       - Use inline CSS for styling (it's an email).
       - Make it look friendly, professional, and easy to read on mobile.
       - Use a nice color palette (maybe some greens for savings, soft neutral backgrounds).
       - DO NOT include markdown blocks like \`\`\`html at the beginning or end. Just return the raw HTML string.
  `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error generating insights from Gemini:", error);
        throw error;
    }
};

module.exports = {
    generateInsightsHTML
};
