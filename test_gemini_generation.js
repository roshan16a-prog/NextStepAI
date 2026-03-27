const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function testGeneration() {
    console.log("Testing Gemini Generation...");

    const prompt = `
    Generate 1 interview question for a Software Engineer.
    Return ONLY valid JSON in this exact format:
    {
      "questions": [
        {
          "questionText": "string",
          "category": "Technical",
          "difficulty": "Easy",
          "keyPoints": ["point1"],
          "evaluationCriteria": { "clarity": "x", "depth": "y", "relevance": "z" }
        }
      ]
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        console.log("\nRAW START: " + text.substring(0, 100));
        console.log("RAW END:   " + text.substring(text.length - 100));

        let jsonString = text.trim();
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            jsonString = text.substring(firstBrace, lastBrace + 1);
            console.log("Found JSON block.");
        }

        try {
            const data = JSON.parse(jsonString);
            console.log("\nPARSING SUCCESS!");
            console.log("Questions count:", data.questions.length);
        } catch (e) {
            console.error("\nPARSING FAILED:", e.message);
        }

    } catch (error) {
        console.error("GENERATION ERROR:", error);
    }
}

testGeneration();
