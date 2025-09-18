import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import SharedMessageManager from '@/utils/sharedMessages';
import { supabase } from '@/integrations/supabase/client';

interface SimpleMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: string;
  metadata: any;
  createdAt: string;
  profiles: {
    display_name?: string;
    username?: string;
    avatar_url?: string;
  };
}

interface SimpleUser {
  id: string;
  user_id: string;
  display_name?: string;
  username?: string;
  avatar_url?: string;
  is_online: boolean;
  last_seen?: string;
}

export const useSimpleChat = () => {
  const [messages, setMessages] = useState<SimpleMessage[]>([]);
  const [connectedUsers, setConnectedUsers] = useState<SimpleUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchConnectedUsers = async () => {
    if (!user) return;

    try {
      // Get connections from localStorage
      const savedConnections = localStorage.getItem(`connections_${user.id}`);
      if (savedConnections) {
        const connections = JSON.parse(savedConnections);
        
        // Get user details for connected users
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
            // Fallback to mock data if database fails
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

          // Convert profiles to chat users
          const chatUsers = profiles.map((profile: any) => ({
            id: profile.id,
            user_id: profile.user_id,
            display_name: profile.display_name || profile.username || 'Unknown User',
            username: profile.username || 'user',
            avatar_url: profile.avatar_url || '',
            is_online: Math.random() > 0.5, // Mock online status for now
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
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const messages = SharedMessageManager.getInstance().getMessages(conversationId);
      console.log('Loaded messages from shared manager:', messages);
      setMessages(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  const sendMessage = async (conversationId: string, content: string, messageType: string = 'text', metadata: any = {}) => {
    if (!user) return false;

    console.log('Sending message:', { conversationId, content, user: user.id });

    try {
      const message = {
        id: `msg_${Date.now()}`,
        conversationId: conversationId,
        senderId: user.id,
        content,
        messageType: messageType,
        metadata,
        createdAt: new Date().toISOString(),
        profiles: {
          display_name: user.user_metadata?.display_name || 'You',
          username: user.user_metadata?.username || 'user',
          avatar_url: user.user_metadata?.avatar_url || ''
        }
      };
      
      // Save to shared message manager
      SharedMessageManager.getInstance().saveMessage(message);
      
      // Update local state
      const updatedMessages = SharedMessageManager.getInstance().getMessages(conversationId);
      setMessages(updatedMessages);
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  };

  const createConversation = async (otherUserId: string) => {
    if (!user) return null;

    console.log('Creating conversation between:', user.id, 'and', otherUserId);

    try {
      // Create conversation ID
      const conversationId = `conv_${user.id}_${otherUserId}_${Date.now()}`;
      console.log('Generated conversation ID:', conversationId);
      
      // Save conversation to localStorage
      const conversations = JSON.parse(localStorage.getItem(`conversations_${user.id}`) || '[]');
      const newConversation = {
        id: conversationId,
        participants: [user.id, otherUserId],
        created_at: new Date().toISOString()
      };
      
      conversations.push(newConversation);
      localStorage.setItem(`conversations_${user.id}`, JSON.stringify(conversations));
      
      console.log('Created new conversation:', newConversation);
      return conversationId;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };

  const startChat = async (userId: string) => {
    console.log('Starting chat with user:', userId);
    const conversationId = await createConversation(userId);
    console.log('Created conversation ID:', conversationId);
    if (conversationId) {
      setCurrentConversation(conversationId);
      await fetchMessages(conversationId);
    }
    return conversationId;
  };

  const connectUser = async (userId: string) => {
    if (!user) return false;

    try {
      // Save to localStorage
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
      
      fetchConnectedUsers();
      return true;
    } catch (error) {
      console.error('Error connecting user:', error);
      return false;
    }
  };

  const disconnectUser = async (userId: string) => {
    if (!user) return false;

    try {
      const savedConnections = localStorage.getItem(`connections_${user.id}`);
      if (savedConnections) {
        const connections = JSON.parse(savedConnections);
        const updatedConnections = connections.filter((conn: any) => conn.connected_user_id !== userId);
        localStorage.setItem(`connections_${user.id}`, JSON.stringify(updatedConnections));
      }
      
      fetchConnectedUsers();
      return true;
    } catch (error) {
      console.error('Error disconnecting user:', error);
      return false;
    }
  };

  const isConnected = (userId: string) => {
    const savedConnections = localStorage.getItem(`connections_${user?.id}`);
    if (!savedConnections) return false;
    
    const connections = JSON.parse(savedConnections);
    return connections.some((conn: any) => conn.connected_user_id === userId);
  };

  const getConnectedUserIds = () => {
    const savedConnections = localStorage.getItem(`connections_${user?.id}`);
    if (!savedConnections) return [];
    
    const connections = JSON.parse(savedConnections);
    return connections.map((conn: any) => conn.connected_user_id);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchConnectedUsers();
      setLoading(false);
    };

    loadData();
  }, [user]);

  return {
    messages,
    connectedUsers,
    loading,
    currentConversation,
    setCurrentConversation,
    fetchMessages,
    sendMessage,
    createConversation,
    startChat,
    connectUser,
    disconnectUser,
    isConnected,
    getConnectedUserIds,
    refetch: () => {
      fetchConnectedUsers();
    }
  };
};
