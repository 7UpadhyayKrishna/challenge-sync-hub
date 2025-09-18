import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Users, MessageSquare, TrendingUp, Filter, Plus } from 'lucide-react';
import Header from '@/components/Header';
import { PostCard } from '@/components/PostCard';
import { CreatePostModal } from '@/components/CreatePostModal';
import { CommunityChallengeFeed } from '@/components/CommunityChallengeFeed';
import { useCommunity } from '@/hooks/useCommunity';
import { useAuth } from '@/hooks/useAuth';

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
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('feed');

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

  if (loading) {
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
    <div className="min-h-screen bg-background">
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
            <TabsList className="grid grid-cols-2 w-fit">
              <TabsTrigger value="feed" className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>Community Feed</span>
              </TabsTrigger>
              <TabsTrigger value="challenges" className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Active Challenges</span>
              </TabsTrigger>
            </TabsList>

            {user && activeTab === 'feed' && (
              <CreatePostModal />
            )}
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
                </div>
              </CardContent>
            </Card>

            {/* Posts Feed */}
            <div className="space-y-6">
              {posts.length > 0 ? (
                posts.map((post) => (
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