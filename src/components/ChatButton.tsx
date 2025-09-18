import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Users } from 'lucide-react';
import ChatWindow from './ChatWindow';
import { useDatabaseChat } from '@/hooks/useDatabaseChat';

interface ChatButtonProps {
  selectedUserId?: string;
  className?: string;
}

const ChatButton = ({ selectedUserId, className }: ChatButtonProps) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { connectedUsers } = useDatabaseChat();

  const totalUnreadCount = 0; // Simplified for now

  return (
    <>
      <Button
        onClick={() => setIsChatOpen(true)}
        className={className}
        variant="outline"
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        Chat
        {totalUnreadCount > 0 && (
          <Badge variant="destructive" className="ml-2 text-xs">
            {totalUnreadCount}
          </Badge>
        )}
      </Button>

      <ChatWindow
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        selectedUserId={selectedUserId}
      />
    </>
  );
};

export default ChatButton;
