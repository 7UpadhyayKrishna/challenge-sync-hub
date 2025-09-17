import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Play
} from "lucide-react";

const Index = () => {
  const featuredChallenges = [
    {
      title: "Ultimate Productivity",
      description: "Master your morning routine, focus sessions, and evening reflections for peak performance.",
      category: "Productivity",
      participants: 1247,
      duration: 30,
      difficulty: "Intermediate" as const,
      rating: 4.8
    },
    {
      title: "Fitness Transformation",
      description: "Complete workout program with strength training, cardio, and nutrition planning.",
      category: "Fitness", 
      participants: 892,
      duration: 30,
      difficulty: "Advanced" as const,
      rating: 4.9
    },
    {
      title: "Mindfulness Journey",
      description: "Daily meditation, gratitude practice, and mindful living for mental clarity.",
      category: "Wellness",
      participants: 623,
      duration: 21,
      difficulty: "Beginner" as const,
      rating: 4.7
    }
  ];

  const stats = [
    { label: "Active Users", value: "50K+", icon: Users },
    { label: "Challenges Completed", value: "125K+", icon: Trophy },
    { label: "Success Rate", value: "89%", icon: Target },
    { label: "Average Rating", value: "4.8", icon: Star }
  ];

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
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
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
                <Button variant="hero" size="lg" className="text-lg px-8 py-6">
                  <Play className="w-5 h-5 mr-2" />
                  Start Your Challenge
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-6">
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

      {/* Stats Section */}
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-muted-foreground text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {featuredChallenges.map((challenge, index) => (
              <ChallengeCard key={index} {...challenge} />
            ))}
          </div>

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
              <Button variant="secondary" size="lg" className="text-lg px-8 py-6">
                Start Free Challenge
              </Button>
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/20 text-lg px-8 py-6">
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
