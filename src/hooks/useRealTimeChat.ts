import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import websocketService, { ChatMessage, TypingIndicator } from '@/services/websocketService';

interface ChatUser {
  id: string;
  user_id: string;
  display_name?: string;
  username?: string;
  avatar_url?: string;
  is_online: boolean;
  last_seen?: string;
}

interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  participants: {
    user_id: string;
    joined_at: string;
    last_read_at?: string;
    profiles: {
      display_name?: string;
      username?: string;
      avatar_url?: string;
    };
  }[];
  last_message?: ChatMessage;
  unread_count: number;
}

export const useRealTimeChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connectedUsers, setConnectedUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch connected users
  const fetchConnectedUsers = useCallback(async () => {
    if (!user) return;

    try {
      // Get connections from localStorage
      const savedConnections = localStorage.getItem(`connections_${user.id}`);
      if (savedConnections) {
        const connections = JSON.parse(savedConnections);
        const userIds = connections.map((conn: any) => conn.connected_user_id);
        
        if (userIds.length > 0) {
          // Fetch real user profiles from database
          const { data: profiles, error } = await supabase
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
            .in('user_id', userIds);

          if (error) {
            console.log('Database not available, using fallback data');
            const mockUsers = userIds.map((userId: string, index: number) => ({
              id: `profile_${userId}`,
              user_id: userId,
              display_name: `User ${index + 1}`,
              username: `user${index + 1}`,
              avatar_url: '',
              is_online: Math.random() > 0.5,
              last_seen: new Date().toISOString()
            }));
            setConnectedUsers(mockUsers);
            return;
          }

          const chatUsers = profiles.map((profile: any) => ({
            id: profile.id,
            user_id: profile.user_id,
            display_name: profile.display_name || profile.username || 'Unknown User',
            username: profile.username || 'user',
            avatar_url: profile.avatar_url || '',
            is_online: Math.random() > 0.5,
            last_seen: new Date().toISOString()
          }));

          setConnectedUsers(chatUsers);
        } else {
          setConnectedUsers([]);
        }
      } else {
        setConnectedUsers([]);
      }
    } catch (error) {
      console.error('Error fetching connected users:', error);
      setConnectedUsers([]);
    }
  }, [user]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      // Try to fetch from database
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          created_at,
          updated_at,
          conversation_participants (
            user_id,
            joined_at,
            last_read_at,
            profiles:user_id (
              display_name,
              username,
              avatar_url
            )
          )
        `)
        .order('updated_at', { ascending: false });

      if (error) {
        console.log('Database not available, using localStorage fallback');
        const savedConversations = localStorage.getItem(`conversations_${user.id}`);
        if (savedConversations) {
          const conversations = JSON.parse(savedConversations);
          const formattedConversations = conversations.map((conv: any) => ({
            id: conv.id,
            created_at: conv.created_at,
            updated_at: conv.created_at,
            participants: conv.participants.map((userId: string) => ({
              user_id: userId,
              joined_at: conv.created_at,
              last_read_at: null,
              profiles: {
                display_name: `User ${userId.slice(-1)}`,
                username: `user${userId.slice(-1)}`,
                avatar_url: ''
              }
            })),
            last_message: null,
            unread_count: 0
          }));
          setConversations(formattedConversations);
        }
        return;
      }

      const formattedConversations = data.map((conv: any) => ({
        id: conv.id,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        participants: conv.conversation_participants.map((p: any) => ({
          user_id: p.user_id,
          joined_at: p.joined_at,
          last_read_at: p.last_read_at,
          profiles: p.profiles
        })),
        last_message: null,
        unread_count: 0
      }));

      setConversations(formattedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  }, [user]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          conversation_id,
          sender_id,
          content,
          message_type,
          metadata,
          created_at,
          profiles:sender_id (
            display_name,
            username,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  }, []);

  // Send message
  const sendMessage = useCallback(async (
    conversationId: string, 
    content: string, 
    messageType: 'text' | 'image' | 'challenge_share' = 'text', 
    metadata: any = {}
  ) => {
    if (!user) return false;

    try {
      const messageData = {
        conversation_id: conversationId,
        sender_id: user.id,
        content,
        message_type: messageType,
        metadata
      };

      // Send via WebSocket (will also save to database)
      await websocketService.sendMessage(messageData);
      
      // Update local state immediately for better UX
      const tempMessage: ChatMessage = {
        id: `temp_${Date.now()}`,
        conversation_id: conversationId,
        sender_id: user.id,
        content,
        message_type: messageType,
        metadata,
        created_at: new Date().toISOString(),
        profiles: {
          display_name: user.user_metadata?.display_name || 'You',
          username: user.user_metadata?.username || 'user',
          avatar_url: user.user_metadata?.avatar_url || ''
        }
      };

      setMessages(prev => [...prev, tempMessage]);
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }, [user]);

  // Create conversation
  const createConversation = useCallback(async (otherUserId: string) => {
    if (!user) return null;

    try {
      // Use database function to get or create conversation
      const { data, error } = await supabase.rpc('get_or_create_conversation', {
        user1_id: user.id,
        user2_id: otherUserId
      });

      if (error) {
        console.log('Database not available, using localStorage fallback');
        const conversationId = `conv_${user.id}_${otherUserId}_${Date.now()}`;
        
        const conversations = JSON.parse(localStorage.getItem(`conversations_${user.id}`) || '[]');
        const newConversation = {
          id: conversationId,
          participants: [user.id, otherUserId],
          created_at: new Date().toISOString()
        };
        
        conversations.push(newConversation);
        localStorage.setItem(`conversations_${user.id}`, JSON.stringify(conversations));
        
        return conversationId;
      }

      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  }, [user]);

  // Start chat
  const startChat = useCallback(async (userId: string) => {
    const conversationId = await createConversation(userId);
    if (conversationId) {
      setCurrentConversation(conversationId);
      await fetchMessages(conversationId);
    }
    return conversationId;
  }, [createConversation, fetchMessages]);

  // Send typing indicator
  const sendTyping = useCallback((conversationId: string, isTyping: boolean) => {
    if (!user) return;
    
    const userName = user.user_metadata?.display_name || user.user_metadata?.username || 'User';
    websocketService.sendTyping(conversationId, isTyping, userName);
  }, [user]);

  // Handle typing with debounce
  const handleTyping = useCallback((conversationId: string) => {
    if (!user) return;

    // Send typing indicator
    sendTyping(conversationId, true);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(conversationId, false);
    }, 3000);
  }, [user, sendTyping]);

  // Connect user
  const connectUser = useCallback(async (userId: string) => {
    if (!user) return false;

    try {
      const savedConnections = localStorage.getItem(`connections_${user.id}`);
      const connections = savedConnections ? JSON.parse(savedConnections) : [];
      
      const newConnection = {
        id: `conn_${Date.now()}`,
        user_id: user.id,
        connected_user_id: userId,
        created_at: new Date().toISOString()
      };

      const updatedConnections = [...connections, newConnection];
      localStorage.setItem(`connections_${user.id}`, JSON.stringify(updatedConnections));
      
      await fetchConnectedUsers();
      return true;
    } catch (error) {
      console.error('Error connecting user:', error);
      return false;
    }
  }, [user, fetchConnectedUsers]);

  // Disconnect user
  const disconnectUser = useCallback(async (userId: string) => {
    if (!user) return false;

    try {
      const savedConnections = localStorage.getItem(`connections_${user.id}`);
      if (savedConnections) {
        const connections = JSON.parse(savedConnections);
        const updatedConnections = connections.filter((conn: any) => conn.connected_user_id !== userId);
        localStorage.setItem(`connections_${user.id}`, JSON.stringify(updatedConnections));
      }
      
      await fetchConnectedUsers();
      return true;
    } catch (error) {
      console.error('Error disconnecting user:', error);
      return false;
    }
  }, [user, fetchConnectedUsers]);

  // Check if user is connected
  const isUserConnected = useCallback((userId: string) => {
    const savedConnections = localStorage.getItem(`connections_${user?.id}`);
    if (!savedConnections) return false;
    
    const connections = JSON.parse(savedConnections);
    return connections.some((conn: any) => conn.connected_user_id === userId);
  }, [user]);

  // Get connected user IDs
  const getConnectedUserIds = useCallback(() => {
    const savedConnections = localStorage.getItem(`connections_${user?.id}`);
    if (!savedConnections) return [];
    
    const connections = JSON.parse(savedConnections);
    return connections.map((conn: any) => conn.connected_user_id);
  }, [user]);

  // Mark conversation as read
  const markAsRead = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  }, [user]);

  // Initialize
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchConnectedUsers();
      await fetchConversations();
      setLoading(false);
    };

    loadData();
  }, [fetchConnectedUsers, fetchConversations]);

  // WebSocket event handlers
  useEffect(() => {
    const unsubscribeMessage = websocketService.onMessage((message: ChatMessage) => {
      console.log('📨 Received message:', message);
      setMessages(prev => {
        // Avoid duplicates
        if (prev.some(msg => msg.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    const unsubscribeTyping = websocketService.onTyping((typing: TypingIndicator) => {
      console.log('⌨️ Typing indicator:', typing);
      setTypingUsers(prev => {
        const filtered = prev.filter(t => t.user_id !== typing.user_id);
        if (typing.is_typing) {
          return [...filtered, typing];
        }
        return filtered;
      });
    });

    const unsubscribeConnection = websocketService.onConnection((connected: boolean) => {
      console.log('🔌 Connection status:', connected);
      setIsConnected(connected);
    });

    return () => {
      unsubscribeMessage();
      unsubscribeTyping();
      unsubscribeConnection();
    };
  }, []);

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    conversations,
    messages,
    connectedUsers,
    loading,
    currentConversation,
    setCurrentConversation,
    typingUsers,
    isConnected: isConnected,
    fetchMessages,
    sendMessage,
    createConversation,
    startChat,
    markAsRead,
    connectUser,
    disconnectUser,
    isUserConnected: isUserConnected,
    getConnectedUserIds,
    sendTyping,
    handleTyping,
    websocketConnected: isConnected,
    refetch: () => {
      fetchConnectedUsers();
      fetchConversations();
    }
  };
};
