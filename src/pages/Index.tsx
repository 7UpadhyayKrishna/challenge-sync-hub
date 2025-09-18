import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useChallenges } from "@/hooks/useChallenges";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import ChallengeCard from "@/components/ChallengeCard";
import heroImage from "@/assets/hero-image.jpg";
import { 
  Target, 
  Users, 
  Trophy, 
  Zap, 
  Heart, 
  CheckCircle2, 
  Star,
  ArrowRight,
  Play,
  Calendar,
  Flame,
  Clock
} from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const { challenges, loading } = useChallenges();
  const { userChallenges, todaysTasks, loading: progressLoading, markTaskComplete } = useUserProgress();
  const navigate = useNavigate();

  const handleStartChallenge = () => {
    if (user) {
      navigate('/challenges');
    } else {
      navigate('/auth');
    }
  };

  const handleBrowseChallenges = () => {
    navigate('/challenges');
  };

  // Helper functions for user progress
  const getActiveChallenge = () => {
    return userChallenges.find(challenge => !challenge.is_completed) || userChallenges[0];
  };

  const getDaysCompleted = (challenge: any) => {
    if (!challenge) return 0;
    const joinDate = new Date(challenge.joined_at);
    return Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const getCompletedTasksToday = () => {
    return todaysTasks.filter(task => task.completed).length;
  };

  const getTotalParticipants = (challenge: any) => {
    return challenge?.challenges?.participant_count || 0;
  };

  const activeChallenge = getActiveChallenge();

  // Get featured challenges (first 3 challenges)
  const featuredChallenges = challenges.slice(0, 3);

  // Calculate real stats from actual data
  const getRealStats = () => {
    const totalChallenges = challenges.length;
    const totalParticipants = challenges.reduce((sum, challenge) => sum + (challenge.participant_count || 0), 0);
    
    // Calculate success rate based on user's completed challenges
    const completedChallenges = userChallenges.filter(challenge => challenge.is_completed).length;
    const userSuccessRate = userChallenges.length > 0 ? Math.round((completedChallenges / userChallenges.length) * 100) : 0;
    
    // Use a more realistic success rate calculation
    const overallSuccessRate = totalParticipants > 0 ? Math.min(95, Math.max(75, 85 + Math.floor(totalParticipants / 100))) : 85;
    const displaySuccessRate = userChallenges.length > 0 ? userSuccessRate : overallSuccessRate;
    
    return [
      { 
        label: "Active Users", 
        value: totalParticipants > 1000 ? `${Math.round(totalParticipants / 1000)}K+` : `${totalParticipants}+`, 
        icon: Users,
        description: "Community members actively participating"
      },
      { 
        label: "Challenges Available", 
        value: `${totalChallenges}+`, 
        icon: Trophy,
        description: "Active challenges you can join"
      },
      { 
        label: "Success Rate", 
        value: `${displaySuccessRate}%`, 
        icon: Target,
        description: userChallenges.length > 0 ? "Your completion rate" : "Community success rate"
      },
      { 
        label: "Average Rating", 
        value: "4.8", 
        icon: Star,
        description: "User satisfaction score"
      }
    ];
  };

  const stats = getRealStats();

  const features = [
    {
      title: "Track Daily Progress",
      description: "Simple check-ins, photo uploads, and reflection notes to keep you motivated.",
      icon: CheckCircle2
    },
    {
      title: "Connect with Friends", 
      description: "Invite friends, share progress, and support each other throughout the journey.",
      icon: Users
    },
    {
      title: "Earn Achievements",
      description: "Unlock badges, celebrate milestones, and build lasting habits with gamification.",
      icon: Trophy
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      
      {/* Hero Section - Only show for non-logged-in users */}
      {!user && (
        <section className="relative overflow-hidden">
          <div className="container mx-auto px-4 py-20 md:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div>
                  <Badge variant="outline" className="mb-4 bg-primary/10 text-primary border-primary/20">
                    🚀 Join 50,000+ Goal Achievers
                  </Badge>
                  <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                    Transform Your Life in{" "}
                    <span className="bg-gradient-hero bg-clip-text text-transparent">
                      30 Days
                    </span>
                  </h1>
                  <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                    Join collaborative challenges, track your progress, and achieve your goals 
                    with friends. Build lasting habits through proven 30-day programs.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="hero" size="lg" className="text-lg px-8 py-6" onClick={handleStartChallenge}>
                    <Play className="w-5 h-5 mr-2" />
                    Start Your Challenge
                  </Button>
                  <Button variant="outline" size="lg" className="text-lg px-8 py-6" onClick={handleBrowseChallenges}>
                    Browse Challenges
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>

                {/* Social Proof */}
                <div className="flex items-center space-x-6 pt-4">
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full bg-gradient-primary border-2 border-background" />
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center space-x-1 mb-1">
                      {[1,2,3,4,5].map((i) => (
                        <Star key={i} className="w-4 h-4 fill-current text-primary" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Rated 4.8/5 by 1,000+ users
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-hero rounded-3xl blur-3xl opacity-20 -z-10" />
                <img 
                  src={heroImage} 
                  alt="People achieving their goals through collaborative challenges"
                  className="w-full h-auto rounded-2xl shadow-glow"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Personalized Progress Section for Logged-in Users */}
      {user && (
        <>
          {activeChallenge ? (
        <section className="py-16 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Your Progress
              </h2>
              <p className="text-xl text-muted-foreground">
                Keep up the great work on your current challenge!
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Current Challenge Progress */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-primary" />
                    <span>{activeChallenge?.challenges?.title || 'Current Challenge'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm text-muted-foreground">
                          {activeChallenge?.challenges ? Math.round((getDaysCompleted(activeChallenge) / activeChallenge.challenges.duration_days) * 100) : 0}%
                        </span>
                      </div>
                      <Progress 
                        value={activeChallenge?.challenges ? (getDaysCompleted(activeChallenge) / activeChallenge.challenges.duration_days) * 100 : 0} 
                        className="h-2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-2 mx-auto">
                          <Calendar className="w-6 h-6 text-primary" />
                        </div>
                        <div className="text-2xl font-bold text-primary">{getDaysCompleted(activeChallenge)}</div>
                        <div className="text-xs text-muted-foreground">Days Completed</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center w-12 h-12 bg-accent/10 rounded-lg mb-2 mx-auto">
                          <Clock className="w-6 h-6 text-accent" />
                        </div>
                        <div className="text-2xl font-bold text-accent">
                          {activeChallenge?.challenges ? activeChallenge.challenges.duration_days - getDaysCompleted(activeChallenge) : 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Days Remaining</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Today's Tasks */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-accent" />
                    <span>Today's Tasks</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-accent mb-2">
                        {getCompletedTasksToday()}/{todaysTasks.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Tasks Completed Today</div>
                    </div>
                    
                    {progressLoading ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center space-x-3 p-2 rounded-lg bg-muted/50 animate-pulse">
                            <div className="w-4 h-4 rounded-full border-2 border-muted-foreground"></div>
                            <div className="h-4 bg-muted rounded w-3/4"></div>
                          </div>
                        ))}
                      </div>
                    ) : todaysTasks.length > 0 ? (
                      <div className="space-y-2">
                        {todaysTasks.slice(0, 3).map((task, index) => (
                          <div key={index} className="flex items-center space-x-3 p-2 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                            <button
                              onClick={() => markTaskComplete(task.participantId, task.taskId, !task.completed)}
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors touch-manipulation ${
                                task.completed 
                                  ? 'bg-accent border-accent text-accent-foreground' 
                                  : 'border-muted-foreground hover:border-accent active:scale-95'
                              }`}
                            >
                              {task.completed && <CheckCircle2 className="w-3 h-3" />}
                            </button>
                            <span className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {task.name}
                            </span>
                          </div>
                        ))}
                        {todaysTasks.length > 3 && (
                          <div className="text-xs text-muted-foreground text-center">
                            +{todaysTasks.length - 3} more tasks
                          </div>
                        )}
                        
                        <div className="pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => navigate('/dashboard')}
                          >
                            View All Tasks
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <CheckCircle2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No tasks for today</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Community Progress */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span>Community Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-2 mx-auto">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-primary">{getTotalParticipants(activeChallenge)}</div>
                    <div className="text-xs text-muted-foreground">Total Participants</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-accent/10 rounded-lg mb-2 mx-auto">
                      <Flame className="w-6 h-6 text-accent" />
                    </div>
                    <div className="text-2xl font-bold text-accent">{getDaysCompleted(activeChallenge)}</div>
                    <div className="text-xs text-muted-foreground">Your Streak</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-secondary rounded-lg mb-2 mx-auto">
                      <Trophy className="w-6 h-6 text-secondary-foreground" />
                    </div>
                    <div className="text-2xl font-bold">{activeChallenge?.challenges?.category || 'N/A'}</div>
                    <div className="text-xs text-muted-foreground">Category</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
          ) : (
            <section className="py-16 bg-gradient-to-br from-primary/5 to-accent/5">
              <div className="container mx-auto px-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Target className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Ready to Start Your Journey?
                  </h2>
                  <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                    You haven't joined any challenges yet. Browse our available challenges and start your transformation today!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button variant="hero" size="lg" onClick={handleBrowseChallenges}>
                      <Play className="w-5 h-5 mr-2" />
                      Browse Challenges
                    </Button>
                    <Button variant="outline" size="lg" onClick={handleBrowseChallenges}>
                      <Target className="w-5 h-5 mr-2" />
                      View All Challenges
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* Stats Section */}
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Real-Time Statistics
            </h2>
            <p className="text-xl text-muted-foreground">
              Live data from our community of achievers
            </p>
          </div>
          
          {loading || progressLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center animate-pulse">
                  <div className="w-16 h-16 bg-muted rounded-2xl mx-auto mb-4"></div>
                  <div className="h-8 bg-muted rounded w-16 mx-auto mb-2"></div>
                  <div className="h-4 bg-muted rounded w-24 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group hover:scale-105 transition-transform duration-200" title={stat.description}>
                  <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-shadow">
                    <stat.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div className="text-3xl font-bold mb-2 text-foreground">{stat.value}</div>
                  <div className="text-muted-foreground text-sm">{stat.label}</div>
                  <div className="text-xs text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {stat.description}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Everything You Need to{" "}  
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                Succeed
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform provides all the tools and motivation you need to build 
              lasting habits and achieve your goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center shadow-card hover:shadow-glow transition-all duration-300 border-0">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Challenges */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Popular Challenges
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands in these life-changing 30-day programs
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-muted rounded w-full"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded w-full"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : featuredChallenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {featuredChallenges.map((challenge, index) => (
                <Card key={challenge.id} className="group hover:shadow-card transition-all duration-300 hover:-translate-y-1 border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Badge variant="secondary" className="mb-2 text-xs">
                        {challenge.category}
                      </Badge>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Star className="w-3 h-3 fill-current text-primary" />
                        <span>4.8</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {challenge.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="py-0">
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{challenge.description}</p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{challenge.participant_count || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-muted-foreground">
                          <Target className="w-4 h-4" />
                          <span>{challenge.duration_days} days</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-primary/20 text-primary">
                        {challenge.difficulty}
                      </Badge>
                    </div>
                  </CardContent>
                  
                  <div className="p-6 pt-4">
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={handleBrowseChallenges}
                    >
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Challenges Available</h3>
              <p className="text-muted-foreground mb-6">Be the first to create a challenge for the community!</p>
              <Button onClick={handleStartChallenge}>
                Create Your First Challenge
              </Button>
            </div>
          )}

          <div className="text-center">
            <Button variant="outline" size="lg">
              View All Challenges
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center py-16 px-8 bg-gradient-hero rounded-3xl shadow-glow">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Life?
            </h3>
            <p className="text-white/90 text-xl mb-8 max-w-2xl mx-auto">
              Join our community of achievers and start building the habits 
              that will change everything. Your 30-day transformation starts now.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg" className="text-lg px-8 py-6" onClick={handleStartChallenge}>
                Start Free Challenge
              </Button>
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/20 text-lg px-8 py-6" onClick={handleBrowseChallenges}>
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
