import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Flame, 
  Calendar, 
  Trophy, 
  Users, 
  CheckCircle2, 
  Clock,
  Target,
  TrendingUp 
} from "lucide-react";
import Header from "@/components/Header";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const { user } = useAuth();
  const { userChallenges, todaysTasks, loading, markTaskComplete } = useUserProgress();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading your progress...</div>
        </main>
      </div>
    );
  }

  const activeChallenge = userChallenges[0];
  
  const getDaysCompleted = (challenge: any) => {
    if (!challenge) return 0;
    const joinDate = new Date(challenge.joined_at);
    return Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const getCompletedTasksToday = () => {
    return todaysTasks.filter(task => task.completed).length;
  };

  const achievements = [
    { name: "First Week", icon: Trophy, earned: activeChallenge && getDaysCompleted(activeChallenge) >= 7 },
    { name: "Streak Master", icon: Flame, earned: activeChallenge && getDaysCompleted(activeChallenge) >= 5 },
    { name: "Halfway Hero", icon: Target, earned: activeChallenge && getDaysCompleted(activeChallenge) >= Math.floor(activeChallenge.challenges.duration_days / 2) },
    { name: "Challenge Complete", icon: CheckCircle2, earned: activeChallenge?.is_completed || false }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.user_metadata?.display_name || 'Challenger'}!</h1>
          <p className="text-muted-foreground">
            {userChallenges.length > 0 
              ? "Keep pushing towards your goals. You're doing amazing!" 
              : "Ready to start your first challenge? Let's get you started!"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Active Challenge */}
          {activeChallenge ? (
            <Card className="lg:col-span-2 shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-primary" />
                    <span>{activeChallenge.challenges.title}</span>
                  </CardTitle>
                  <Badge variant="outline" className="bg-accent/20 text-accent">
                    Day {getDaysCompleted(activeChallenge)} of {activeChallenge.challenges.duration_days}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round((getDaysCompleted(activeChallenge) / activeChallenge.challenges.duration_days) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={(getDaysCompleted(activeChallenge) / activeChallenge.challenges.duration_days) * 100} 
                      className="h-2"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-2 mx-auto">
                        <Flame className="w-6 h-6 text-primary" />
                      </div>
                      <div className="text-2xl font-bold text-primary">{getDaysCompleted(activeChallenge)}</div>
                      <div className="text-xs text-muted-foreground">Days Active</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-accent/10 rounded-lg mb-2 mx-auto">
                        <CheckCircle2 className="w-6 h-6 text-accent" />
                      </div>
                      <div className="text-2xl font-bold text-accent">
                        {getCompletedTasksToday()}/{todaysTasks.length}
                      </div>
                      <div className="text-xs text-muted-foreground">Today's Tasks</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-secondary rounded-lg mb-2 mx-auto">
                        <Target className="w-6 h-6 text-secondary-foreground" />
                      </div>
                      <div className="text-2xl font-bold">{activeChallenge.challenges.category}</div>
                      <div className="text-xs text-muted-foreground">Category</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="lg:col-span-2 shadow-card">
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Active Challenges</h3>
                  <p className="text-muted-foreground mb-4">Join a challenge to start tracking your progress!</p>
                  <Button variant="default">Browse Challenges</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      achievement.earned 
                        ? 'bg-accent text-accent-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <achievement.icon className="w-4 h-4" />
                    </div>
                    <span className={`text-sm ${
                      achievement.earned ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {achievement.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Tasks */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span>Today's Tasks</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todaysTasks.length > 0 ? (
              <div className="space-y-3">
                {todaysTasks.map((task, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => markTaskComplete(task.participantId, !task.completed)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          task.completed 
                            ? 'bg-accent border-accent text-accent-foreground' 
                            : 'border-muted-foreground hover:border-accent'
                        }`}
                      >
                        {task.completed && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                      <span className={`${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No tasks for today. Join a challenge to get started!</p>
              </div>
            )}
            
            {todaysTasks.length > 0 && (
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {getCompletedTasksToday() === todaysTasks.length 
                      ? "All tasks completed! Great job!" 
                      : "Complete remaining tasks to maintain your streak!"}
                  </div>
                  <Button variant="hero" size="sm">
                    View Progress
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;