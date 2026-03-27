"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Send, Loader2 } from "lucide-react";
import {
    getInterviewSessionById,
    updateInterviewSessionStatus,
} from "@/actions/interview-sessions";
import {
    saveInterviewResponse,
    getSessionResponses,
} from "@/actions/interview-responses";
import { generateInterviewFeedback } from "@/actions/interview-ai";
import useFetch from "@/hooks/use-fetch";
import useVapiInterview from "@/hooks/useVapiInterview";

export default function InterviewRoomDialog({ session, open, onOpenChange }) {
    const router = useRouter();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [responses, setResponses] = useState([]);
    const [currentAnswer, setCurrentAnswer] = useState("");
    const [isRecording, setIsRecording] = useState(false);

    const { loading: loadingSession, fn: loadSessionFn } = useFetch(
        getInterviewSessionById
    );
    const { loading: savingResponse, fn: saveResponseFn } = useFetch(
        saveInterviewResponse
    );
    const { loading: generatingFeedback, fn: generateFeedbackFn } = useFetch(
        generateInterviewFeedback
    );

    // Voice interview hook
    const {
        isCallActive,
        isSpeaking,
        transcript,
        callDuration,
        startInterview,
        stopInterview,
        toggleMute,
    } = useVapiInterview();

    // Update current answer with voice transcript
    useEffect(() => {
        if (transcript) {
            setCurrentAnswer(transcript);
        }
    }, [transcript]);

    useEffect(() => {
        if (open && session) {
            loadSession();
        }
    }, [open, session]);

    const loadSession = async () => {
        try {
            const sessionData = await loadSessionFn(session.id);

            if (!sessionData) {
                toast.error("Session not found");
                onOpenChange(false);
                return;
            }

            setQuestions(sessionData.questions || []);
            setResponses(sessionData.responses || []);

            // Find the first unanswered question
            const answeredQuestionIds = (sessionData.responses || []).map(
                (r) => r.questionId
            );
            const nextQuestionIndex = (sessionData.questions || []).findIndex(
                (q) => !answeredQuestionIds.includes(q.id)
            );
            setCurrentQuestionIndex(
                nextQuestionIndex >= 0 ? nextQuestionIndex : 0
            );

            // Update status to in_progress if pending
            if (session.status === "pending") {
                await updateInterviewSessionStatus(session.id, "in_progress");
            }
        } catch (error) {
            console.error("Error loading session:", error);
            toast.error("Failed to load interview session");
            onOpenChange(false);
        }
    };

    const handleSubmitAnswer = async () => {
        if (!currentAnswer.trim()) {
            toast.error("Please provide an answer");
            return;
        }

        const currentQuestion = questions[currentQuestionIndex];

        try {
            await saveResponseFn(
                session.id,
                currentQuestion.id,
                currentAnswer,
                null,
                null,
                null
            );

            toast.success("Answer saved!");
            setCurrentAnswer("");

            // Move to next question or finish
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
            } else {
                await finishInterview();
            }
        } catch (error) {
            console.error("Error saving answer:", error);
            toast.error("Failed to save answer");
        }
    };

    const finishInterview = async () => {
        try {
            // Update session status to completed
            await updateInterviewSessionStatus(session.id, "completed");

            toast.success("Interview completed! Generating feedback...");

            // Generate feedback
            await generateFeedbackFn(session.id);

            toast.success("Feedback generated successfully!");

            // Close dialog and refresh
            onOpenChange(false);
            router.refresh();
        } catch (error) {
            console.error("Error finishing interview:", error);
            toast.error("Interview completed but failed to generate feedback");
            onOpenChange(false);
            router.refresh();
        }
    };

    const toggleRecording = async () => {
        if (isCallActive) {
            // Stop the voice interview
            await stopInterview();
            setIsRecording(false);
        } else {
            // Start the voice interview
            const currentQuestion = questions[currentQuestionIndex];
            const sessionContext = {
                currentQuestionIndex,
                totalQuestions: questions.length,
                interviewType: session.interviewType,
                jobRole: session.jobRole,
            };

            const started = await startInterview(
                currentQuestion.questionText,
                sessionContext
            );

            if (started) {
                setIsRecording(true);
            }
        }
    };

    if (loadingSession) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Loading Interview</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (!questions || questions.length === 0) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>No Questions Available</DialogTitle>
                        <DialogDescription>
                            This interview session doesn't have any questions yet.
                        </DialogDescription>
                    </DialogHeader>
                    <Button onClick={() => onOpenChange(false)}>Close</Button>
                </DialogContent>
            </Dialog>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{session.jobRole} Interview</DialogTitle>
                    <DialogDescription>
                        Question {currentQuestionIndex + 1} of {questions.length}
                    </DialogDescription>
                </DialogHeader>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <Progress value={progress} />
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                </div>

                {/* Current Question */}
                <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{currentQuestion.category}</Badge>
                            <Badge variant="secondary">{currentQuestion.difficulty}</Badge>
                        </div>
                        <p className="text-lg font-medium">{currentQuestion.questionText}</p>
                    </div>

                    {/* Answer Input */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Your Answer</label>
                            <div className="flex items-center gap-2">
                                {isCallActive && isSpeaking && (
                                    <Badge variant="default" className="animate-pulse">
                                        Speaking...
                                    </Badge>
                                )}
                                {isCallActive && (
                                    <span className="text-xs text-muted-foreground">
                                        {Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, '0')}
                                    </span>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={toggleRecording}
                                    className={isCallActive ? "bg-red-500 text-white hover:bg-red-600" : ""}
                                >
                                    {isCallActive ? (
                                        <>
                                            <MicOff className="h-4 w-4 mr-2" />
                                            Stop Recording
                                        </>
                                    ) : (
                                        <>
                                            <Mic className="h-4 w-4 mr-2" />
                                            Voice Answer
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                        <Textarea
                            placeholder="Type your answer here or use voice recording..."
                            value={currentAnswer}
                            onChange={(e) => setCurrentAnswer(e.target.value)}
                            rows={8}
                            className="resize-none"
                        />
                    </div>

                    {/* Key Points Hint */}
                    {currentQuestion.keyPoints && currentQuestion.keyPoints.length > 0 && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                            <p className="text-sm font-medium mb-2">💡 Key Points to Cover:</p>
                            <ul className="text-sm space-y-1">
                                {currentQuestion.keyPoints.map((point, idx) => (
                                    <li key={idx} className="text-muted-foreground">
                                        • {point}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-between pt-4">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={savingResponse || generatingFeedback}
                        >
                            Save & Exit
                        </Button>
                        <Button
                            onClick={handleSubmitAnswer}
                            disabled={savingResponse || generatingFeedback || !currentAnswer.trim()}
                        >
                            {savingResponse || generatingFeedback ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4 mr-2" />
                            )}
                            {currentQuestionIndex < questions.length - 1
                                ? "Next Question"
                                : "Finish Interview"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
