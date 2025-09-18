// Shared message system that works across different users
// This simulates a shared database using a common storage approach

interface SharedMessage {
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

class SharedMessageManager {
  private static instance: SharedMessageManager;
  private messages: Map<string, SharedMessage[]> = new Map();

  static getInstance(): SharedMessageManager {
    if (!SharedMessageManager.instance) {
      SharedMessageManager.instance = new SharedMessageManager();
    }
    return SharedMessageManager.instance;
  }

  // Save message to shared storage
  saveMessage(message: SharedMessage) {
    const conversationId = message.conversationId;
    
    // Get existing messages for this conversation
    const existingMessages = this.messages.get(conversationId) || [];
    
    // Add new message
    existingMessages.push(message);
    
    // Save to map
    this.messages.set(conversationId, existingMessages);
    
    // Also save to localStorage as backup
    const storageKey = `shared_messages_${conversationId}`;
    localStorage.setItem(storageKey, JSON.stringify(existingMessages));
    
    console.log('Message saved to shared storage:', message);
    console.log('All messages for conversation:', existingMessages);
    
    return message;
  }

  // Get messages for a conversation
  getMessages(conversationId: string): SharedMessage[] {
    // First check in-memory storage
    let messages = this.messages.get(conversationId) || [];
    
    // If no messages in memory, check localStorage
    if (messages.length === 0) {
      const storageKey = `shared_messages_${conversationId}`;
      const storedMessages = JSON.parse(localStorage.getItem(storageKey) || '[]');
      messages = storedMessages;
      
      // Load into memory for future use
      this.messages.set(conversationId, messages);
    }
    
    // Sort by creation time
    messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    console.log('Retrieved messages for conversation:', conversationId, messages);
    return messages;
  }

  // Clear messages for a conversation (for testing)
  clearMessages(conversationId: string) {
    this.messages.delete(conversationId);
    const storageKey = `shared_messages_${conversationId}`;
    localStorage.removeItem(storageKey);
    console.log('Cleared messages for conversation:', conversationId);
  }

  // Get all conversations
  getAllConversations(): string[] {
    return Array.from(this.messages.keys());
  }

  // Get message count for a conversation
  getMessageCount(conversationId: string): number {
    const messages = this.getMessages(conversationId);
    return messages.length;
  }
}

export default SharedMessageManager;
