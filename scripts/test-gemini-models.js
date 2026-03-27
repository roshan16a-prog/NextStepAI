require("dotenv").config();
const https = require('https');
const fs = require('fs');

const logFile = 'model-test.log';
const apiKey = process.env.GEMINI_API_KEY;

function log(message) {
    console.log(message);
    fs.appendFileSync(logFile, message + '\n');
}

if (!apiKey) {
    log("No API key found in .env");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

fs.writeFileSync(logFile, '');
log("Listing models via native HTTPS...");

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        log(`Status Code: ${res.statusCode}`);
        try {
            const json = JSON.parse(data);
            if (json.models) {
                log("Available Models:");
                json.models.forEach(m => log(`- ${m.name}`));
            } else {
                log("Response Body (No models field):");
                log(JSON.stringify(json, null, 2));
            }
        } catch (e) {
            log("Response Body (Not JSON):");
            log(data);
        }
    });
}).on('error', (e) => {
    log(`Network Error: ${e.message}`);
});
