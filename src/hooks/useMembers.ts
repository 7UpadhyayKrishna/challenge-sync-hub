import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Member {
  id: string;
  user_id: string;
  display_name?: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  challenges_completed: number;
  current_streak: number;
  is_online: boolean;
}

interface Connection {
  id: string;
  user_id: string;
  connected_user_id: string;
  created_at: string;
}

export const useMembers = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchMembers = async () => {
    try {
      // Fetch all profiles with their challenge statistics
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          display_name,
          username,
          avatar_url,
          bio,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      if (!profiles) return;

      // Get challenge completion stats for each user
      const userIds = profiles.map(p => p.user_id);
      
      const { data: challengeStats } = await supabase
        .from('challenge_participants')
        .select('user_id, is_completed, completed_at')
        .in('user_id', userIds);

      // Calculate stats for each user
      const userStats = new Map();
      challengeStats?.forEach(stat => {
        const userId = stat.user_id;
        if (!userStats.has(userId)) {
          userStats.set(userId, { completed: 0, currentStreak: 0 });
        }
        
        if (stat.is_completed) {
          userStats.get(userId).completed += 1;
        }
      });

      // Calculate current streaks (simplified - in real app you'd calculate actual streaks)
      const { data: recentActivity } = await supabase
        .from('challenge_participants')
        .select('user_id, joined_at')
        .in('user_id', userIds)
        .order('joined_at', { ascending: false });

      recentActivity?.forEach(activity => {
        const userId = activity.user_id;
        if (userStats.has(userId)) {
          // Simple streak calculation - days since last activity
          const daysSinceLastActivity = Math.floor(
            (Date.now() - new Date(activity.joined_at).getTime()) / (1000 * 60 * 60 * 24)
          );
          userStats.get(userId).currentStreak = Math.max(0, 30 - daysSinceLastActivity);
        }
      });

      // Transform profiles to members with stats
      const membersData = profiles.map(profile => {
        const stats = userStats.get(profile.user_id) || { completed: 0, currentStreak: 0 };
        return {
          id: profile.id,
          user_id: profile.user_id,
          display_name: profile.display_name,
          username: profile.username,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          created_at: profile.created_at,
          challenges_completed: stats.completed,
          current_streak: stats.currentStreak,
          is_online: Math.random() > 0.5 // Mock online status - in real app you'd track this
        };
      });

      setMembers(membersData);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchConnections = async () => {
    if (!user) return;

    try {
      // In a real app, you'd have a connections/friends table
      // For now, we'll use a simple approach with localStorage
      const savedConnections = localStorage.getItem(`connections_${user.id}`);
      if (savedConnections) {
        setConnections(JSON.parse(savedConnections));
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const connectMember = async (memberId: string) => {
    if (!user) return false;

    try {
      // Find the member to get their user_id
      const member = members.find(m => m.id === memberId);
      if (!member) return false;

      const newConnection = {
        id: `conn_${Date.now()}`,
        user_id: user.id,
        connected_user_id: member.user_id,
        created_at: new Date().toISOString()
      };

      const updatedConnections = [...connections, newConnection];
      setConnections(updatedConnections);
      
      // Save to localStorage (in real app, save to database)
      localStorage.setItem(`connections_${user.id}`, JSON.stringify(updatedConnections));
      
      return true;
    } catch (error) {
      console.error('Error connecting member:', error);
      return false;
    }
  };

  const disconnectMember = async (memberId: string) => {
    if (!user) return false;

    try {
      // Find the member to get their user_id
      const member = members.find(m => m.id === memberId);
      if (!member) return false;

      const updatedConnections = connections.filter(
        conn => conn.connected_user_id !== member.user_id
      );
      setConnections(updatedConnections);
      
      // Save to localStorage (in real app, save to database)
      localStorage.setItem(`connections_${user.id}`, JSON.stringify(updatedConnections));
      
      return true;
    } catch (error) {
      console.error('Error disconnecting member:', error);
      return false;
    }
  };

  const isConnected = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return false;
    return connections.some(conn => conn.connected_user_id === member.user_id);
  };

  const getConnectedMemberIds = () => {
    return connections.map(conn => conn.connected_user_id);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchMembers(), fetchConnections()]);
      setLoading(false);
    };

    loadData();
  }, [user]);

  return {
    members,
    connections,
    loading,
    connectMember,
    disconnectMember,
    isConnected,
    getConnectedMemberIds,
    refetch: () => {
      fetchMembers();
      fetchConnections();
    }
  };
};
