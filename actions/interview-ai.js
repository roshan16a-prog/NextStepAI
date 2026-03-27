"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getTestQuestions } from "./interview-test-data";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Set to true to use test questions instead of Gemini API
const USE_TEST_MODE = false;

/**
 * Generate interview questions for a session using Gemini AI
 */
export async function generateInterviewQuestions(
    sessionId,
    jobRole,
    jobDescription,
    interviewType,
    difficulty = "Medium"
) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
        select: {
            industry: true,
            skills: true,
        },
    });

    if (!user) throw new Error("User not found");

    const questionCount = difficulty === "Easy" ? 5 : difficulty === "Hard" ? 8 : 6;

    const prompt = `
    You are an expert technical interviewer. Generate ${questionCount} interview questions for the following position:
    
    Job Role: ${jobRole}
    Job Description: ${jobDescription}
    Interview Type: ${interviewType}
    Difficulty Level: ${difficulty}
    ${user.industry ? `Industry: ${user.industry}` : ""}
    ${user.skills?.length ? `Candidate Skills: ${user.skills.join(", ")}` : ""}
    
    Generate a mix of questions based on the interview type:
    - If "Technical": Focus on technical skills, problem-solving, and domain knowledge
    - If "Behavioral": Focus on past experiences, soft skills, and situational responses
    - If "Mixed": Include both technical and behavioral questions
    
    For each question, provide:
    1. The question text
    2. Category (Technical, Behavioral, or Situational)
    3. Key points that should be covered in a good answer
    4. Evaluation criteria
    
    Return ONLY valid JSON in this exact format, no additional text:
    {
      "questions": [
        {
          "questionText": "string",
          "category": "Technical|Behavioral|Situational",
          "difficulty": "Easy|Medium|Hard",
          "keyPoints": ["point1", "point2", "point3"],
          "evaluationCriteria": {
            "clarity": "What to look for in terms of clarity",
            "depth": "What depth of knowledge is expected",
            "relevance": "How relevant the answer should be"
          }
        }
      ]
    }
  `;

    try {
        console.log("Generating interview questions for session:", sessionId);
        console.log("Question count:", questionCount);
        console.log("Test mode:", USE_TEST_MODE);

        let questionsData;

        if (USE_TEST_MODE) {
            // Use pre-defined test questions
            console.log("Using test questions (Gemini API bypassed)");
            const testQuestions = getTestQuestions(jobRole, interviewType, difficulty);
            questionsData = { questions: testQuestions };
        } else {
            // Use Gemini API
            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            console.log("Gemini API response received, length:", text.length);

            const cleanedText = text
                .replace(/```(?:json)?\\n?/g, "")
                .replace(/```/g, "")
                .trim();

            console.log("Raw text:", text.substring(0, 1000)); // Log raw text for debugging

            // Robust JSON extraction
            let jsonString = text.trim();
            const firstBrace = text.indexOf('{');
            const lastBrace = text.lastIndexOf('}');

            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                jsonString = text.substring(firstBrace, lastBrace + 1);
            } else {
                // Fallback to basic cleaning if no braces found
                jsonString = text
                    .replace(/```(?:json)?\n?/g, "")
                    .replace(/```/g, "")
                    .trim();
            }

            console.log("Extracted JSON for parsing:", jsonString.substring(0, 500));

            // Sanitize unescaped control characters inside string literals
            let cleanedJsonString = "";
            let inString = false;
            let escapeNext = false;
            for (let i = 0; i < jsonString.length; i++) {
                const char = jsonString[i];
                if (escapeNext) {
                    cleanedJsonString += char;
                    escapeNext = false;
                    continue;
                }
                if (char === '\\') {
                    cleanedJsonString += char;
                    escapeNext = true;
                    continue;
                }
                if (char === '"') {
                    inString = !inString;
                    cleanedJsonString += char;
                    continue;
                }
                if (inString) {
                    if (char === '\n') {
                        cleanedJsonString += '\\n';
                    } else if (char === '\t') {
                        cleanedJsonString += '\\t';
                    } else if (char === '\r') {
                        cleanedJsonString += '\\r';
                    } else if (char.charCodeAt(0) < 32) {
                        // strip other control chars
                    } else {
                        cleanedJsonString += char;
                    }
                } else {
                    cleanedJsonString += char;
                }
            }

            try {
                questionsData = JSON.parse(cleanedJsonString);
            } catch (e) {
                console.error("Failed to parse JSON:", e);
                throw new Error("Failed to parse Gemini response: " + e.message);
            }
        }

        console.log("Parsed questions data structure:", JSON.stringify(questionsData, null, 2));

        // Handle case where Gemini returns just the array
        if (Array.isArray(questionsData)) {
            questionsData = { questions: questionsData };
        }

        if (!questionsData.questions || !Array.isArray(questionsData.questions)) {
            console.error("Invalid question format received from Gemini");
            throw new Error("Gemini returned invalid question format: " + JSON.stringify(questionsData).substring(0, 100));
        }

        console.log("Parsed questions data:", questionsData.questions?.length, "questions");

        // Save questions to database
        const savedQuestions = await Promise.all(
            questionsData.questions.map(async (q, index) => {
                return await db.interviewQuestion.create({
                    data: {
                        sessionId,
                        questionText: q.questionText,
                        category: q.category,
                        difficulty: q.difficulty,
                        orderIndex: index,
                        keyPoints: q.keyPoints,
                        evaluationCriteria: q.evaluationCriteria,
                    },
                });
            })
        );

        console.log("Successfully saved", savedQuestions.length, "questions to database");
        return savedQuestions;
    } catch (error) {
        console.error("Error generating interview questions:", error);
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        throw new Error(
            error.message || "Failed to generate interview questions"
        );
    }
}

/**
 * Generate comprehensive feedback for a completed interview session
 */
export async function generateInterviewFeedback(sessionId) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    try {
        // Fetch session with questions and responses
        const session = await db.interviewSession.findFirst({
            where: {
                id: sessionId,
                userId: user.id,
            },
            include: {
                questions: {
                    orderBy: {
                        orderIndex: "asc",
                    },
                },
                responses: {
                    include: {
                        question: true,
                    },
                },
            },
        });

        if (!session) throw new Error("Interview session not found");
        if (session.responses.length === 0) {
            throw new Error("No responses found for this session");
        }

        // Prepare data for AI analysis
        const qaData = session.responses.map((response) => ({
            question: response.question.questionText,
            category: response.question.category,
            keyPoints: response.question.keyPoints,
            userAnswer: response.transcription,
            duration: response.duration,
        }));

        const prompt = `
      You are an expert interview evaluator. Analyze the following interview responses and provide comprehensive feedback.
      
      Job Role: ${session.jobRole}
      Interview Type: ${session.interviewType}
      
      Questions and Answers:
      ${qaData
                .map(
                    (qa, i) => `
        Q${i + 1} [${qa.category}]: ${qa.question}
        Expected Key Points: ${qa.keyPoints.join(", ")}
        Candidate's Answer: ${qa.userAnswer}
        Response Duration: ${qa.duration || "N/A"} seconds
      `
                )
                .join("\n")}
      
      Provide a detailed evaluation in the following JSON format (ONLY JSON, no additional text):
      {
        "overallScore": <number 0-10>,
        "overallSummary": "A comprehensive summary of the interview performance",
        "technicalScore": <number 0-10 or null if no technical questions>,
        "behavioralScore": <number 0-10 or null if no behavioral questions>,
        "communicationScore": <number 0-10>,
        "strengths": ["strength1", "strength2", "strength3"],
        "improvements": ["improvement1", "improvement2", "improvement3"],
        "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
        "questionAnalysis": [
          {
            "questionIndex": 0,
            "score": <number 0-10>,
            "feedback": "Detailed feedback for this question",
            "keyPointsCovered": ["point1", "point2"]
          }
        ],
        "metricsData": {
          "categoryScores": {
            "Technical": <number 0-10>,
            "Behavioral": <number 0-10>,
            "Situational": <number 0-10>
          },
          "skillsAssessed": ["skill1", "skill2", "skill3"]
        }
      }
      
      Evaluation Guidelines:
      - Be constructive and encouraging
      - Provide specific, actionable feedback
      - Consider both content quality and communication clarity
      - Assess how well key points were addressed
      - Evaluate the depth and relevance of answers
    `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        let cleanedText = text;

        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            cleanedText = text.substring(firstBrace, lastBrace + 1);
        } else {
            cleanedText = text
                .replace(/```(?:json)?\n?/g, "")
                .replace(/```/g, "")
                .trim();
        }

        // Sanitize unescaped control characters inside string literals
        let sanitizedText = "";
        let inStr = false;
        let escNext = false;
        for (let i = 0; i < cleanedText.length; i++) {
            const char = cleanedText[i];
            if (escNext) {
                sanitizedText += char;
                escNext = false;
                continue;
            }
            if (char === '\\') {
                sanitizedText += char;
                escNext = true;
                continue;
            }
            if (char === '"') {
                inStr = !inStr;
                sanitizedText += char;
                continue;
            }
            if (inStr) {
                if (char === '\n') {
                    sanitizedText += '\\n';
                } else if (char === '\t') {
                    sanitizedText += '\\t';
                } else if (char === '\r') {
                    sanitizedText += '\\r';
                } else if (char.charCodeAt(0) < 32) {
                    // strip other control chars
                } else {
                    sanitizedText += char;
                }
            } else {
                sanitizedText += char;
            }
        }

        const feedbackData = JSON.parse(sanitizedText);

        // Save feedback to database
        const feedback = await db.interviewFeedback.create({
            data: {
                sessionId,
                overallScore: feedbackData.overallScore,
                overallSummary: feedbackData.overallSummary,
                technicalScore: feedbackData.technicalScore,
                behavioralScore: feedbackData.behavioralScore,
                communicationScore: feedbackData.communicationScore,
                strengths: feedbackData.strengths,
                improvements: feedbackData.improvements,
                recommendations: feedbackData.recommendations,
                questionAnalysis: feedbackData.questionAnalysis,
                metricsData: feedbackData.metricsData,
            },
        });

        return feedback;
    } catch (error) {
        console.error("Error generating interview feedback:", error);
        throw new Error(error.message || "Failed to generate interview feedback");
    }
}

/**
 * Get feedback for a specific interview session
 */
export async function getInterviewFeedback(sessionId) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    try {
        const feedback = await db.interviewFeedback.findFirst({
            where: {
                sessionId,
                session: {
                    userId: user.id,
                },
            },
            include: {
                session: {
                    select: {
                        jobRole: true,
                        jobDescription: true,
                        interviewType: true,
                        createdAt: true,
                    },
                },
            },
        });

        return feedback;
    } catch (error) {
        console.error("Error fetching interview feedback:", error);
        throw new Error("Failed to fetch interview feedback");
    }
}

/**
 * Generate a dynamic follow-up question based on previous response
 */
export async function generateFollowUpQuestion(sessionId, previousResponse) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    try {
        const session = await db.interviewSession.findUnique({
            where: { id: sessionId },
            select: {
                jobRole: true,
                interviewType: true,
            },
        });

        if (!session) throw new Error("Session not found");

        const prompt = `
      You are conducting a ${session.interviewType} interview for a ${session.jobRole} position.
      
      The candidate just answered: "${previousResponse}"
      
      Generate ONE insightful follow-up question that:
      1. Probes deeper into their answer
      2. Clarifies any ambiguous points
      3. Assesses their depth of knowledge
      
      Return ONLY the follow-up question text, nothing else.
    `;

        const result = await model.generateContent(prompt);
        const followUpQuestion = result.response.text().trim();

        return followUpQuestion;
    } catch (error) {
        console.error("Error generating follow-up question:", error);
        throw new Error("Failed to generate follow-up question");
    }
}
