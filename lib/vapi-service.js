import Vapi from "@vapi-ai/web";

let vapiInstance = null;

/**
 * Get or create Vapi instance
 */
export function getVapiInstance() {
    if (!vapiInstance) {
        const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
        if (!publicKey) {
            console.error("Vapi public key is missing!");
            throw new Error("NEXT_PUBLIC_VAPI_PUBLIC_KEY is not set");
        }
        console.log("Initializing Vapi with key (starts with):", publicKey.substring(0, 5) + "...");
        vapiInstance = new Vapi(publicKey);
    }
    return vapiInstance;
}

/**
 * Start a voice interview call
 */
export async function startVoiceInterview(assistantConfig) {
    const vapi = getVapiInstance();

    try {
        await vapi.start(assistantConfig);
        return true;
    } catch (error) {
        console.error("Error starting voice interview:", error);
        throw error;
    }
}

/**
 * Stop the current voice interview call
 */
export async function stopVoiceInterview() {
    const vapi = getVapiInstance();

    try {
        await vapi.stop();
        return true;
    } catch (error) {
        console.error("Error stopping voice interview:", error);
        throw error;
    }
}

/**
 * Check if Vapi is currently in a call
 */
export function isInCall() {
    if (!vapiInstance) return false;
    return vapiInstance.isMuted !== undefined;
}

/**
 * Mute/unmute the microphone
 */
export function toggleMute() {
    const vapi = getVapiInstance();
    if (vapi.isMuted) {
        vapi.setMuted(false);
    } else {
        vapi.setMuted(true);
    }
    return !vapi.isMuted;
}

/**
 * Create assistant configuration for interview
 */
export function createInterviewAssistant(question, sessionContext) {
    return {
        name: "Interview Assistant",
        model: {
            provider: "openai",
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are a professional interview assistant. The candidate will answer the following question. Listen carefully and acknowledge their response when they finish speaking.

Question: ${question}

Be encouraging and professional. When the candidate finishes, briefly acknowledge their answer and let them know they can move to the next question.`
                }
            ],
            temperature: 0.7,
        },
        voice: {
            provider: "openai",
            voiceId: "alloy"
        },
        firstMessage: `Here's your question: ${question}. Please take your time to answer.`,
        transcriber: {
            provider: "deepgram",
            model: "nova-2",
            language: "en-US"
        },
        endCallFunctionEnabled: false,
        recordingEnabled: true,
        silenceTimeoutSeconds: 30,
        maxDurationSeconds: 300,
    };
}
