// Simple message broadcasting system for chat
// This simulates real-time messaging by using a shared storage approach

interface BroadcastMessage {
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

class MessageBroadcaster {
  private static instance: MessageBroadcaster;
  private listeners: Map<string, ((message: BroadcastMessage) => void)[]> = new Map();

  static getInstance(): MessageBroadcaster {
    if (!MessageBroadcaster.instance) {
      MessageBroadcaster.instance = new MessageBroadcaster();
    }
    return MessageBroadcaster.instance;
  }

  // Subscribe to messages for a conversation
  subscribe(conversationId: string, callback: (message: BroadcastMessage) => void) {
    if (!this.listeners.has(conversationId)) {
      this.listeners.set(conversationId, []);
    }
    this.listeners.get(conversationId)!.push(callback);
  }

  // Unsubscribe from messages
  unsubscribe(conversationId: string, callback: (message: BroadcastMessage) => void) {
    const listeners = this.listeners.get(conversationId);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Broadcast a message to all subscribers
  broadcast(message: BroadcastMessage) {
    const listeners = this.listeners.get(message.conversationId);
    if (listeners) {
      listeners.forEach(callback => callback(message));
    }
  }

  // Save message to shared storage (simulates database)
  saveMessage(message: BroadcastMessage) {
    const key = `shared_messages_${message.conversationId}`;
    const messages = JSON.parse(localStorage.getItem(key) || '[]');
    messages.push(message);
    localStorage.setItem(key, JSON.stringify(messages));
    
    // Broadcast to all listeners
    this.broadcast(message);
  }

  // Get messages for a conversation
  getMessages(conversationId: string): BroadcastMessage[] {
    const key = `shared_messages_${conversationId}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  // Clear messages for a conversation (for testing)
  clearMessages(conversationId: string) {
    const key = `shared_messages_${conversationId}`;
    localStorage.removeItem(key);
  }
}

export default MessageBroadcaster;
