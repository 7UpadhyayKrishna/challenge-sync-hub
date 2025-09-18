// Test utility to simulate message sharing between users
// This helps test the chat functionality

import MessageBroadcaster from './messageBroadcaster';

export const testMessageSharing = () => {
  console.log('🧪 Testing message sharing...');
  
  // Create a test conversation
  const conversationId = 'test_conversation_123';
  
  // Simulate user 1 sending a message
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
  
  // Save message
  MessageBroadcaster.getInstance().saveMessage(message1);
  console.log('✅ Message 1 saved:', message1);
  
  // Simulate user 2 sending a message
  setTimeout(() => {
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
    
    MessageBroadcaster.getInstance().saveMessage(message2);
    console.log('✅ Message 2 saved:', message2);
  }, 1000);
  
  // Get all messages for the conversation
  setTimeout(() => {
    const messages = MessageBroadcaster.getInstance().getMessages(conversationId);
    console.log('📨 All messages in conversation:', messages);
  }, 2000);
};

// Add to window for easy testing
if (typeof window !== 'undefined') {
  (window as any).testMessageSharing = testMessageSharing;
  (window as any).MessageBroadcaster = MessageBroadcaster;
}
