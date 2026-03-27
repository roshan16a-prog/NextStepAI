const fs = require('fs');
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

console.log("Fetching models from:", URL.replace(API_KEY, "HIDDEN_KEY"));

fetch(URL)
    .then(response => response.json())
    .then(data => {
        console.log("Response status:", data);
        fs.writeFileSync('models_output.txt', JSON.stringify(data, null, 2));
        console.log("Output written to models_output.txt");
    })
    .catch(error => {
        console.error("Error fetching models:", error);
        fs.writeFileSync('models_output.txt', `Error: ${error.message}`);
    });
