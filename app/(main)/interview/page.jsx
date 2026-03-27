import { getAssessments } from "@/actions/interview";
import { getInterviewSessions, getInterviewStats } from "@/actions/interview-sessions";
import StatsCards from "./_components/stats-cards";
import PerformanceChart from "./_components/performace-chart";
import QuizList from "./_components/quiz-list";
import Quiz from "./_components/quiz";
import { TabsContent } from "@/components/ui/tabs";
import InterviewTabs from "./_components/interview-tabs";
import RealInterviewPrep from "./_components/real-interview-prep";

export default async function InterviewPrepPage() {
  const assessments = await getAssessments();
  const interviewSessions = await getInterviewSessions(10, 0);
  const interviewStats = await getInterviewStats();

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-6xl font-bold gradient-title">
          Interview Preparation
        </h1>
      </div>

      <InterviewTabs>
        <TabsContent value="dashboard" className="space-y-6">
          <StatsCards
            assessments={assessments}
            interviewStats={interviewStats}
          />
          <PerformanceChart
            assessments={assessments}
            interviewSessions={interviewSessions}
          />
          <QuizList assessments={assessments} />
        </TabsContent>

        <TabsContent value="quiz">
          <Quiz />
        </TabsContent>

        <TabsContent value="real-prep">
          <RealInterviewPrep sessions={interviewSessions} />
        </TabsContent>
      </InterviewTabs>
    </div>
  );
}

