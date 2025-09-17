import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ChallengeCard from "@/components/ChallengeCard";
import Header from "@/components/Header";
import { Search, Filter, Sparkles, Dumbbell, BookOpen, Heart, Code, Target } from "lucide-react";

const Challenges = () => {
  const featuredChallenges = [
    {
      title: "Ultimate Productivity Challenge",
      description: "Transform your daily habits with morning routines, focused work sessions, and evening reflections. Build the foundation for peak performance.",
      category: "Productivity",
      participants: 1247,
      duration: 30,
      difficulty: "Intermediate" as const,
      rating: 4.8
    },
    {
      title: "Fitness Transformation",
      description: "Complete workout program combining strength training, cardio, and nutrition planning. Get in the best shape of your life.",
      category: "Fitness",
      participants: 892,
      duration: 30,
      difficulty: "Advanced" as const,
      rating: 4.9
    },
    {
      title: "Mindfulness Journey",
      description: "Daily meditation, gratitude practice, and mindful living. Reduce stress and increase mental clarity through proven techniques.",
      category: "Wellness",
      participants: 623,
      duration: 21,
      difficulty: "Beginner" as const,
      rating: 4.7
    },
    {
      title: "Coding Bootcamp Sprint",
      description: "Build your programming skills with daily coding exercises, project work, and technical challenges. From beginner to confident developer.",
      category: "Learning",
      participants: 445,
      duration: 45,
      difficulty: "Intermediate" as const,
      rating: 4.6
    },
    {
      title: "Creative Writing Challenge",
      description: "Unlock your creativity with daily writing prompts, storytelling exercises, and peer feedback. Develop your unique voice.",
      category: "Creativity",
      participants: 312,
      duration: 30,
      difficulty: "Beginner" as const,
      rating: 4.5
    },
    {
      title: "Healthy Living Makeover",
      description: "Complete lifestyle transformation focusing on nutrition, hydration, sleep, and mental health. Small changes, big results.",
      category: "Health",
      participants: 756,
      duration: 30,
      difficulty: "Beginner" as const,
      rating: 4.8
    }
  ];

  const categories = [
    { name: "All", icon: Target, count: 48, active: true },
    { name: "Fitness", icon: Dumbbell, count: 12, active: false },
    { name: "Learning", icon: BookOpen, count: 15, active: false },
    { name: "Wellness", icon: Heart, count: 8, active: false },
    { name: "Productivity", icon: Sparkles, count: 9, active: false },
    { name: "Creativity", icon: Code, count: 4, active: false }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover Amazing{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Challenges
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of motivated individuals in life-changing challenges. 
            Find your next adventure and transform your habits.
          </p>
          
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Search challenges..." 
                className="pl-10 h-12"
              />
            </div>
            <Button variant="outline" size="lg" className="h-12 px-6">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Button
                key={category.name}
                variant={category.active ? "default" : "outline"}
                className="h-auto p-4 flex-col space-y-2 min-w-[120px]"
              >
                <category.icon className="w-6 h-6" />
                <div>
                  <div className="font-semibold">{category.name}</div>
                  <div className="text-xs opacity-70">{category.count} challenges</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Featured Challenges */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Challenges</h2>
            <Button variant="ghost">View All</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredChallenges.map((challenge, index) => (
              <ChallengeCard key={index} {...challenge} />
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center py-16 px-6 bg-gradient-hero rounded-2xl shadow-glow">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h3>
          <p className="text-white/90 text-lg mb-8 max-w-md mx-auto">
            Create your own custom challenge or join one of our proven programs today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg">
              Create Custom Challenge
            </Button>
            <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/20">
              Browse More Challenges
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Challenges;