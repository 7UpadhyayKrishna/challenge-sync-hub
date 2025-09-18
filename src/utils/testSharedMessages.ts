// Test shared message system
import SharedMessageManager from './sharedMessages';

export const testSharedMessages = () => {
  console.log('🧪 Testing shared message system...');
  
  const conversationId = 'test_shared_conv_123';
  const manager = SharedMessageManager.getInstance();
  
  // Clear any existing messages
  manager.clearMessages(conversationId);
  
  // Test message 1
  const message1 = {
    id: `msg_${Date.now()}`,
    conversationId: conversationId,
    senderId: 'user1',
    content: 'Hello from User 1!',
    messageType: 'text',
    metadata: {},
    createdAt: new Date().toISOString(),
    profiles: {
      display_name: 'User 1',
      username: 'user1',
      avatar_url: ''
    }
  };
  
  // Save message 1
  manager.saveMessage(message1);
  console.log('✅ Message 1 saved');
  
  // Test message 2
  const message2 = {
    id: `msg_${Date.now() + 1}`,
    conversationId: conversationId,
    senderId: 'user2',
    content: 'Hello back from User 2!',
    messageType: 'text',
    metadata: {},
    createdAt: new Date().toISOString(),
    profiles: {
      display_name: 'User 2',
      username: 'user2',
      avatar_url: ''
    }
  };
  
  // Save message 2
  manager.saveMessage(message2);
  console.log('✅ Message 2 saved');
  
  // Get all messages
  const allMessages = manager.getMessages(conversationId);
  console.log('📨 All messages:', allMessages);
  console.log('📊 Message count:', allMessages.length);
  
  // Test getting messages from a new instance (simulating different user)
  const newManager = SharedMessageManager.getInstance();
  const messagesFromNewInstance = newManager.getMessages(conversationId);
  console.log('🔄 Messages from new instance:', messagesFromNewInstance);
  
  return allMessages;
};

// Test conversation creation
export const testSharedConversation = () => {
  console.log('🧪 Testing shared conversation...');
  
  const conversationId = 'shared_conv_test';
  const manager = SharedMessageManager.getInstance();
  
  // Clear existing messages
  manager.clearMessages(conversationId);
  
  // Create multiple messages
  const messages = [
    {
      id: `msg_${Date.now()}`,
      conversationId: conversationId,
      senderId: 'alice',
      content: 'Hi Bob!',
      messageType: 'text',
      metadata: {},
      createdAt: new Date().toISOString(),
      profiles: {
        display_name: 'Alice',
        username: 'alice',
        avatar_url: ''
      }
    },
    {
      id: `msg_${Date.now() + 1}`,
      conversationId: conversationId,
      senderId: 'bob',
      content: 'Hi Alice! How are you?',
      messageType: 'text',
      metadata: {},
      createdAt: new Date().toISOString(),
      profiles: {
        display_name: 'Bob',
        username: 'bob',
        avatar_url: ''
      }
    },
    {
      id: `msg_${Date.now() + 2}`,
      conversationId: conversationId,
      senderId: 'alice',
      content: 'I\'m doing great! Thanks for asking.',
      messageType: 'text',
      metadata: {},
      createdAt: new Date().toISOString(),
      profiles: {
        display_name: 'Alice',
        username: 'alice',
        avatar_url: ''
      }
    }
  ];
  
  // Save all messages
  messages.forEach(msg => manager.saveMessage(msg));
  
  // Get all messages
  const allMessages = manager.getMessages(conversationId);
  console.log('💬 Conversation messages:', allMessages);
  
  return allMessages;
};

// Add to window for easy testing
if (typeof window !== 'undefined') {
  (window as any).testSharedMessages = testSharedMessages;
  (window as any).testSharedConversation = testSharedConversation;
  (window as any).SharedMessageManager = SharedMessageManager;
  
  console.log('🔧 Shared message test functions available:');
  console.log('  - testSharedMessages() - Test basic message sharing');
  console.log('  - testSharedConversation() - Test conversation with multiple messages');
  console.log('  - SharedMessageManager - Access the message manager directly');
}
