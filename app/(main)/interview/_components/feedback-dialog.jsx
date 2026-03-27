"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2, TrendingUp, TrendingDown, CheckCircle2 } from "lucide-react";
import { getInterviewFeedback } from "@/actions/interview-ai";
import useFetch from "@/hooks/use-fetch";
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer,
} from "recharts";

export default function FeedbackDialog({ session, open, onOpenChange }) {
    const [feedback, setFeedback] = useState(null);

    const { loading, fn: loadFeedbackFn } = useFetch(getInterviewFeedback);

    useEffect(() => {
        if (open && session) {
            loadFeedback();
        }
    }, [open, session]);

    const loadFeedback = async () => {
        try {
            const feedbackData = await loadFeedbackFn(session.id);
            setFeedback(feedbackData);
        } catch (error) {
            console.error("Error loading feedback:", error);
        }
    };

    if (loading) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Loading Feedback</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (!feedback) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>No Feedback Available</DialogTitle>
                        <DialogDescription>
                            Feedback hasn't been generated for this interview yet.
                        </DialogDescription>
                    </DialogHeader>
                    <Button onClick={() => onOpenChange(false)}>Close</Button>
                </DialogContent>
            </Dialog>
        );
    }

    // Prepare radar chart data
    const radarData = [];
    if (feedback.technicalScore !== null) {
        radarData.push({
            category: "Technical",
            score: feedback.technicalScore,
        });
    }
    if (feedback.behavioralScore !== null) {
        radarData.push({
            category: "Behavioral",
            score: feedback.behavioralScore,
        });
    }
    radarData.push({
        category: "Communication",
        score: feedback.communicationScore,
    });

    const getScoreColor = (score) => {
        if (score >= 8) return "text-green-600";
        if (score >= 6) return "text-yellow-600";
        return "text-red-600";
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Interview Feedback - {session.jobRole}</DialogTitle>
                    <DialogDescription>
                        Comprehensive analysis of your interview performance
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Overall Score */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Overall Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <div
                                        className={`text-5xl font-bold ${getScoreColor(
                                            feedback.overallScore
                                        )}`}
                                    >
                                        {feedback.overallScore.toFixed(1)}
                                        <span className="text-2xl text-muted-foreground">/10</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Overall Score
                                    </p>
                                </div>
                                <div className="w-64">
                                    <ResponsiveContainer width="100%" height={200}>
                                        <RadarChart data={radarData}>
                                            <PolarGrid />
                                            <PolarAngleAxis dataKey="category" />
                                            <PolarRadiusAxis angle={90} domain={[0, 10]} />
                                            <Radar
                                                name="Score"
                                                dataKey="score"
                                                stroke="#8884d8"
                                                fill="#8884d8"
                                                fillOpacity={0.6}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <p className="text-sm">{feedback.overallSummary}</p>
                        </CardContent>
                    </Card>

                    {/* Category Scores */}
                    <div className="grid gap-4 md:grid-cols-3">
                        {feedback.technicalScore !== null && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium">
                                        Technical Skills
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {feedback.technicalScore.toFixed(1)}/10
                                    </div>
                                    <Progress
                                        value={feedback.technicalScore * 10}
                                        className="mt-2"
                                    />
                                </CardContent>
                            </Card>
                        )}
                        {feedback.behavioralScore !== null && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium">
                                        Behavioral
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {feedback.behavioralScore.toFixed(1)}/10
                                    </div>
                                    <Progress
                                        value={feedback.behavioralScore * 10}
                                        className="mt-2"
                                    />
                                </CardContent>
                            </Card>
                        )}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">
                                    Communication
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {feedback.communicationScore.toFixed(1)}/10
                                </div>
                                <Progress
                                    value={feedback.communicationScore * 10}
                                    className="mt-2"
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Strengths */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                                Strengths
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {feedback.strengths.map((strength, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span>{strength}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Areas for Improvement */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingDown className="h-5 w-5 text-orange-600" />
                                Areas for Improvement
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {feedback.improvements.map((improvement, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <span className="text-orange-600 mt-0.5 flex-shrink-0">
                                            •
                                        </span>
                                        <span>{improvement}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Recommendations */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recommendations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {feedback.recommendations.map((recommendation, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <Badge variant="outline" className="mt-0.5">
                                            {idx + 1}
                                        </Badge>
                                        <span>{recommendation}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Question-by-Question Analysis */}
                    {feedback.questionAnalysis && feedback.questionAnalysis.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Question-by-Question Analysis</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    {feedback.questionAnalysis.map((analysis, idx) => (
                                        <AccordionItem key={idx} value={`question-${idx}`}>
                                            <AccordionTrigger>
                                                <div className="flex items-center justify-between w-full pr-4">
                                                    <span>Question {idx + 1}</span>
                                                    <Badge
                                                        variant={
                                                            analysis.score >= 7 ? "default" : "secondary"
                                                        }
                                                    >
                                                        {analysis.score}/10
                                                    </Badge>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="space-y-3 pt-2">
                                                    <p className="text-sm">{analysis.feedback}</p>
                                                    {analysis.keyPointsCovered &&
                                                        analysis.keyPointsCovered.length > 0 && (
                                                            <div>
                                                                <p className="text-sm font-medium mb-2">
                                                                    Key Points Covered:
                                                                </p>
                                                                <ul className="text-sm space-y-1">
                                                                    {analysis.keyPointsCovered.map((point, i) => (
                                                                        <li
                                                                            key={i}
                                                                            className="text-muted-foreground"
                                                                        >
                                                                            ✓ {point}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>
                    )}

                    {/* Close Button */}
                    <div className="flex justify-end">
                        <Button onClick={() => onOpenChange(false)}>Close</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
