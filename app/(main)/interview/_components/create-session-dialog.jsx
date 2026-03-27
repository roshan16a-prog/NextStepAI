"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createInterviewSession } from "@/actions/interview-sessions";
import { generateInterviewQuestions } from "@/actions/interview-ai";
import useFetch from "@/hooks/use-fetch";
import { BarLoader } from "react-spinners";

export default function CreateSessionDialog({ open, onOpenChange }) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        jobRole: "",
        jobDescription: "",
        companyName: "",
        interviewType: "Mixed",
        difficulty: "Medium",
        duration: 30,
    });

    const {
        loading: creating,
        fn: createSessionFn,
    } = useFetch(createInterviewSession);

    const {
        loading: generatingQuestions,
        fn: generateQuestionsFn,
    } = useFetch(generateInterviewQuestions);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.jobRole || !formData.jobDescription) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            // Create session
            const session = await createSessionFn(formData);

            if (!session) {
                throw new Error("Failed to create session");
            }

            toast.success("Interview session created!");

            // Generate questions in background
            try {
                await generateQuestionsFn(
                    session.id,
                    formData.jobRole,
                    formData.jobDescription,
                    formData.interviewType,
                    formData.difficulty
                );
                toast.success("Interview questions generated!");
            } catch (error) {
                console.error("Error generating questions:", error);
                toast.error("Session created but failed to generate questions");
            }

            // Reset form and close dialog
            setFormData({
                jobRole: "",
                jobDescription: "",
                companyName: "",
                interviewType: "Mixed",
                difficulty: "Medium",
                duration: 30,
            });
            onOpenChange(false);

            // Refresh the page to show new session
            router.refresh();
        } catch (error) {
            console.error("Error creating session:", error);
            toast.error(error.message || "Failed to create interview session");
        }
    };

    const isLoading = creating || generatingQuestions;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Interview Session</DialogTitle>
                    <DialogDescription>
                        Set up your AI interview by providing job details and preferences
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Job Role */}
                    <div className="space-y-2">
                        <Label htmlFor="jobRole">
                            Job Role <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="jobRole"
                            placeholder="e.g., Senior Software Engineer"
                            value={formData.jobRole}
                            onChange={(e) =>
                                setFormData({ ...formData, jobRole: e.target.value })
                            }
                            required
                        />
                    </div>

                    {/* Company Name */}
                    <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name (Optional)</Label>
                        <Input
                            id="companyName"
                            placeholder="e.g., Google"
                            value={formData.companyName}
                            onChange={(e) =>
                                setFormData({ ...formData, companyName: e.target.value })
                            }
                        />
                    </div>

                    {/* Job Description */}
                    <div className="space-y-2">
                        <Label htmlFor="jobDescription">
                            Job Description <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="jobDescription"
                            placeholder="Paste the job description or key requirements..."
                            value={formData.jobDescription}
                            onChange={(e) =>
                                setFormData({ ...formData, jobDescription: e.target.value })
                            }
                            rows={6}
                            required
                        />
                    </div>

                    {/* Interview Type */}
                    <div className="space-y-2">
                        <Label htmlFor="interviewType">Interview Type</Label>
                        <Select
                            value={formData.interviewType}
                            onValueChange={(value) =>
                                setFormData({ ...formData, interviewType: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Technical">Technical</SelectItem>
                                <SelectItem value="Behavioral">Behavioral</SelectItem>
                                <SelectItem value="Mixed">Mixed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Difficulty */}
                    <div className="space-y-2">
                        <Label htmlFor="difficulty">Difficulty Level</Label>
                        <Select
                            value={formData.difficulty}
                            onValueChange={(value) =>
                                setFormData({ ...formData, difficulty: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Easy">Easy (5 questions)</SelectItem>
                                <SelectItem value="Medium">Medium (6 questions)</SelectItem>
                                <SelectItem value="Hard">Hard (8 questions)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Duration */}
                    <div className="space-y-2">
                        <Label htmlFor="duration">Expected Duration (minutes)</Label>
                        <Input
                            id="duration"
                            type="number"
                            min="15"
                            max="90"
                            value={formData.duration}
                            onChange={(e) =>
                                setFormData({ ...formData, duration: parseInt(e.target.value) })
                            }
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <BarLoader className="mr-2" color="white" />}
                            {creating
                                ? "Creating..."
                                : generatingQuestions
                                    ? "Generating Questions..."
                                    : "Create Interview"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
