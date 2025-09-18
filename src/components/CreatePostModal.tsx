import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Image, Send } from 'lucide-react';
import { useCommunity } from '@/hooks/useCommunity';
import { useChallenges } from '@/hooks/useChallenges';
import { useToast } from '@/hooks/use-toast';

interface CreatePostModalProps {
  trigger?: React.ReactNode;
}

export const CreatePostModal = ({ trigger }: CreatePostModalProps) => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [selectedChallenge, setSelectedChallenge] = useState<string>('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { createPost } = useCommunity();
  const { challenges } = useChallenges();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please write something to share with the community.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    
    const success = await createPost(
      content.trim(),
      selectedChallenge || undefined,
      imageUrl.trim() || undefined
    );

    if (success) {
      toast({
        title: "Post created!",
        description: "Your post has been shared with the community."
      });
      
      // Reset form
      setContent('');
      setSelectedChallenge('');
      setImageUrl('');
      setOpen(false);
    } else {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive"
      });
    }

    setSubmitting(false);
  };

  const defaultTrigger = (
    <Button className="flex items-center space-x-2">
      <Plus className="w-4 h-4" />
      <span>Create Post</span>
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create a Community Post</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="content">What's on your mind?</Label>
            <Textarea
              id="content"
              placeholder="Share your progress, tips, or motivation..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] mt-2"
              disabled={submitting}
            />
          </div>

          <div>
            <Label>Related Challenge (Optional)</Label>
            <Select value={selectedChallenge} onValueChange={setSelectedChallenge}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select a challenge" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No specific challenge</SelectItem>
                {challenges.map((challenge) => (
                  <SelectItem key={challenge.id} value={challenge.id}>
                    {challenge.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="image">Image URL (Optional)</Label>
            <div className="flex items-center space-x-2 mt-2">
              <Image className="w-4 h-4 text-muted-foreground" />
              <Input
                id="image"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || submitting}
              className="flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Posting...' : 'Post'}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};