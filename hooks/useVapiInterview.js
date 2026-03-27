"use client";

import { useState, useEffect, useCallback } from "react";
import { getVapiInstance, createInterviewAssistant } from "@/lib/vapi-service";
import { toast } from "sonner";

export default function useVapiInterview() {
    const [vapi, setVapi] = useState(null);
    const [isCallActive, setIsCallActive] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [callDuration, setCallDuration] = useState(0);

    useEffect(() => {
        // Initialize Vapi instance
        try {
            const vapiInstance = getVapiInstance();
            setVapi(vapiInstance);

            // Set up event listeners
            vapiInstance.on("call-start", () => {
                console.log("Call started");
                setIsCallActive(true);
                toast.success("Voice interview started");
            });

            vapiInstance.on("call-end", () => {
                console.log("Call ended");
                setIsCallActive(false);
                setIsSpeaking(false);
                toast.info("Voice interview ended");
            });

            vapiInstance.on("speech-start", () => {
                console.log("User started speaking");
                setIsSpeaking(true);
            });

            vapiInstance.on("speech-end", () => {
                console.log("User stopped speaking");
                setIsSpeaking(false);
            });

            vapiInstance.on("message", (message) => {
                console.log("Message received:", message);
                if (message.type === "transcript" && message.role === "user") {
                    setTranscript((prev) => prev + " " + message.transcript);
                }
            });

            vapiInstance.on("error", (error) => {
                console.error("Vapi error:", JSON.stringify(error, null, 2));
                setIsCallActive(false);
                setIsSpeaking(false);

                // Don't show toast for "Meeting has ended" as it's expected
                if (!error.message?.includes("Meeting has ended")) {
                    toast.error("Voice error: " + (error.message || "Unknown error"));
                }
            });

            // Track call duration
            let durationInterval;
            vapiInstance.on("call-start", () => {
                setCallDuration(0);
                durationInterval = setInterval(() => {
                    setCallDuration((prev) => prev + 1);
                }, 1000);
            });

            vapiInstance.on("call-end", () => {
                if (durationInterval) {
                    clearInterval(durationInterval);
                }
            });

            return () => {
                if (durationInterval) {
                    clearInterval(durationInterval);
                }
            };
        } catch (error) {
            console.error("Error initializing Vapi:", error);
            toast.error("Failed to initialize voice interview");
        }
    }, []);

    const startInterview = useCallback(
        async (question, sessionContext) => {
            if (!vapi) {
                toast.error("Voice service not initialized");
                return false;
            }

            try {
                const assistantConfig = createInterviewAssistant(question, sessionContext);
                console.log("Starting Vapi with config:", JSON.stringify(assistantConfig, null, 2));

                await vapi.start(assistantConfig);
                setTranscript(""); // Reset transcript for new question
                return true;
            } catch (error) {
                console.error("Error starting interview:", JSON.stringify(error, null, 2));

                let errorMessage = "Failed to start voice interview";
                if (error.message) {
                    errorMessage += `: ${error.message}`;
                }

                toast.error(errorMessage);
                return false;
            }
        },
        [vapi]
    );

    const stopInterview = useCallback(async () => {
        if (!vapi) return false;

        try {
            await vapi.stop();
            return true;
        } catch (error) {
            console.error("Error stopping interview:", error);
            toast.error("Failed to stop voice interview");
            return false;
        }
    }, [vapi]);

    const toggleMute = useCallback(() => {
        if (!vapi) return false;

        try {
            const newMutedState = !vapi.isMuted;
            vapi.setMuted(newMutedState);
            toast.info(newMutedState ? "Microphone muted" : "Microphone unmuted");
            return newMutedState;
        } catch (error) {
            console.error("Error toggling mute:", error);
            return false;
        }
    }, [vapi]);

    return {
        isCallActive,
        isSpeaking,
        transcript,
        callDuration,
        startInterview,
        stopInterview,
        toggleMute,
    };
}
