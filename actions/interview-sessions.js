"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

/**
 * Create a new interview session
 */
export async function createInterviewSession(sessionData) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    try {
        console.log("Creating interview session with data:", {
            userId: user.id,
            jobRole: sessionData.jobRole,
            interviewType: sessionData.interviewType,
            difficulty: sessionData.difficulty,
        });

        const session = await db.interviewSession.create({
            data: {
                userId: user.id,
                jobRole: sessionData.jobRole,
                jobDescription: sessionData.jobDescription,
                companyName: sessionData.companyName || null,
                interviewType: sessionData.interviewType,
                difficulty: sessionData.difficulty || "Medium",
                duration: sessionData.duration || null,
                focusAreas: sessionData.focusAreas || [],
                status: "pending",
            },
        });

        console.log("Interview session created successfully:", session.id);
        return session;
    } catch (error) {
        console.error("Error creating interview session:", error);
        console.error("Error details:", {
            name: error.name,
            message: error.message,
            code: error.code,
            meta: error.meta,
        });
        throw new Error(`Failed to create interview session: ${error.message}`);
    }
}

/**
 * Get all interview sessions for the current user
 */
export async function getInterviewSessions(limit = 10, offset = 0) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    try {
        const sessions = await db.interviewSession.findMany({
            where: {
                userId: user.id,
            },
            include: {
                feedback: {
                    select: {
                        overallScore: true,
                        communicationScore: true,
                    },
                },
                _count: {
                    select: {
                        questions: true,
                        responses: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            take: limit,
            skip: offset,
        });

        return sessions;
    } catch (error) {
        console.error("Error fetching interview sessions:", error);
        throw new Error("Failed to fetch interview sessions");
    }
}

/**
 * Get a specific interview session by ID with all related data
 */
export async function getInterviewSessionById(sessionId) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    try {
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
                feedback: true,
            },
        });

        if (!session) throw new Error("Interview session not found");

        return session;
    } catch (error) {
        console.error("Error fetching interview session:", error);
        throw new Error("Failed to fetch interview session");
    }
}

/**
 * Update interview session status
 */
export async function updateInterviewSessionStatus(sessionId, status) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    try {
        const updateData = {
            status,
            updatedAt: new Date(),
        };

        // Add timestamps based on status
        if (status === "in_progress" && !updateData.startedAt) {
            updateData.startedAt = new Date();
        } else if (status === "completed") {
            updateData.completedAt = new Date();
        }

        const session = await db.interviewSession.updateMany({
            where: {
                id: sessionId,
                userId: user.id,
            },
            data: updateData,
        });

        return session;
    } catch (error) {
        console.error("Error updating interview session status:", error);
        throw new Error("Failed to update interview session status");
    }
}

/**
 * Delete an interview session and all related data
 */
export async function deleteInterviewSession(sessionId) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    try {
        // Cascade delete will handle related questions, responses, and feedback
        const session = await db.interviewSession.deleteMany({
            where: {
                id: sessionId,
                userId: user.id,
            },
        });

        return session;
    } catch (error) {
        console.error("Error deleting interview session:", error);
        throw new Error("Failed to delete interview session");
    }
}

/**
 * Get interview statistics for the current user
 */
export async function getInterviewStats() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    try {
        const sessions = await db.interviewSession.findMany({
            where: {
                userId: user.id,
                status: "completed",
            },
            include: {
                feedback: {
                    select: {
                        overallScore: true,
                        technicalScore: true,
                        behavioralScore: true,
                        communicationScore: true,
                    },
                },
            },
        });

        const totalInterviews = sessions.length;
        const averageScore =
            totalInterviews > 0
                ? sessions.reduce(
                    (sum, s) => sum + (s.feedback?.overallScore || 0),
                    0
                ) / totalInterviews
                : 0;

        const averageCommunicationScore =
            totalInterviews > 0
                ? sessions.reduce(
                    (sum, s) => sum + (s.feedback?.communicationScore || 0),
                    0
                ) / totalInterviews
                : 0;

        return {
            totalInterviews,
            averageScore: parseFloat(averageScore.toFixed(2)),
            averageCommunicationScore: parseFloat(
                averageCommunicationScore.toFixed(2)
            ),
            completedInterviews: totalInterviews,
        };
    } catch (error) {
        console.error("Error fetching interview stats:", error);
        throw new Error("Failed to fetch interview stats");
    }
}
