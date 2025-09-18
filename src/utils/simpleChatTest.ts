// Simple chat test utility
// Run this in browser console to test message sharing

export const testSimpleChat = () => {
  console.log('🧪 Testing simple chat functionality...');
  
  // Test conversation ID
  const conversationId = 'test_conv_123';
  
  // Test message 1
  const message1 = {
    id: `msg_${Date.now()}`,
    conversation_id: conversationId,
    sender_id: 'user1',
    content: 'Hello from User 1!',
    message_type: 'text',
    metadata: {},
    created_at: new Date().toISOString(),
    profiles: {
      display_name: 'User 1',
      username: 'user1',
      avatar_url: ''
    }
  };
  
  // Save message 1
  const storageKey = `chat_messages_${conversationId}`;
  const messages = JSON.parse(localStorage.getItem(storageKey) || '[]');
  messages.push(message1);
  localStorage.setItem(storageKey, JSON.stringify(messages));
  
  console.log('✅ Message 1 saved:', message1);
  console.log('📦 Storage key:', storageKey);
  console.log('💾 All messages:', messages);
  
  // Test message 2
  setTimeout(() => {
    const message2 = {
      id: `msg_${Date.now() + 1}`,
      conversation_id: conversationId,
      sender_id: 'user2',
      content: 'Hello back from User 2!',
      message_type: 'text',
      metadata: {},
      created_at: new Date().toISOString(),
      profiles: {
        display_name: 'User 2',
        username: 'user2',
        avatar_url: ''
      }
    };
    
    const updatedMessages = JSON.parse(localStorage.getItem(storageKey) || '[]');
    updatedMessages.push(message2);
    localStorage.setItem(storageKey, JSON.stringify(updatedMessages));
    
    console.log('✅ Message 2 saved:', message2);
    console.log('💾 All messages after 2:', updatedMessages);
  }, 1000);
  
  // Test reading messages
  setTimeout(() => {
    const allMessages = JSON.parse(localStorage.getItem(storageKey) || '[]');
    console.log('📨 Final message count:', allMessages.length);
    console.log('📨 All messages:', allMessages);
  }, 2000);
};

// Test conversation creation
export const testConversationCreation = () => {
  console.log('🧪 Testing conversation creation...');
  
  const user1 = 'user1_id';
  const user2 = 'user2_id';
  const conversationId = `conv_${user1}_${user2}_${Date.now()}`;
  
  console.log('👤 User 1:', user1);
  console.log('👤 User 2:', user2);
  console.log('💬 Conversation ID:', conversationId);
  
  // Create conversation
  const conversation = {
    id: conversationId,
    participants: [user1, user2],
    created_at: new Date().toISOString()
  };
  
  localStorage.setItem(`conversations_${user1}`, JSON.stringify([conversation]));
  localStorage.setItem(`conversations_${user2}`, JSON.stringify([conversation]));
  
  console.log('✅ Conversation created:', conversation);
  
  return conversationId;
};

// Add to window for easy testing
if (typeof window !== 'undefined') {
  (window as any).testSimpleChat = testSimpleChat;
  (window as any).testConversationCreation = testConversationCreation;
  
  console.log('🔧 Chat test functions available:');
  console.log('  - testSimpleChat() - Test message sending/receiving');
  console.log('  - testConversationCreation() - Test conversation creation');
}
