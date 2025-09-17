import { Button } from "@/components/ui/button";
import { Trophy, Users, Target } from "lucide-react";

const Header = () => {
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Target className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            ChallengeHub
          </h1>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <a href="/challenges" className="text-muted-foreground hover:text-foreground transition-colors">
            Challenges
          </a>
          <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
            How it Works
          </a>
          <a href="#community" className="text-muted-foreground hover:text-foreground transition-colors">
            Community
          </a>
        </nav>

        <div className="flex items-center space-x-3">
          <Button variant="ghost">Sign In</Button>
          <Button variant="hero">Start Challenge</Button>
        </div>
      </div>
    </header>
  );
};

export default Header;