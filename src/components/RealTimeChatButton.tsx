import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Wifi, WifiOff } from 'lucide-react';
import RealTimeChatWindow from './RealTimeChatWindow';
import { useRealTimeChat } from '@/hooks/useRealTimeChat';

interface RealTimeChatButtonProps {
  selectedUserId?: string;
  className?: string;
}

const RealTimeChatButton = ({ selectedUserId, className }: RealTimeChatButtonProps) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { connectedUsers, websocketConnected } = useRealTimeChat();

  const totalUnreadCount = 0; // Can be implemented later with unread message tracking

  return (
    <>
      <Button
        onClick={() => setIsChatOpen(true)}
        className={`relative ${className}`}
        variant="outline"
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        Chat
        {websocketConnected ? (
          <Wifi className="w-3 h-3 ml-2 text-green-500" />
        ) : (
          <WifiOff className="w-3 h-3 ml-2 text-red-500" />
        )}
        {totalUnreadCount > 0 && (
          <Badge variant="destructive" className="absolute -top-1 -right-1 text-xs">
            {totalUnreadCount}
          </Badge>
        )}
      </Button>
      <RealTimeChatWindow
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        selectedUserId={selectedUserId}
      />
    </>
  );
};

export default RealTimeChatButton;
