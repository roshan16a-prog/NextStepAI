"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

/**
 * Save an interview response
 */
export async function saveInterviewResponse(
    sessionId,
    questionId,
    transcription,
    audioUrl = null,
    duration = null,
    confidence = null
) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    try {
        // Verify session belongs to user
        const session = await db.interviewSession.findFirst({
            where: {
                id: sessionId,
                userId: user.id,
            },
        });

        if (!session) throw new Error("Interview session not found");

        const response = await db.interviewResponse.create({
            data: {
                sessionId,
                questionId,
                transcription,
                audioUrl,
                duration,
                confidence,
            },
        });

        return response;
    } catch (error) {
        console.error("Error saving interview response:", error);
        throw new Error("Failed to save interview response");
    }
}

/**
 * Get all responses for a session
 */
export async function getSessionResponses(sessionId) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    try {
        const responses = await db.interviewResponse.findMany({
            where: {
                sessionId,
                session: {
                    userId: user.id,
                },
            },
            include: {
                question: true,
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        return responses;
    } catch (error) {
        console.error("Error fetching session responses:", error);
        throw new Error("Failed to fetch session responses");
    }
}

/**
 * Update response transcription (useful for real-time updates from Vapi.ai)
 */
export async function updateResponseTranscription(
    responseId,
    transcription,
    confidence = null
) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    try {
        const response = await db.interviewResponse.updateMany({
            where: {
                id: responseId,
                session: {
                    userId: user.id,
                },
            },
            data: {
                transcription,
                confidence,
                updatedAt: new Date(),
            },
        });

        return response;
    } catch (error) {
        console.error("Error updating response transcription:", error);
        throw new Error("Failed to update response transcription");
    }
}

/**
 * Delete a response
 */
export async function deleteInterviewResponse(responseId) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    try {
        const response = await db.interviewResponse.deleteMany({
            where: {
                id: responseId,
                session: {
                    userId: user.id,
                },
            },
        });

        return response;
    } catch (error) {
        console.error("Error deleting interview response:", error);
        throw new Error("Failed to delete interview response");
    }
}
