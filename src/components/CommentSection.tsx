import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Send } from 'lucide-react';
import { useCommunity } from '@/hooks/useCommunity';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    display_name?: string;
    username?: string;
    avatar_url?: string;
  };
}

interface CommentSectionProps {
  postId: string;
}

export const CommentSection = ({ postId }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { fetchComments, addComment } = useCommunity();
  const { user } = useAuth();

  useEffect(() => {
    const loadComments = async () => {
      setLoading(true);
      const fetchedComments = await fetchComments(postId);
      setComments(fetchedComments);
      setLoading(false);
    };

    loadComments();
  }, [postId, fetchComments]);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return;

    setSubmitting(true);
    const success = await addComment(postId, newComment.trim());
    
    if (success) {
      setNewComment('');
      // Refresh comments
      const updatedComments = await fetchComments(postId);
      setComments(updatedComments);
    }
    
    setSubmitting(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  if (loading) {
    return (
      <div className="space-y-3 mt-4 pt-4 border-t">
        <div className="text-sm text-muted-foreground">Loading comments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-3 mt-4 pt-4 border-t">
      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {comments.map((comment) => {
            const displayName = comment.profiles?.display_name || 
                               comment.profiles?.username || 'Anonymous';
            const timeAgo = formatDistanceToNow(new Date(comment.created_at), { addSuffix: true });

            return (
              <div key={comment.id} className="flex space-x-3">
                <Avatar className="w-6 h-6 flex-shrink-0">
                  <AvatarImage src={comment.profiles?.avatar_url} />
                  <AvatarFallback>
                    <User className="w-3 h-3" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold">{displayName}</span>
                    <span className="text-xs text-muted-foreground">{timeAgo}</span>
                  </div>
                  <p className="text-sm text-foreground mt-1">{comment.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">No comments yet. Be the first to comment!</div>
      )}

      {/* Add Comment Form */}
      {user && (
        <div className="flex space-x-3">
          <Avatar className="w-6 h-6 flex-shrink-0">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback>
              <User className="w-3 h-3" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={handleKeyPress}
              className="min-h-[60px] text-sm resize-none"
              disabled={submitting}
            />
            <Button
              size="sm"
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || submitting}
              className="ml-auto flex items-center space-x-2"
            >
              <Send className="w-3 h-3" />
              <span>{submitting ? 'Posting...' : 'Post'}</span>
            </Button>
          </div>
        </div>
      )}

      {!user && (
        <div className="text-sm text-muted-foreground">
          Please log in to comment.
        </div>
      )}
    </div>
  );
};