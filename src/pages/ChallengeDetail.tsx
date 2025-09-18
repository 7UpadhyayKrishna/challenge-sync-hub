import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Users, Calendar, CheckCircle, Upload, Camera } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Challenge, ChallengeParticipant } from '@/hooks/useChallenges';

export default function ChallengeDetail() {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [participant, setParticipant] = useState<ChallengeParticipant | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    if (challengeId) {
      fetchChallengeDetails();
    }
  }, [challengeId, user]);

  const fetchChallengeDetails = async () => {
    try {
      setLoading(true);

      // Fetch challenge details
      const { data: challengeData, error: challengeError } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', challengeId)
        .single();

      if (challengeError) throw challengeError;
      
      const processedChallenge: Challenge = {
        ...challengeData,
        title: challengeData.title || '',
        description: challengeData.description || '',
        category: challengeData.category || '',
        photo_visibility: (challengeData.photo_visibility as 'public' | 'private') || 'private',
        daily_tasks: Array.isArray(challengeData.daily_tasks) ? challengeData.daily_tasks as string[] : []
      };
      
      setChallenge(processedChallenge);

      // Fetch participants
      const { data: participantsData, error: participantsError } = await supabase
        .from('challenge_participants')
        .select(`
          *,
          profiles (display_name, username, avatar_url)
        `)
        .eq('challenge_id', challengeId);

      if (participantsError) throw participantsError;
      setParticipants(participantsData);

      // Check if current user is a participant
      if (user) {
        const userParticipant = participantsData.find(p => p.user_id === user.id);
        if (userParticipant) {
          const processedParticipant: ChallengeParticipant = {
            ...userParticipant,
            daily_progress: typeof userParticipant.daily_progress === 'object' ? userParticipant.daily_progress as Record<string, boolean> : {}
          };
          setParticipant(processedParticipant);
          setIsJoined(true);
        }
      }
    } catch (error) {
      console.error('Error fetching challenge details:', error);
      toast({
        title: "Error",
        description: "Failed to load challenge details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const joinChallenge = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('challenge_participants')
        .insert([{
          challenge_id: challengeId,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      const processedParticipant: ChallengeParticipant = {
        ...data,
        daily_progress: typeof data.daily_progress === 'object' ? data.daily_progress as Record<string, boolean> : {}
      };

      setParticipant(processedParticipant);
      setIsJoined(true);
      fetchChallengeDetails();
      
      toast({
        title: "Success",
        description: "Successfully joined the challenge!",
      });
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast({
        title: "Error",
        description: "Failed to join challenge",
        variant: "destructive",
      });
    }
  };

  const updateDailyProgress = async (dayNumber: number, completed: boolean) => {
    if (!participant) return;

    try {
      const newProgress = { ...participant.daily_progress };
      newProgress[dayNumber.toString()] = completed;

      const { error } = await supabase
        .from('challenge_participants')
        .update({ daily_progress: newProgress })
        .eq('id', participant.id);

      if (error) throw error;

      setParticipant({
        ...participant,
        daily_progress: newProgress
      });

      toast({
        title: "Progress updated",
        description: `Day ${dayNumber} marked as ${completed ? 'complete' : 'incomplete'}`,
      });
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      });
    }
  };

  const calculateProgress = () => {
    if (!participant || !challenge) return 0;
    const completedDays = Object.values(participant.daily_progress).filter(Boolean).length;
    return (completedDays / challenge.duration_days) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
        <Header />
        <div className="pt-24 px-4">
          <div className="container mx-auto max-w-4xl">
            <Skeleton className="h-8 w-32 mb-8" />
            <div className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
        <Header />
        <div className="pt-24 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-2xl font-bold mb-4">Challenge Not Found</h1>
            <Button onClick={() => navigate('/challenges')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Challenges
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <Header />
      
      <div className="pt-24 px-4 pb-12">
        <div className="container mx-auto max-w-4xl">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            className="mb-8" 
            onClick={() => navigate('/challenges')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Challenges
          </Button>

          {/* Challenge Header */}
          <div className="bg-card rounded-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <h1 className="text-3xl font-bold">{challenge.title}</h1>
                  <Badge variant="secondary" className="capitalize">
                    {challenge.category}
                  </Badge>
                  <Badge variant={challenge.difficulty === 'Beginner' ? 'default' : 
                                challenge.difficulty === 'Intermediate' ? 'secondary' : 'destructive'}>
                    {challenge.difficulty}
                  </Badge>
                </div>
                
                <p className="text-muted-foreground text-lg mb-6">{challenge.description}</p>
                
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{challenge.duration_days} days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{participants.length} participants</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {!isJoined ? (
                  <Button size="lg" onClick={joinChallenge}>
                    Join Challenge
                  </Button>
                ) : (
                  <div className="text-center">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm font-medium">You're participating!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Daily Tasks & Progress */}
            <div className="lg:col-span-2 space-y-6">
              {isJoined && participant && (
                <Card>
                  <CardHeader>
                    <CardTitle>Your Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm text-muted-foreground">
                          {Object.values(participant.daily_progress).filter(Boolean).length} / {challenge.duration_days} days
                        </span>
                      </div>
                      <Progress value={calculateProgress()} className="w-full" />
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Daily Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.from({ length: challenge.duration_days }, (_, i) => {
                      const dayNumber = i + 1;
                      const isCompleted = participant?.daily_progress[dayNumber.toString()] || false;
                      
                      return (
                        <div key={dayNumber} className="flex items-start gap-4 p-4 border rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`day-${dayNumber}`}
                              checked={isCompleted}
                              onCheckedChange={(checked) => updateDailyProgress(dayNumber, checked as boolean)}
                              disabled={!isJoined}
                            />
                            <Label 
                              htmlFor={`day-${dayNumber}`}
                              className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}
                            >
                              Day {dayNumber}
                            </Label>
                          </div>
                          
                          <div className="flex-1">
                            <div className="space-y-2">
                              {challenge.daily_tasks.map((task, taskIndex) => (
                                <p key={taskIndex} className="text-sm text-muted-foreground">
                                  {task}
                                </p>
                              ))}
                            </div>
                            
                            {isJoined && (
                              <div className="mt-3 flex items-center gap-2">
                                <Button variant="outline" size="sm" className="gap-2">
                                  <Camera className="h-4 w-4" />
                                  Add Photo
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Participants ({participants.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {participants.slice(0, 10).map((participant) => (
                      <div key={participant.id} className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {participant.profiles?.display_name?.[0] || participant.profiles?.username?.[0] || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {participant.profiles?.display_name || participant.profiles?.username || 'Anonymous'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {Object.values(participant.daily_progress).filter(Boolean).length} days completed
                          </p>
                        </div>
                      </div>
                    ))}
                    {participants.length > 10 && (
                      <p className="text-xs text-muted-foreground text-center pt-2">
                        +{participants.length - 10} more participants
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}