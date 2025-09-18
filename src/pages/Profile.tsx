import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Trophy, Target, Calendar, Edit2, Save, X } from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface UserProfile {
  id: string;
  user_id: string;
  display_name?: string;
  username?: string;
  bio?: string;
  avatar_url?: string;
}

interface UserStats {
  totalChallenges: number;
  completedChallenges: number;
  activeChallenges: number;
  totalPosts: number;
  totalLikes: number;
}

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({
    totalChallenges: 0,
    completedChallenges: 0,
    activeChallenges: 0,
    totalPosts: 0,
    totalLikes: 0
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    display_name: '',
    username: '',
    bio: '',
    avatar_url: ''
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      setProfile(profileData);
      
      if (profileData) {
        setEditForm({
          display_name: profileData.display_name || '',
          username: profileData.username || '',
          bio: profileData.bio || '',
          avatar_url: profileData.avatar_url || ''
        });
      }

      // Fetch user statistics
      const [challengesResult, postsResult] = await Promise.all([
        supabase
          .from('challenge_participants')
          .select('*, challenges:challenge_id(*)')
          .eq('user_id', user.id),
        supabase
          .from('posts')
          .select('*, likes:likes(count)')
          .eq('user_id', user.id)
      ]);

      if (challengesResult.data) {
        const total = challengesResult.data.length;
        const completed = challengesResult.data.filter(p => p.is_completed).length;
        const active = total - completed;

        setStats(prev => ({
          ...prev,
          totalChallenges: total,
          completedChallenges: completed,
          activeChallenges: active
        }));
      }

      if (postsResult.data) {
        const totalPosts = postsResult.data.length;
        const totalLikes = postsResult.data.reduce((sum, post) => sum + (post.likes_count || 0), 0);

        setStats(prev => ({
          ...prev,
          totalPosts,
          totalLikes
        }));
      }

    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: editForm.display_name.trim() || null,
          username: editForm.username.trim() || null,
          bio: editForm.bio.trim() || null,
          avatar_url: editForm.avatar_url.trim() || null
        });

      if (error) throw error;

      toast({
        title: "Profile updated!",
        description: "Your profile has been successfully updated."
      });

      setEditing(false);
      fetchProfile(); // Refresh profile data
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setEditForm({
        display_name: profile.display_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || ''
      });
    }
    setEditing(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-48 bg-muted rounded"></div>
          </div>
        </main>
      </div>
    );
  }

  const displayName = profile?.display_name || profile?.username || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
          <p className="text-muted-foreground">
            Manage your profile and view your challenge statistics.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-2">
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Profile Information</CardTitle>
                {!editing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(true)}
                    className="flex items-center space-x-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      className="flex items-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveProfile}
                      className="flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </Button>
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={editing ? editForm.avatar_url : profile?.avatar_url} />
                    <AvatarFallback className="text-2xl">
                      <User className="w-8 h-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">{displayName}</h2>
                    <p className="text-muted-foreground">{user?.email}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="display_name">Display Name</Label>
                      {editing ? (
                        <Input
                          id="display_name"
                          value={editForm.display_name}
                          onChange={(e) => setEditForm(prev => ({
                            ...prev,
                            display_name: e.target.value
                          }))}
                          placeholder="Enter your display name"
                          className="mt-2"
                        />
                      ) : (
                        <p className="mt-2 text-sm">{profile?.display_name || 'Not set'}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="username">Username</Label>
                      {editing ? (
                        <Input
                          id="username"
                          value={editForm.username}
                          onChange={(e) => setEditForm(prev => ({
                            ...prev,
                            username: e.target.value
                          }))}
                          placeholder="Enter your username"
                          className="mt-2"
                        />
                      ) : (
                        <p className="mt-2 text-sm">{profile?.username || 'Not set'}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    {editing ? (
                      <Textarea
                        id="bio"
                        value={editForm.bio}
                        onChange={(e) => setEditForm(prev => ({
                          ...prev,
                          bio: e.target.value
                        }))}
                        placeholder="Tell us about yourself..."
                        className="mt-2 min-h-[100px]"
                      />
                    ) : (
                      <p className="mt-2 text-sm">{profile?.bio || 'No bio yet'}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="avatar_url">Avatar URL</Label>
                    {editing ? (
                      <Input
                        id="avatar_url"
                        value={editForm.avatar_url}
                        onChange={(e) => setEditForm(prev => ({
                          ...prev,
                          avatar_url: e.target.value
                        }))}
                        placeholder="https://example.com/avatar.jpg"
                        className="mt-2"
                      />
                    ) : (
                      <p className="mt-2 text-sm">{profile?.avatar_url || 'Not set'}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistics */}
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5" />
                  <span>Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{stats.totalChallenges}</div>
                    <div className="text-xs text-muted-foreground">Total Challenges</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.completedChallenges}</div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">{stats.activeChallenges}</div>
                    <div className="text-xs text-muted-foreground">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalPosts}</div>
                    <div className="text-xs text-muted-foreground">Posts</div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">{stats.totalLikes}</div>
                  <div className="text-xs text-muted-foreground">Total Likes Received</div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Account Info</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Member since:</span>{' '}
                  {user?.created_at ? formatDistanceToNow(new Date(user.created_at), { addSuffix: true }) : 'Unknown'}
                </div>
                <div>
                  <span className="font-medium">Email:</span>{' '}
                  {user?.email}
                </div>
                <div>
                  <span className="font-medium">Email verified:</span>{' '}
                  <Badge variant={user?.email_confirmed_at ? "secondary" : "destructive"}>
                    {user?.email_confirmed_at ? "Yes" : "No"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;