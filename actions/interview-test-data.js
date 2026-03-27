/**
 * Test/Demo interview questions for when Gemini API is unavailable
 */

export const getTestQuestions = (jobRole, interviewType, difficulty) => {
    const questionCount = difficulty === "Easy" ? 5 : difficulty === "Hard" ? 8 : 6;

    const technicalQuestions = [
        {
            questionText: `Describe your experience with the key technologies required for a ${jobRole} position.`,
            category: "Technical",
            difficulty: difficulty,
            keyPoints: [
                "Specific technologies and frameworks",
                "Years of experience with each",
                "Real-world projects where you used them",
                "Depth of knowledge demonstrated"
            ],
            evaluationCriteria: {
                clarity: "Clear articulation of technical experience",
                depth: "Demonstrates deep understanding of technologies",
                relevance: "Experience aligns with job requirements"
            }
        },
        {
            questionText: "Walk me through how you would approach solving a complex technical problem in this role.",
            category: "Technical",
            difficulty: difficulty,
            keyPoints: [
                "Problem analysis and breakdown",
                "Solution design approach",
                "Consideration of trade-offs",
                "Testing and validation strategy"
            ],
            evaluationCriteria: {
                clarity: "Structured and logical explanation",
                depth: "Shows systematic problem-solving approach",
                relevance: "Practical and applicable to real scenarios"
            }
        },
        {
            questionText: "What are the most important best practices you follow in your development work?",
            category: "Technical",
            difficulty: difficulty,
            keyPoints: [
                "Code quality and maintainability",
                "Testing and documentation",
                "Version control practices",
                "Security considerations"
            ],
            evaluationCriteria: {
                clarity: "Well-articulated practices",
                depth: "Understanding of why practices matter",
                relevance: "Industry-standard approaches"
            }
        }
    ];

    const behavioralQuestions = [
        {
            questionText: "Tell me about a challenging project you worked on and how you overcame the obstacles.",
            category: "Behavioral",
            difficulty: difficulty,
            keyPoints: [
                "Specific situation and context",
                "Challenges faced",
                "Actions taken to overcome them",
                "Results and lessons learned"
            ],
            evaluationCriteria: {
                clarity: "Clear STAR format response",
                depth: "Demonstrates problem-solving and resilience",
                relevance: "Applicable to the target role"
            }
        },
        {
            questionText: "Describe a time when you had to work with a difficult team member. How did you handle it?",
            category: "Behavioral",
            difficulty: difficulty,
            keyPoints: [
                "Situation description",
                "Communication approach",
                "Conflict resolution strategy",
                "Outcome and relationship improvement"
            ],
            evaluationCriteria: {
                clarity: "Honest and professional response",
                depth: "Shows emotional intelligence",
                relevance: "Demonstrates teamwork skills"
            }
        },
        {
            questionText: "How do you prioritize tasks when you have multiple deadlines?",
            category: "Behavioral",
            difficulty: difficulty,
            keyPoints: [
                "Prioritization framework",
                "Communication with stakeholders",
                "Time management techniques",
                "Handling competing priorities"
            ],
            evaluationCriteria: {
                clarity: "Clear methodology explained",
                depth: "Shows organizational skills",
                relevance: "Practical and effective approach"
            }
        }
    ];

    const situationalQuestions = [
        {
            questionText: `If you were hired for this ${jobRole} position, what would you focus on in your first 90 days?`,
            category: "Situational",
            difficulty: difficulty,
            keyPoints: [
                "Learning and onboarding plan",
                "Relationship building",
                "Quick wins identification",
                "Long-term strategy alignment"
            ],
            evaluationCriteria: {
                clarity: "Well-structured 90-day plan",
                depth: "Shows strategic thinking",
                relevance: "Aligned with role expectations"
            }
        },
        {
            questionText: "How would you handle a situation where you disagree with a technical decision made by your team lead?",
            category: "Situational",
            difficulty: difficulty,
            keyPoints: [
                "Respectful communication",
                "Data-driven arguments",
                "Willingness to understand other perspectives",
                "Team collaboration"
            ],
            evaluationCriteria: {
                clarity: "Professional approach outlined",
                depth: "Shows maturity and diplomacy",
                relevance: "Demonstrates good judgment"
            }
        }
    ];

    let selectedQuestions = [];

    if (interviewType === "Technical") {
        selectedQuestions = technicalQuestions.slice(0, questionCount);
    } else if (interviewType === "Behavioral") {
        selectedQuestions = behavioralQuestions.slice(0, questionCount);
    } else {
        // Mixed: combine both types
        const techCount = Math.ceil(questionCount / 2);
        const behavioralCount = questionCount - techCount;
        selectedQuestions = [
            ...technicalQuestions.slice(0, techCount),
            ...behavioralQuestions.slice(0, behavioralCount)
        ];
    }

    // Add situational questions if we need more
    while (selectedQuestions.length < questionCount) {
        selectedQuestions.push(situationalQuestions[selectedQuestions.length % situationalQuestions.length]);
    }

    return selectedQuestions.slice(0, questionCount);
};
