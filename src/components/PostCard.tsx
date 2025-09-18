import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Calendar, User } from 'lucide-react';
import { useCommunity } from '@/hooks/useCommunity';
import { CommentSection } from './CommentSection';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: {
    id: string;
    user_id: string;
    challenge_id?: string;
    content: string;
    image_url?: string;
    likes_count: number;
    comments_count: number;
    created_at: string;
    profiles: {
      display_name?: string;
      username?: string;
      avatar_url?: string;
    };
    challenges?: {
      title: string;
      category?: string;
    };
    user_liked?: boolean;
  };
}

export const PostCard = ({ post }: PostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const { toggleLike } = useCommunity();

  const displayName = post.profiles?.display_name || post.profiles?.username || 'Anonymous';
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

  const handleLike = () => {
    toggleLike(post.id);
  };

  return (
    <Card className="shadow-card mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.profiles?.avatar_url} />
              <AvatarFallback>
                <User className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-sm">{displayName}</div>
              <div className="text-xs text-muted-foreground flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {timeAgo}
              </div>
            </div>
          </div>
          {post.challenges && (
            <Badge variant="outline" className="text-xs">
              {post.challenges.category || 'Challenge'}
            </Badge>
          )}
        </div>
        {post.challenges && (
          <div className="text-sm text-muted-foreground">
            Challenge: {post.challenges.title}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          <p className="text-sm leading-relaxed">{post.content}</p>
          
          {post.image_url && (
            <div className="rounded-lg overflow-hidden">
              <img
                src={post.image_url}
                alt="Post image"
                className="w-full h-auto max-h-96 object-cover"
              />
            </div>
          )}

          <div className="flex items-center space-x-4 pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center space-x-2 ${
                post.user_liked ? 'text-red-500' : 'text-muted-foreground'
              }`}
            >
              <Heart 
                className={`w-4 h-4 ${post.user_liked ? 'fill-current' : ''}`} 
              />
              <span className="text-sm">{post.likes_count}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-muted-foreground"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{post.comments_count}</span>
            </Button>
          </div>

          {showComments && (
            <CommentSection postId={post.id} />
          )}
        </div>
      </CardContent>
    </Card>
  );
};