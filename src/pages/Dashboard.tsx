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

const Dashboard = () => {
  const activeChallenge = {
    name: "Ultimate Productivity",
    day: 12,
    totalDays: 30,
    streak: 8,
    completedToday: 3,
    totalTasks: 5,
    participants: 156
  };

  const todaysTasks = [
    { name: "Morning Exercise", completed: true, time: "7:00 AM" },
    { name: "Read 30 minutes", completed: true, time: "8:30 AM" },
    { name: "Healthy Lunch", completed: true, time: "12:00 PM" },
    { name: "Learn new skill", completed: false, time: "6:00 PM" },
    { name: "Evening reflection", completed: false, time: "9:00 PM" }
  ];

  const achievements = [
    { name: "First Week", icon: Trophy, earned: true },
    { name: "Streak Master", icon: Flame, earned: true },
    { name: "Halfway Hero", icon: Target, earned: false },
    { name: "Challenge Complete", icon: CheckCircle2, earned: false }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, Alex!</h1>
          <p className="text-muted-foreground">Keep pushing towards your goals. You're doing amazing!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Active Challenge */}
          <Card className="lg:col-span-2 shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-primary" />
                  <span>{activeChallenge.name}</span>
                </CardTitle>
                <Badge variant="outline" className="bg-accent/20 text-accent">
                  Day {activeChallenge.day} of {activeChallenge.totalDays}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round((activeChallenge.day / activeChallenge.totalDays) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(activeChallenge.day / activeChallenge.totalDays) * 100} 
                    className="h-2"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-2 mx-auto">
                      <Flame className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-primary">{activeChallenge.streak}</div>
                    <div className="text-xs text-muted-foreground">Day Streak</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-accent/10 rounded-lg mb-2 mx-auto">
                      <CheckCircle2 className="w-6 h-6 text-accent" />
                    </div>
                    <div className="text-2xl font-bold text-accent">
                      {activeChallenge.completedToday}/{activeChallenge.totalTasks}
                    </div>
                    <div className="text-xs text-muted-foreground">Today's Tasks</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-secondary rounded-lg mb-2 mx-auto">
                      <Users className="w-6 h-6 text-secondary-foreground" />
                    </div>
                    <div className="text-2xl font-bold">{activeChallenge.participants}</div>
                    <div className="text-xs text-muted-foreground">Participants</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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
            <div className="space-y-3">
              {todaysTasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      task.completed 
                        ? 'bg-accent border-accent text-accent-foreground' 
                        : 'border-muted-foreground'
                    }`}>
                      {task.completed && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <span className={`${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {task.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{task.time}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Complete remaining tasks to maintain your streak!
                </div>
                <Button variant="hero" size="sm">
                  Check In
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;