// Simple script to add sample data to Supabase
// Run this in the browser console on your app to add test data

const addSampleData = async () => {
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabaseUrl = 'YOUR_SUPABASE_URL';
  const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Add sample profiles
  const sampleProfiles = [
    {
      user_id: '00000000-0000-0000-0000-000000000001',
      display_name: 'Sarah Johnson',
      username: 'sarah_fitness',
      bio: 'Fitness enthusiast and wellness coach',
      avatar_url: ''
    },
    {
      user_id: '00000000-0000-0000-0000-000000000002',
      display_name: 'Mike Chen',
      username: 'mike_dev',
      bio: 'Developer learning new skills through challenges',
      avatar_url: ''
    },
    {
      user_id: '00000000-0000-0000-0000-000000000003',
      display_name: 'Emma Wilson',
      username: 'emma_wellness',
      bio: 'Mindfulness and meditation practitioner',
      avatar_url: ''
    }
  ];

  for (const profile of sampleProfiles) {
    const { error } = await supabase
      .from('profiles')
      .upsert(profile);
    
    if (error) {
      console.error('Error adding profile:', error);
    } else {
      console.log('Added profile:', profile.display_name);
    }
  }

  // Add sample challenges
  const sampleChallenges = [
    {
      id: 'challenge-1',
      creator_id: '00000000-0000-0000-0000-000000000001',
      title: '30-Day Fitness Challenge',
      description: 'Complete daily workouts for 30 days',
      duration_days: 30,
      category: 'Fitness',
      difficulty: 'Intermediate',
      daily_tasks: ['Morning workout', 'Evening stretch', 'Track progress'],
      is_active: true
    },
    {
      id: 'challenge-2',
      creator_id: '00000000-0000-0000-0000-000000000002',
      title: 'Coding Practice Challenge',
      description: 'Code for at least 1 hour daily',
      duration_days: 30,
      category: 'Learning',
      difficulty: 'Beginner',
      daily_tasks: ['Code for 1 hour', 'Review code', 'Learn something new'],
      is_active: true
    }
  ];

  for (const challenge of sampleChallenges) {
    const { error } = await supabase
      .from('challenges')
      .upsert(challenge);
    
    if (error) {
      console.error('Error adding challenge:', error);
    } else {
      console.log('Added challenge:', challenge.title);
    }
  }

  // Add sample posts
  const samplePosts = [
    {
      user_id: '00000000-0000-0000-0000-000000000001',
      challenge_id: 'challenge-1',
      content: 'Day 5 of my fitness challenge! Feeling stronger every day 💪',
      likes_count: 5,
      comments_count: 2
    },
    {
      user_id: '00000000-0000-0000-0000-000000000002',
      challenge_id: 'challenge-2',
      content: 'Just finished coding for 2 hours today. Learning React hooks!',
      likes_count: 3,
      comments_count: 1
    },
    {
      user_id: '00000000-0000-0000-0000-000000000003',
      content: 'Meditation session complete. Feeling centered and focused 🧘‍♀️',
      likes_count: 8,
      comments_count: 4
    }
  ];

  for (const post of samplePosts) {
    const { error } = await supabase
      .from('posts')
      .insert(post);
    
    if (error) {
      console.error('Error adding post:', error);
    } else {
      console.log('Added post:', post.content.substring(0, 50) + '...');
    }
  }

  console.log('Sample data added successfully!');
};

// Uncomment the line below to run the script
// addSampleData();
