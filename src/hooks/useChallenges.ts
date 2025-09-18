import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

export interface Challenge {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  duration_days: number;
  category: string | null;
  difficulty: string | null;
  daily_tasks: string[];
  reference_photo_url?: string | null;
  photo_visibility: 'public' | 'private';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  participant_count?: number;
}

export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  user_id: string;
  joined_at: string;
  daily_progress: Record<string, boolean>;
  is_completed: boolean;
  completed_at?: string | null;
}

export const useChallenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select(`
          *,
          challenge_participants(count)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const challengesWithCount = data.map(challenge => ({
        ...challenge,
        title: challenge.title || '',
        description: challenge.description || '',
        category: challenge.category || '',
        photo_visibility: (challenge.photo_visibility as 'public' | 'private') || 'private',
        daily_tasks: Array.isArray(challenge.daily_tasks) ? challenge.daily_tasks as string[] : [],
        participant_count: challenge.challenge_participants[0]?.count || 0
      }));

      setChallenges(challengesWithCount);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      toast({
        title: "Error",
        description: "Failed to fetch challenges",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createChallenge = async (challengeData: {
    title: string;
    description: string;
    duration_days: number;
    category: string;
    difficulty: string;
    daily_tasks: string[];
    photo_visibility: 'public' | 'private';
  }) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a challenge",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('challenges')
        .insert([{
          ...challengeData,
          creator_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Challenge created successfully!",
      });

      fetchChallenges();
      return data;
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast({
        title: "Error",
        description: "Failed to create challenge",
        variant: "destructive",
      });
      return null;
    }
  };

  const joinChallenge = async (challengeId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to join a challenge",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('challenge_participants')
        .insert([{
          challenge_id: challengeId,
          user_id: user.id
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully joined the challenge!",
      });

      fetchChallenges();
      return true;
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast({
        title: "Error",
        description: "Failed to join challenge. You may already be a participant.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchChallenges();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('challenges-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'challenges'
      }, () => {
        fetchChallenges();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'challenge_participants'
      }, () => {
        fetchChallenges();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    challenges,
    loading,
    createChallenge,
    joinChallenge,
    fetchChallenges
  };
};