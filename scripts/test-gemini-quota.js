require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

const logFile = 'model-test-quota.log';
const apiKey = process.env.GEMINI_API_KEY;

function log(message) {
    console.log(message);
    fs.appendFileSync(logFile, message + '\n');
}

if (!apiKey) {
    log("No API key found in .env");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

const models = [
    "gemini-2.0-flash-lite-preview-02-05", // Try specific preview first
    "gemini-2.0-flash-lite",
    "gemini-flash-latest",
    "gemini-pro-latest",
    "gemini-1.5-flash-8b", // Maybe this works?
];

async function testQuota() {
    fs.writeFileSync(logFile, '');
    log("Starting QUOTA test...");

    for (const modelName of models) {
        log(`Testing ${modelName} for quota...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Test");
            const response = await result.response;
            log(`SUCCESS: ${modelName} - Response generated!`);
            break; // Found one!
        } catch (error) {
            log(`FAILED: ${modelName}`);
            log(`Error: ${error.message}`);
        }
    }
    log("Test complete.");
}

testQuota();
