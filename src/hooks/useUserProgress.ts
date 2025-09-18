import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserChallenge {
  id: string;
  challenge_id: string;
  challenges: {
    title: string;
    description: string;
    duration_days: number;
    daily_tasks: any[];
    category: string;
  };
  joined_at: string;
  daily_progress: Record<string, boolean>;
  is_completed: boolean;
}

interface TodayTask {
  name: string;
  completed: boolean;
  challengeId: string;
  participantId: string;
  taskId: string;
}

export const useUserProgress = () => {
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [todaysTasks, setTodaysTasks] = useState<TodayTask[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchUserProgress = async () => {
    if (!user) return;

    try {
      const { data: participants, error } = await supabase
        .from('challenge_participants')
        .select(`
          id,
          challenge_id,
          joined_at,
          daily_progress,
          is_completed,
          challenges:challenge_id (
            title,
            description,
            duration_days,
            daily_tasks,
            category
          )
        `)
        .eq('user_id', user.id)
        .eq('is_completed', false);

      if (error) throw error;

      const formattedChallenges = (participants || []).map(p => ({
        ...p,
        challenges: p.challenges as UserChallenge['challenges']
      })) as UserChallenge[];

      setUserChallenges(formattedChallenges);
      
      // Generate today's tasks from all active challenges
      const tasks: TodayTask[] = [];
      const today = new Date().toISOString().split('T')[0];
      
      formattedChallenges.forEach((participant) => {
        const joinDate = new Date(participant.joined_at);
        const daysPassed = Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        if (participant.challenges?.daily_tasks && Array.isArray(participant.challenges.daily_tasks)) {
          participant.challenges.daily_tasks.forEach((task: string, index: number) => {
            const taskId = `${today}-task-${index}`;
            tasks.push({
              name: task,
              completed: participant.daily_progress?.[taskId] || false,
              challengeId: participant.challenge_id,
              participantId: participant.id,
              taskId: taskId
            });
          });
        }
      });
      
      setTodaysTasks(tasks);
    } catch (error) {
      console.error('Error fetching user progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const markTaskComplete = async (participantId: string, taskId: string, completed: boolean) => {
    if (!user) return;
    
    try {
      // First get current progress
      const { data: currentParticipant, error: fetchError } = await supabase
        .from('challenge_participants')
        .select('daily_progress')
        .eq('id', participantId)
        .single();

      if (fetchError) throw fetchError;

      // Update specific task in progress
      const updatedProgress = {
        ...(currentParticipant.daily_progress as Record<string, boolean> || {}),
        [taskId]: completed
      };

      const { error } = await supabase
        .from('challenge_participants')
        .update({
          daily_progress: updatedProgress
        })
        .eq('id', participantId);

      if (error) throw error;
      
      // Refresh data
      fetchUserProgress();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  useEffect(() => {
    fetchUserProgress();
  }, [user]);

  return {
    userChallenges,
    todaysTasks,
    loading,
    markTaskComplete,
    fetchUserProgress
  };
};