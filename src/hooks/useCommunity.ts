import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Post {
  id: string;
  user_id: string;
  challenge_id?: string;
  content: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles: {
    display_name?: string;
    username?: string;
    avatar_url?: string;
  };
  challenges?: {
    title: string;
    category?: string;
  };
  user_liked?: boolean;
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    display_name?: string;
    username?: string;
    avatar_url?: string;
  };
}

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

export const useCommunity = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [challenges, setChallenges] = useState<CommunityChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [filterBy, setFilterBy] = useState<'all' | string>('all');
  const { user } = useAuth();

  const fetchPosts = async () => {
    try {
      let query = supabase
        .from('posts')
        .select(`
          id,
          user_id,
          challenge_id,
          content,
          image_url,
          likes_count,
          comments_count,
          created_at,
          profiles:user_id (
            display_name,
            username,
            avatar_url
          ),
          challenges:challenge_id (
            title,
            category
          )
        `);

      if (filterBy !== 'all') {
        query = query.eq('challenge_id', filterBy);
      }

      if (sortBy === 'popular') {
        query = query.order('likes_count', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query.limit(20);
      
      if (error) throw error;

      // Check if user liked each post
      if (user && data) {
        const postIds = data.map(post => post.id);
        const { data: likes } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);

        const likedPosts = new Set(likes?.map(like => like.post_id) || []);
        
        const postsWithLikes = data.map(post => ({
          ...post,
          user_liked: likedPosts.has(post.id)
        }));

        setPosts(postsWithLikes);
      } else {
        setPosts(data || []);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select(`
          id,
          title,
          description,
          category,
          duration_days,
          creator_id,
          created_at,
          profiles:creator_id (
            display_name,
            username
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Get participant counts and user join status
      if (data) {
        const challengeIds = data.map(c => c.id);
        
        const { data: participants } = await supabase
          .from('challenge_participants')
          .select('challenge_id, user_id')
          .in('challenge_id', challengeIds);

        const participantCounts = new Map();
        const userJoined = new Set();

        participants?.forEach(p => {
          participantCounts.set(p.challenge_id, (participantCounts.get(p.challenge_id) || 0) + 1);
          if (user && p.user_id === user.id) {
            userJoined.add(p.challenge_id);
          }
        });

        const challengesWithData = data.map(challenge => ({
          ...challenge,
          participant_count: participantCounts.get(challenge.id) || 0,
          current_day: Math.floor((Date.now() - new Date(challenge.created_at).getTime()) / (1000 * 60 * 60 * 24)) + 1,
          user_joined: userJoined.has(challenge.id)
        }));

        setChallenges(challengesWithData);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    }
  };

  const createPost = async (content: string, challengeId?: string, imageUrl?: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content,
          challenge_id: challengeId || null,
          image_url: imageUrl || null
        });

      if (error) throw error;
      
      fetchPosts(); // Refresh posts
      return true;
    } catch (error) {
      console.error('Error creating post:', error);
      return false;
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.user_liked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });
        
        if (error) throw error;
      }

      fetchPosts(); // Refresh to get updated counts
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const fetchComments = async (postId: string): Promise<Comment[]> => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          post_id,
          user_id,
          content,
          created_at,
          profiles:user_id (
            display_name,
            username,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  };

  const addComment = async (postId: string, content: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content
        });

      if (error) throw error;
      
      fetchPosts(); // Refresh to update comment counts
      return true;
    } catch (error) {
      console.error('Error adding comment:', error);
      return false;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchPosts(), fetchChallenges()]);
      setLoading(false);
    };

    loadData();
  }, [user, sortBy, filterBy]);

  // Set up real-time subscriptions
  useEffect(() => {
    const postsSubscription = supabase
      .channel('community-posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchPosts();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, () => {
        fetchPosts();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => {
        fetchPosts();
      })
      .subscribe();

    const challengesSubscription = supabase
      .channel('community-challenges')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'challenges' }, () => {
        fetchChallenges();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'challenge_participants' }, () => {
        fetchChallenges();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(postsSubscription);
      supabase.removeChannel(challengesSubscription);
    };
  }, [user, sortBy, filterBy]);

  return {
    posts,
    challenges,
    loading,
    sortBy,
    setSortBy,
    filterBy,
    setFilterBy,
    createPost,
    toggleLike,
    fetchComments,
    addComment,
    refetch: () => {
      fetchPosts();
      fetchChallenges();
    }
  };
};