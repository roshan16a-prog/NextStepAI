import { Brain, Target, Trophy, Video } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StatsCards({ assessments, interviewStats }) {
  const getAverageScore = () => {
    if (!assessments?.length) return 0;
    const total = assessments.reduce(
      (sum, assessment) => sum + assessment.quizScore,
      0
    );
    return (total / assessments.length).toFixed(1);
  };

  const getLatestAssessment = () => {
    if (!assessments?.length) return null;
    return assessments[0];
  };

  const getTotalQuestions = () => {
    if (!assessments?.length) return 0;
    return assessments.reduce(
      (sum, assessment) => sum + assessment.questions.length,
      0
    );
  };

  // Calculate combined score from both quiz and interviews
  const getCombinedScore = () => {
    const quizAvg = parseFloat(getAverageScore()) || 0;
    const interviewAvg = interviewStats?.averageScore || 0;

    if (quizAvg === 0 && interviewAvg === 0) return 0;
    if (quizAvg === 0) return interviewAvg.toFixed(1);
    if (interviewAvg === 0) return quizAvg;

    // Average of both (quiz is out of 100, interview out of 10)
    const normalizedQuiz = quizAvg / 10;
    return ((normalizedQuiz + interviewAvg) / 2).toFixed(1);
  };

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Combined Score</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getCombinedScore()}/10</div>
          <p className="text-xs text-muted-foreground">
            Quiz + Interview Average
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Quiz Average</CardTitle>
          <Brain className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getAverageScore()}%</div>
          <p className="text-xs text-muted-foreground">
            {getTotalQuestions()} questions practiced
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Interview Score
          </CardTitle>
          <Video className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {interviewStats?.averageScore?.toFixed(1) || 0}/10
          </div>
          <p className="text-xs text-muted-foreground">
            {interviewStats?.totalInterviews || 0} interviews completed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Latest Score</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {getLatestAssessment()?.quizScore.toFixed(1) || 0}%
          </div>
          <p className="text-xs text-muted-foreground">Most recent quiz</p>
        </CardContent>
      </Card>
    </div>
  );
}
