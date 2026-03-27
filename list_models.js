const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function listModels() {
    console.log("Initializing Gemini...");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const modelsToTest = ["gemini-1.5-flash", "gemini-1.5-flash-001", "gemini-pro"];

    for (const modelName of modelsToTest) {
        console.log(`\nTesting model: ${modelName}`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello, are you there?");
            console.log(`SUCCESS: ${modelName} worked!`);
            const response = await result.response;
            console.log("Response:", response.text());
            return;
        } catch (error) {
            console.error(`FAILED: ${modelName}`);
            console.error(`Error details: ${error.message}`);
        }
    }
    console.log("\nAll models failed.");
}

listModels();
