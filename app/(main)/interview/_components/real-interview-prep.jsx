"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Plus } from "lucide-react";
import CreateSessionDialog from "./create-session-dialog";
import SessionList from "./session-list";

export default function RealInterviewPrep({ sessions }) {
    const [showCreateDialog, setShowCreateDialog] = useState(false);

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Real Interview Preparation</CardTitle>
                            <CardDescription>
                                Practice with AI-powered voice interviews and get comprehensive
                                feedback
                            </CardDescription>
                        </div>
                        <Button onClick={() => setShowCreateDialog(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            New Interview
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="p-4 border rounded-lg">
                            <div className="text-2xl font-bold">
                                {sessions?.length || 0}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Total Interviews
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <div className="text-2xl font-bold">
                                {sessions?.filter((s) => s.status === "completed").length || 0}
                            </div>
                            <p className="text-sm text-muted-foreground">Completed</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <div className="text-2xl font-bold">
                                {sessions?.filter((s) => s.status === "pending").length || 0}
                            </div>
                            <p className="text-sm text-muted-foreground">Pending</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Sessions List */}
            <SessionList sessions={sessions} />

            {/* Create Session Dialog */}
            <CreateSessionDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
            />
        </div>
    );
}
