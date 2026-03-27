"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Play,
    CheckCircle,
    Clock,
    Trash2,
    Eye,
    XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { deleteInterviewSession } from "@/actions/interview-sessions";
import useFetch from "@/hooks/use-fetch";
import { useState } from "react";
import InterviewRoomDialog from "./interview-room-dialog";
import FeedbackDialog from "./feedback-dialog";

export default function SessionList({ sessions }) {
    const router = useRouter();
    const [selectedSession, setSelectedSession] = useState(null);
    const [showInterviewRoom, setShowInterviewRoom] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);

    const { loading: deleting, fn: deleteSessionFn } = useFetch(
        deleteInterviewSession
    );

    const handleDelete = async (sessionId) => {
        if (!confirm("Are you sure you want to delete this interview session?")) {
            return;
        }

        try {
            await deleteSessionFn(sessionId);
            toast.success("Interview session deleted");
            router.refresh();
        } catch (error) {
            toast.error(error.message || "Failed to delete session");
        }
    };

    const handleStartInterview = (session) => {
        setSelectedSession(session);
        setShowInterviewRoom(true);
    };

    const handleViewFeedback = (session) => {
        setSelectedSession(session);
        setShowFeedback(true);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "completed":
                return (
                    <Badge className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                    </Badge>
                );
            case "in_progress":
                return (
                    <Badge className="bg-blue-500">
                        <Clock className="h-3 w-3 mr-1" />
                        In Progress
                    </Badge>
                );
            case "cancelled":
                return (
                    <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Cancelled
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                    </Badge>
                );
        }
    };

    if (!sessions || sessions.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                        No interview sessions yet. Create your first interview to get
                        started!
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {sessions.map((session) => (
                    <Card key={session.id}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl">{session.jobRole}</CardTitle>
                                    <CardDescription>
                                        {session.companyName && `${session.companyName} • `}
                                        {session.interviewType} Interview • {session.difficulty}{" "}
                                        Level
                                    </CardDescription>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span>
                                            Created {format(new Date(session.createdAt), "PPP")}
                                        </span>
                                        {session._count && (
                                            <>
                                                <span>•</span>
                                                <span>{session._count.questions} questions</span>
                                                <span>•</span>
                                                <span>{session._count.responses} responses</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                {getStatusBadge(session.status)}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {session.feedback && (
                                        <div className="text-sm">
                                            <span className="text-muted-foreground">Score: </span>
                                            <span className="font-semibold text-lg">
                                                {session.feedback.overallScore.toFixed(1)}/10
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {session.status === "completed" && session.feedback && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleViewFeedback(session)}
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            View Feedback
                                        </Button>
                                    )}
                                    {(session.status === "pending" ||
                                        session.status === "in_progress") && (
                                            <Button
                                                size="sm"
                                                onClick={() => handleStartInterview(session)}
                                            >
                                                <Play className="h-4 w-4 mr-2" />
                                                {session.status === "in_progress"
                                                    ? "Continue"
                                                    : "Start Interview"}
                                            </Button>
                                        )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(session.id)}
                                        disabled={deleting}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Interview Room Dialog */}
            {selectedSession && (
                <InterviewRoomDialog
                    session={selectedSession}
                    open={showInterviewRoom}
                    onOpenChange={setShowInterviewRoom}
                />
            )}

            {/* Feedback Dialog */}
            {selectedSession && (
                <FeedbackDialog
                    session={selectedSession}
                    open={showFeedback}
                    onOpenChange={setShowFeedback}
                />
            )}
        </>
    );
}
