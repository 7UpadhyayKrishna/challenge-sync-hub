import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, MessageSquare, TrendingUp, Filter, Plus, Search, UserPlus, Trophy, Flame } from 'lucide-react';
import Header from '@/components/Header';
import { PostCard } from '@/components/PostCard';
import { CreatePostModal } from '@/components/CreatePostModal';
import { CommunityChallengeFeed } from '@/components/CommunityChallengeFeed';
import { useCommunity } from '@/hooks/useCommunity';
import { useMembers } from '@/hooks/useMembers';
import { useRealTimeChat } from '@/hooks/useRealTimeChat';
import { useAuth } from '@/hooks/useAuth';
import RealTimeChatButton from '@/components/RealTimeChatButton';

const Community = () => {
  const { 
    posts, 
    challenges, 
    loading, 
    sortBy, 
    setSortBy, 
    filterBy, 
    setFilterBy 
  } = useCommunity();
  const { 
    members, 
    loading: membersLoading, 
    connectMember, 
    disconnectMember, 
    isConnected, 
    getConnectedMemberIds 
  } = useMembers();
  const { user } = useAuth();
  const { connectUser, disconnectUser } = useRealTimeChat();
  const [activeTab, setActiveTab] = useState('feed');
  const [memberSearch, setMemberSearch] = useState('');

  // Get unique challenge options for filtering
  const challengeOptions = Array.from(
    new Set(
      posts
        .filter(post => post.challenges)
        .map(post => ({ 
          id: post.challenge_id!, 
          title: post.challenges!.title 
        }))
    )
  );

  // Filter members based on search
  const filteredMembers = members.filter(member => 
    (member.display_name || '').toLowerCase().includes(memberSearch.toLowerCase()) ||
    (member.username || '').toLowerCase().includes(memberSearch.toLowerCase()) ||
    (member.bio || '').toLowerCase().includes(memberSearch.toLowerCase())
  );

  const handleConnectMember = async (memberId: string) => {
    if (isConnected(memberId)) {
      await disconnectMember(memberId);
    } else {
      await connectMember(memberId);
    }
  };

  const handleChatWithMember = async (memberId: string) => {
    // This will be handled by the ChatButton component
  };

  if (loading || membersLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-full"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Community</h1>
          <p className="text-muted-foreground">
            Connect with fellow challengers, share your progress, and discover new challenges.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid grid-cols-3 w-full max-w-2xl">
              <TabsTrigger value="feed" className="flex items-center space-x-2 whitespace-nowrap">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Community Feed</span>
                <span className="sm:hidden">Feed</span>
              </TabsTrigger>
              <TabsTrigger value="members" className="flex items-center space-x-2 whitespace-nowrap">
                <Users className="w-4 h-4" />
                <span>Members</span>
              </TabsTrigger>
              <TabsTrigger value="challenges" className="flex items-center space-x-2 whitespace-nowrap">
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Active Challenges</span>
                <span className="sm:hidden">Challenges</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center space-x-2">
              {user && activeTab === 'feed' && (
                <CreatePostModal />
              )}
              {user && (
                <RealTimeChatButton />
              )}
            </div>
          </div>

          <TabsContent value="feed" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Filter className="w-5 h-5" />
                  <span>Filters</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Sort by:</span>
                    <Select value={sortBy} onValueChange={(value: 'latest' | 'popular') => setSortBy(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="latest">
                          <div className="flex items-center space-x-2">
                            <span>Latest</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="popular">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4" />
                            <span>Popular</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator orientation="vertical" className="h-6" />

                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Filter by challenge:</span>
                    <Select value={filterBy} onValueChange={setFilterBy}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Posts</SelectItem>
                        {challengeOptions.map((challenge) => (
                          <SelectItem key={challenge.id} value={challenge.id}>
                            {challenge.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {getConnectedMemberIds().length > 0 && (
                    <>
                      <Separator orientation="vertical" className="h-6" />
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Showing:</span>
                        <Badge variant="secondary" className="text-xs">
                          {getConnectedMemberIds().length} connected members
                        </Badge>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Posts Feed */}
            <div className="space-y-6">
              {posts.length > 0 ? (
                posts
                  .filter(post => {
                    // Show posts from connected members or all posts if no connections
                    const connectedMemberIds = getConnectedMemberIds();
                    if (connectedMemberIds.length === 0) return true;
                    return connectedMemberIds.includes(post.user_id);
                  })
                  .map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Posts Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Be the first to share something with the community!
                      </p>
                      {user && (
                        <CreatePostModal 
                          trigger={
                            <Button>
                              <Plus className="w-4 h-4 mr-2" />
                              Create First Post
                            </Button>
                          } 
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            {/* Members Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Community Members</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search members by name, username, or bio..."
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {filteredMembers.length} members found
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.map((member) => (
                <Card key={member.id} className="group hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={member.avatar_url || ''} alt={member.display_name || 'User'} />
                          <AvatarFallback>
                            {(member.display_name || member.username || 'U').split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        {member.is_online && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground truncate">{member.display_name || member.username || 'Anonymous'}</h3>
                            <p className="text-sm text-muted-foreground">@{member.username || 'user'}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {isConnected(member.id) && (
                              <RealTimeChatButton 
                                selectedUserId={member.user_id}
                                className="text-xs px-2 py-1 h-8"
                              />
                            )}
                            <Button
                              variant={isConnected(member.id) ? "outline" : "default"}
                              size="sm"
                              onClick={() => handleConnectMember(member.id)}
                            >
                              {isConnected(member.id) ? (
                                <>
                                  <UserPlus className="w-4 h-4 mr-1" />
                                  Connected
                                </>
                              ) : (
                                <>
                                  <UserPlus className="w-4 h-4 mr-1" />
                                  Connect
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {member.bio || 'No bio available'}
                        </p>
                        
                        <div className="flex items-center space-x-4 mt-3">
                          <div className="flex items-center space-x-1">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium">{member.challenges_completed}</span>
                            <span className="text-xs text-muted-foreground">completed</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Flame className="w-4 h-4 text-orange-500" />
                            <span className="text-sm font-medium">{member.current_streak}</span>
                            <span className="text-xs text-muted-foreground">day streak</span>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <Badge variant="secondary" className="text-xs">
                            Joined {new Date(member.created_at).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredMembers.length === 0 && (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Members Found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search terms to find community members.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="challenges" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Active Challenges</h2>
                <p className="text-sm text-muted-foreground">
                  Discover and join challenges created by the community
                </p>
              </div>
            </div>

            <CommunityChallengeFeed challenges={challenges} loading={loading} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Community;