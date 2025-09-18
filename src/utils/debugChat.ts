// Debug utility for chat system
import { supabase } from '@/integrations/supabase/client';

export const debugChatUsers = async () => {
  console.log('🔍 Debugging chat users...');
  
  try {
    // Get all profiles from database
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
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching profiles:', error);
      return;
    }

    console.log('📊 All profiles in database:', profiles);
    console.log('👥 Total profiles:', profiles?.length || 0);

    // Check localStorage connections
    const currentUser = supabase.auth.getUser();
    if (currentUser) {
      const savedConnections = localStorage.getItem(`connections_${currentUser.id}`);
      if (savedConnections) {
        const connections = JSON.parse(savedConnections);
        console.log('🔗 Current user connections:', connections);
        
        const userIds = connections.map((conn: any) => conn.connected_user_id);
        console.log('🆔 Connected user IDs:', userIds);
        
        // Find matching profiles
        const connectedProfiles = profiles?.filter(profile => 
          userIds.includes(profile.user_id)
        ) || [];
        
        console.log('✅ Connected user profiles:', connectedProfiles);
      } else {
        console.log('❌ No connections found in localStorage');
      }
    }

  } catch (error) {
    console.error('❌ Debug error:', error);
  }
};

export const clearChatData = () => {
  console.log('🧹 Clearing all chat data...');
  
  // Clear localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('connections_') || key.startsWith('conversations_') || key.startsWith('shared_messages_'))) {
      localStorage.removeItem(key);
      console.log(`🗑️ Removed: ${key}`);
    }
  }
  
  console.log('✅ All chat data cleared');
};

export const testUserConnection = async (userId: string) => {
  console.log(`🔗 Testing connection to user: ${userId}`);
  
  try {
    const currentUser = supabase.auth.getUser();
    if (!currentUser) {
      console.log('❌ No current user found');
      return;
    }

    // Add connection to localStorage
    const savedConnections = localStorage.getItem(`connections_${currentUser.id}`);
    const connections = savedConnections ? JSON.parse(savedConnections) : [];
    
    const newConnection = {
      id: `conn_${Date.now()}`,
      user_id: currentUser.id,
      connected_user_id: userId,
      created_at: new Date().toISOString()
    };

    const updatedConnections = [...connections, newConnection];
    localStorage.setItem(`connections_${currentUser.id}`, JSON.stringify(updatedConnections));
    
    console.log('✅ Connection added:', newConnection);
    console.log('📋 All connections:', updatedConnections);
    
  } catch (error) {
    console.error('❌ Error testing connection:', error);
  }
};

// Add to window for easy testing
if (typeof window !== 'undefined') {
  (window as any).debugChatUsers = debugChatUsers;
  (window as any).clearChatData = clearChatData;
  (window as any).testUserConnection = testUserConnection;
  
  console.log('🔧 Chat debug functions available:');
  console.log('  - debugChatUsers() - Debug user data and connections');
  console.log('  - clearChatData() - Clear all chat data');
  console.log('  - testUserConnection(userId) - Test connecting to a user');
}
