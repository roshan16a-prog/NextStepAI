"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, ClipboardList, Video } from "lucide-react";

export default function InterviewTabs({ children }) {
    return (
        <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                </TabsTrigger>
                <TabsTrigger value="quiz" className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    <span className="hidden sm:inline">Quiz</span>
                </TabsTrigger>
                <TabsTrigger value="real-prep" className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    <span className="hidden sm:inline">Real Interview</span>
                </TabsTrigger>
            </TabsList>

            {children}
        </Tabs>
    );
}
