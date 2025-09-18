// WebSocket service for real-time chat
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'challenge_share';
  metadata: any;
  created_at: string;
  profiles: {
    display_name?: string;
    username?: string;
    avatar_url?: string;
  };
}

export interface TypingIndicator {
  user_id: string;
  conversation_id: string;
  is_typing: boolean;
  user_name: string;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnected = false;
  private messageHandlers: ((message: ChatMessage) => void)[] = [];
  private typingHandlers: ((typing: TypingIndicator) => void)[] = [];
  private connectionHandlers: ((connected: boolean) => void)[] = [];

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      // For now, we'll use a simple WebSocket server
      // In production, you'd use a proper WebSocket server like Socket.io
      this.ws = new WebSocket('ws://localhost:8080');
      
      this.ws.onopen = () => {
        console.log('🔌 WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.connectionHandlers.forEach(handler => handler(true));
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        this.isConnected = false;
        this.connectionHandlers.forEach(handler => handler(false));
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnected = false;
      };

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('❌ Max reconnection attempts reached');
    }
  }

  private handleMessage(data: any) {
    switch (data.type) {
      case 'message':
        this.messageHandlers.forEach(handler => handler(data.payload));
        break;
      case 'typing':
        this.typingHandlers.forEach(handler => handler(data.payload));
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  // Send message
  async sendMessage(message: Omit<ChatMessage, 'id' | 'created_at' | 'profiles'>) {
    if (!this.isConnected) {
      console.log('WebSocket not connected, saving to database only');
      return this.saveMessageToDatabase(message);
    }

    try {
      const messageData = {
        type: 'message',
        payload: message
      };
      
      this.ws?.send(JSON.stringify(messageData));
      console.log('📤 Message sent via WebSocket:', message);
    } catch (error) {
      console.error('Error sending message:', error);
      return this.saveMessageToDatabase(message);
    }
  }

  // Send typing indicator
  sendTyping(conversationId: string, isTyping: boolean, userName: string) {
    if (!this.isConnected) return;

    try {
      const typingData = {
        type: 'typing',
        payload: {
          user_id: supabase.auth.getUser()?.id,
          conversation_id: conversationId,
          is_typing: isTyping,
          user_name: userName
        }
      };
      
      this.ws?.send(JSON.stringify(typingData));
    } catch (error) {
      console.error('Error sending typing indicator:', error);
    }
  }

  // Save message to database
  private async saveMessageToDatabase(message: Omit<ChatMessage, 'id' | 'created_at' | 'profiles'>) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: message.conversation_id,
          sender_id: message.sender_id,
          content: message.content,
          message_type: message.message_type,
          metadata: message.metadata
        })
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
        .single();

      if (error) {
        console.error('Error saving message to database:', error);
        return null;
      }

      console.log('💾 Message saved to database:', data);
      return data;
    } catch (error) {
      console.error('Error saving message to database:', error);
      return null;
    }
  }

  // Subscribe to messages
  onMessage(handler: (message: ChatMessage) => void) {
    this.messageHandlers.push(handler);
    return () => {
      const index = this.messageHandlers.indexOf(handler);
      if (index > -1) {
        this.messageHandlers.splice(index, 1);
      }
    };
  }

  // Subscribe to typing indicators
  onTyping(handler: (typing: TypingIndicator) => void) {
    this.typingHandlers.push(handler);
    return () => {
      const index = this.typingHandlers.indexOf(handler);
      if (index > -1) {
        this.typingHandlers.splice(index, 1);
      }
    };
  }

  // Subscribe to connection status
  onConnection(handler: (connected: boolean) => void) {
    this.connectionHandlers.push(handler);
    return () => {
      const index = this.connectionHandlers.indexOf(handler);
      if (index > -1) {
        this.connectionHandlers.splice(index, 1);
      }
    };
  }

  // Disconnect
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  // Get connection status
  getConnectionStatus() {
    return this.isConnected;
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
export default websocketService;
