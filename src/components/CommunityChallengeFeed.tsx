import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Calendar, Target, User } from 'lucide-react';
import { useChallenges } from '@/hooks/useChallenges';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface CommunityChallenge {
  id: string;
  title: string;
  description?: string;
  category?: string;
  duration_days: number;
  created_at: string;
  profiles: {
    display_name?: string;
    username?: string;
  };
  participant_count: number;
  current_day: number;
  user_joined?: boolean;
}

interface CommunityChallengeFeedProps {
  challenges: CommunityChallenge[];
  loading?: boolean;
}

export const CommunityChallengeFeed = ({ challenges, loading }: CommunityChallengeFeedProps) => {
  const { joinChallenge } = useChallenges();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleJoinChallenge = async (challengeId: string) => {
    const success = await joinChallenge(challengeId);
    
    if (success) {
      toast({
        title: "Challenge joined!",
        description: "You've successfully joined the challenge. Good luck!"
      });
    } else {
      toast({
        title: "Failed to join",
        description: "You might already be a participant in this challenge.",
        variant: "destructive"
      });
    }
  };

  const handleViewChallenge = (challengeId: string) => {
    navigate(`/challenge/${challengeId}`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
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
    );
  }

  if (challenges.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Challenges Available</h3>
            <p className="text-muted-foreground">Be the first to create a challenge for the community!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {challenges.map((challenge) => {
        const creatorName = challenge.profiles?.display_name || 
                           challenge.profiles?.username || 'Anonymous';
        const timeAgo = formatDistanceToNow(new Date(challenge.created_at), { addSuffix: true });

        return (
          <Card key={challenge.id} className="shadow-card hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2 flex items-center space-x-2">
                    <span>{challenge.title}</span>
                    {challenge.category && (
                      <Badge variant="outline" className="text-xs">
                        {challenge.category}
                      </Badge>
                    )}
                  </CardTitle>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>by {creatorName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{timeAgo}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-4">
                {challenge.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {challenge.description}
                  </p>
                )}

                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="font-medium">{challenge.participant_count}</span>
                    <span className="text-muted-foreground">participants</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-accent" />
                    <span className="font-medium">Day {Math.min(challenge.current_day, challenge.duration_days)}</span>
                    <span className="text-muted-foreground">of {challenge.duration_days}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewChallenge(challenge.id)}
                  >
                    View Details
                  </Button>
                  
                  {!challenge.user_joined ? (
                    <Button
                      size="sm"
                      onClick={() => handleJoinChallenge(challenge.id)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Join Challenge
                    </Button>
                  ) : (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Joined
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};