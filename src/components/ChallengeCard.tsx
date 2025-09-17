import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Trophy, Star } from "lucide-react";

interface ChallengeCardProps {
  title: string;
  description: string;
  category: string;
  participants: number;
  duration: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  rating: number;
  image?: string;
}

const ChallengeCard = ({
  title,
  description,
  category,
  participants,
  duration,
  difficulty,
  rating
}: ChallengeCardProps) => {
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "Beginner": return "bg-accent/20 text-accent";
      case "Intermediate": return "bg-primary/20 text-primary";
      case "Advanced": return "bg-destructive/20 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="group hover:shadow-card transition-all duration-300 hover:-translate-y-1 cursor-pointer border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Badge variant="secondary" className="mb-2 text-xs">
            {category}
          </Badge>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Star className="w-3 h-3 fill-current text-primary" />
            <span>{rating}</span>
          </div>
        </div>
        <CardTitle className="text-lg group-hover:text-primary transition-colors">
          {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="py-0">
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{description}</p>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{participants}</span>
            </div>
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{duration} days</span>
            </div>
          </div>
          <Badge variant="outline" className={getDifficultyColor(difficulty)}>
            {difficulty}
          </Badge>
        </div>
      </CardContent>
      
      <CardFooter className="pt-4">
        <Button className="w-full" variant="outline">
          Join Challenge
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ChallengeCard;